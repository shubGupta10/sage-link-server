import express from 'express'
import { registerUser, loginUser, userProfile } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { rateLimiter } from '../middlewares/rateLimitMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post("/userprofile", authenticate, rateLimiter, userProfile);

export default userRouter;
