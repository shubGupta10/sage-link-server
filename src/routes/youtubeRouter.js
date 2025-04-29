import express from 'express'
import { chatWithLink, getYoutubeVideoURL } from '../controllers/youtubeRouter.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { rateLimiter } from '../middlewares/rateLimitMiddleware.js';

const youtubeRouter = express.Router();

youtubeRouter.post("/get-transcript", authenticate , rateLimiter, getYoutubeVideoURL);
youtubeRouter.post("/chat-with-link", authenticate, chatWithLink);

export default youtubeRouter;