import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'

export async function registerUser(req, res) {
    try {
        const { name, email, username, password } = req.body;
        if (!name || !email || !username || !password) {
            return res.status(400).json({ message: "Please fill all the fields" })
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        //check username uniquness
        const existingUsername = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Email must be valid" });
        }


        if (username.length > 15) {
            return res.status(400).json({ message: "Username must be less than 15 characters" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                username,
                password: hashedPassword,
            }
        })

        return res.status(201).json({ message: "User created successfully", user })

    } catch (error) {

        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export async function loginUser(req, res){
    try {
        const {username, email, password} = req.body;
        if(!username && !email) {
            return res.status(400).json({message: "Please provide username or email"})
        }
        if(!password) {
            return res.status(400).json({message: "Please provide password"})
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    {username: username},
                    {email: email}
                ]
            }
        })

        if(!user) {
            return res.status(400).json({message: "User not found"})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(400).json({message: "Invalid password"})
        }

        const payload = {
            id: user.id,
            email: user.email,
            username: user.username
        }

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1d"})
        const refreshToken = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: "30d"})

        //save refreshToken to database
        await prisma.token.upsert({
            where: {
              userId: user.id,
            },
            update: {
              refreshToken: refreshToken,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
            create: {
              userId: user.id,
              refreshToken: refreshToken,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });

          res.setHeader("Authorization", `Bearer ${accessToken}`)

          return res.status(200).json({
            accessToken,
            refreshToken,
            message: "Login successful",
          })

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export async function userProfile(req, res){
    try {
        const {userId} = req.body;
        if(!userId){
            return res.status(400).json({message: "UserId not found"})
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user) {
            return res.status(400).json({message: "User not found"})
        }

        return res.status(200).json({message: "User found", user})
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}