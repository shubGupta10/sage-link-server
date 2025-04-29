import express from 'express'
import { uploadDocument, getChatDocResponse } from '../controllers/chatDocController.js'
import { authenticate } from '../middlewares/authMiddleware.js';
import { rateLimiter } from '../middlewares/rateLimitMiddleware.js';

const chatdocRouter = express.Router();

chatdocRouter.post('/upload-document', authenticate, rateLimiter ,uploadDocument);
chatdocRouter.post('/chat-with-doc', authenticate, getChatDocResponse);

export default chatdocRouter;