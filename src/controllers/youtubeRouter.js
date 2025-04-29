import {YoutubeTranscript} from 'youtube-transcript'
import redisClient from '../config/redis.js';
import { extractVideoId } from '../utils/extractVideoId.js';
import {v4 as uuidv4} from 'uuid'
import { generateResponse } from '../utils/generateResponse.js';
import { translateToEnglish } from '../utils/translateToEnglish.js';

export async function getYoutubeVideoURL(req, res) {
    try {
      const { videoURL, userId } = req.body;
  
      if (!videoURL || !userId) {
        return res.status(400).json({ message: "Video URL and User ID are required" });
      }
  
      const videoId = extractVideoId(videoURL);
      if (!videoId) {
        return res.status(400).json({ message: "Invalid video URL" });
      }
  
      // Try fetching English transcript first
      let transcript;
      try {
        transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en', autoCorrect: true });
      } catch (err) {
        console.warn("English transcript not found, trying Hindi...");
        const hindiTranscript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'hi' });
        const translated = await Promise.all(
          hindiTranscript.map(async (item) => {
            const translatedText = await translateToEnglish(item.text);
            return { ...item, text: translatedText };
          })
        );
        transcript = translated;
      }
  
      if (!transcript || transcript.length === 0) {
        return res.status(404).json({ message: "Transcript not found" });
      }
  
      const transcriptId = uuidv4();
      const redisKey = `transcript:${userId}:${videoId}`;
  
      const dataStore = {
        userId,
        videoId,
        transcriptId,
        transcript,
        createdAt: new Date().toISOString()
      };
  
      await redisClient.set(redisKey, JSON.stringify(dataStore), 'EX', 3600);
  
      return res.status(200).json({
        message: "Transcript fetched successfully",
        transcript,
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

        const transcriptObj = JSON.parse(transcriptData);
        

        // Generate AI response
        const response = await generateResponse(userResponse, transcriptObj.transcript);
        return res.status(200).json({ message: "Response generated successfully", response });

    } catch (error) {
        console.error("Error in chat with link:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
