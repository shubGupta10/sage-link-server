import express from 'express'
import { chatWithLink, getYoutubeVideoURL } from '../controllers/youtubeRouter.js';

const youtubeRouter = express.Router();

youtubeRouter.post("/get-transcript", getYoutubeVideoURL);
youtubeRouter.post("/chat-with-link", chatWithLink);

export default youtubeRouter;