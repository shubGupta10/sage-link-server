import express from 'express'
import { registerUser, loginUser, userProfile } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get("/userprofile", authenticate, userProfile);

export default userRouter;
