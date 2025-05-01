import redisClient from "../config/redis.js";
import { generateResponseWithDocument } from "../utils/generateResponse.js";
import crypto from "crypto";

export async function uploadDocument(req, res) {
    try {
        const { text, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        if (!text) {
            return res.status(400).json({ error: "File text is required." });
        }

        const fileHash = crypto.createHash('sha256').update(text).digest('hex');

        const redisKey = `document:${fileHash}:${userId}`;
        const documentData = {
            userId,
            text,
            createdAt: new Date().toISOString(),
        };

        await redisClient.set(redisKey, JSON.stringify(documentData), { ex: 60 * 60 * 24 * 7 });

        return res.status(200).json({
            message: "Document uploaded successfully.",
            fileId: fileHash,
            userId,
        });
    } catch (error) {
        console.error("Error uploading document:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}


export async function getChatDocResponse(req, res) {
    try {
        const { fileId, userId, message } = req.body;

        if (!fileId || !userId || !message) {
            return res.status(400).json({ error: "File ID, User ID, and message are required." });
        }

        const redisKey = `document:${fileId}:${userId}`;
        const documentData = await redisClient.get(redisKey);

        if (!documentData) {
            return res.status(404).json({ error: "Document not found." });
        }

        const parsedData = JSON.parse(documentData);
        const response = await generateResponseWithDocument(parsedData.text, message);

        return res.status(200).json({
            message: "Response generated successfully.",
            response,
        });
    } catch (error) {
        console.error("Error generating response:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
}
