import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRouter from './routes/userRoute.js';

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

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});