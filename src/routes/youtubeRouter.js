import express from 'express'
import { chatWithLink, getYoutubeVideoURL } from '../controllers/youtubeRouter.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const youtubeRouter = express.Router();

youtubeRouter.post("/get-transcript", authenticate ,getYoutubeVideoURL);
youtubeRouter.post("/chat-with-link", authenticate, chatWithLink);

export default youtubeRouter;