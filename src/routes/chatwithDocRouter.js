import express from 'express'
import { uploadDocument, getChatDocResponse } from '../controllers/chatDocController.js'
import { authenticate } from '../middlewares/authMiddleware.js';

const chatdocRouter = express.Router();

chatdocRouter.post('/upload-document', authenticate, uploadDocument);
chatdocRouter.post('/chat-with-doc', authenticate, getChatDocResponse);

export default chatdocRouter;