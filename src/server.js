import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRouter from './routes/userRoute.js';
import youtubeRouter from './routes/youtubeRouter.js';
import chatdocRouter from './routes/chatwithDocRouter.js';

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use("/api/users", userRouter);
app.use("/api/youtube", youtubeRouter);
app.use("/api/chatdoc", chatdocRouter)

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});