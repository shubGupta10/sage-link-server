import redisClient from "../config/redis.js";
import { generateResponseWithDocument } from "../utils/generateResponse.js";
import { parsePDF } from "../utils/parsePDF.js";
import crypto from "crypto";
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export async function uploadDocument(req, res) {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: "Error uploading file." });
        }

        try {
            const file = req.file;
            const {userId} = req.body; 

            if (!file) {
                return res.status(400).json({ error: "File is required." });
            }

            const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

            const text = await parsePDF(file.buffer);
            if (!text) {
                return res.status(400).json({ error: "Failed to parse PDF." });
            }

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
                userId: userId,
            });
        } catch (error) {
            console.error("Error uploading document:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    });
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
