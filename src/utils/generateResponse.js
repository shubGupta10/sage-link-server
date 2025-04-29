import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

export async function generateResponse(userResponse, transcriptData) {
    try {
        // Convert array of transcript chunks into one plain text transcript
        const transcriptText = Array.isArray(transcriptData)
            ? transcriptData.map(chunk => chunk.text).join(' ')
            : transcriptData;

        const prompt = `You are an assistant that answers based only on the information provided in the transcript of a YouTube video.

Transcript:
${transcriptText}

Question:
${userResponse}

Answer in a concise, clear way as if you're explaining exactly what was said in the video. If the answer isn't clearly found in the transcript, say "I couldn't find that information in the video."`;

        const result = await model.generateContent(prompt);
        const recipe = result.response.text ? result.response.text() : result.response;

        return recipe;
    } catch (error) {
        console.error("Error generating response:", error);
        return "Internal server error";
    }
}
