import redisClient from '../config/redis.js';
import { extractVideoId } from '../utils/extractVideoId.js';
import { v4 as uuidv4 } from 'uuid'
import { generateResponse } from '../utils/generateResponse.js';
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";

export async function getYoutubeVideoURL(req, res) {
  try {
    const { videoURL, userId } = req.body;

    if (!videoURL || !userId) {
      return res.status(400).json({ message: "Video URL and User ID are required" });
    }

    // Extract video ID from the URL
    const videoId = extractVideoId(videoURL);
    if (!videoId) {
      return res.status(400).json({ message: "Invalid video URL" });
    }

    // Load YouTube video transcript and metadata using LangChain
    let docs;
    try {
      const loader = YoutubeLoader.createFromUrl(videoURL, {
        language: "en",  // Set the language for the transcript
        addVideoInfo: true,  // Include video info like title, description, etc.
      });

      // Load the transcript and video metadata
      docs = await loader.load();
      if (!docs || docs.length === 0) {
        throw new Error("Transcript not available");
      }

    } catch (err) {
      console.warn("Error fetching transcript with LangChain:", err);
      return res.status(404).json({ message: "Transcript not available or video is restricted." });
    }

    // Prepare data for Redis caching
    const transcriptId = uuidv4();
    const redisKey = `transcript:${userId}:${videoId}`;

    const dataStore = {
      userId,
      videoId,
      transcriptId,
      transcript: docs,
      createdAt: new Date().toISOString(),
    };

    // Store transcript in Redis with an expiration time of 1 hour
    await redisClient.set(redisKey, JSON.stringify(dataStore), { ex: 3600 });

    // Send success response
    return res.status(200).json({
      message: "Transcript fetched successfully",
      transcript: docs,
      transcriptId,
      videoId,
      userId,
    });

  } catch (error) {
    console.error("Error fetching YouTube video URL:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function chatWithLink(req, res) {
  try {
    const { userId, videoId, userResponse } = req.body;

    if (!userId || !videoId || !userResponse) {
      return res.status(400).json({ message: "User ID, Video ID, and User Response are required" });
    }

    // Construct Redis key and fetch transcript
    const redisKey = `transcript:${userId}:${videoId}`;
    const transcriptData = await redisClient.get(redisKey);

    if (!transcriptData) {
      return res.status(404).json({ message: "Transcript not found" });
    }

    const transcriptObj = transcriptData;


    // Generate AI response
    const response = await generateResponse(userResponse, transcriptObj.transcript[0].pageContent);
    return res.status(200).json({ message: "Response generated successfully", response });

  } catch (error) {
    console.error("Error in chat with link:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
