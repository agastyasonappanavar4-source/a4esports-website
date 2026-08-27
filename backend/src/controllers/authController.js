import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// SIGNUP
export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username or Email already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const isProduction = process.env.NODE_ENV === "production" || process.env.FRONTEND_URL?.includes("a4esports.in");
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// LOGOUT
export const logout = (req, res) => {
    const isProduction = process.env.NODE_ENV === "production" || process.env.FRONTEND_URL?.includes("a4esports.in");
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });

    res.json({
        success: true,
        message: "Logged out successfully.",
    });
};

// CURRENT USER
export const getCurrentUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                username: true,
                email: true,
                isAdmin: true,
                inGameName: true,
                uid: true,
                avatar: true,
                phone: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// GOOGLE LOGIN / SIGNUP
export const googleLogin = async (req, res) => {
    try {
        const { email, name, googleId, avatar } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Google account email is required.",
            });
        }

        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Generate unique username from name or email
            const baseUsername = (name || email.split("@")[0]).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            let username = baseUsername || "player";
            const existingName = await prisma.user.findUnique({ where: { username } });
            if (existingName) {
                username = `${username}_${Math.floor(1000 + Math.random() * 9000)}`;
            }

            const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);

            user = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: dummyPassword,
                    googleId: googleId || null,
                    avatar: avatar || null,
                },
            });
        } else if (googleId && !user.googleId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId, avatar: avatar || user.avatar },
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const isProduction = process.env.NODE_ENV === "production" || process.env.FRONTEND_URL?.includes("a4esports.in");
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            success: true,
            message: "Google Sign-In successful.",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                inGameName: user.inGameName,
                uid: user.uid,
                avatar: user.avatar,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to authenticate with Google.",
        });
    }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email.",
            });
        }

        // Generate 6-digit reset code
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });

        res.json({
            success: true,
            message: "Password reset code generated.",
            resetToken, // Returned so user can reset easily on frontend
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required.",
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Account not found.",
            });
        }

        if (resetToken && user.resetToken !== resetToken) {
            return res.status(400).json({
                success: false,
                message: "Invalid reset code.",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        res.json({
            success: true,
            message: "Password reset successfully. You can now login.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to reset password.",
        });
    }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { username, inGameName, uid, avatar, phone, currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        const updateData = {};

        if (username && username !== user.username) {
            const existingUsername = await prisma.user.findUnique({
                where: { username },
            });
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: "Username is already taken.",
                });
            }
            updateData.username = username;
        }

        if (inGameName !== undefined) updateData.inGameName = inGameName;
        if (uid !== undefined) updateData.uid = uid;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (phone !== undefined) updateData.phone = phone;

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is required to set a new password.",
                });
            }
            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) {
                return res.status(400).json({
                    success: false,
                    message: "Incorrect current password.",
                });
            }
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                isAdmin: true,
                inGameName: true,
                uid: true,
                avatar: true,
                phone: true,
            },
        });

        res.json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile.",
        });
    }
};

// Get Current User (unused directly by routes, kept for compatibility)
export const getMe = async (req, res) => {
    try {
        let token = req.cookies.token;

        if (!token && req.headers.authorization) {
            const parts = req.headers.authorization.split(" ");
            if (parts.length === 2 && parts[0] === "Bearer") {
                token = parts[1];
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not logged in.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                email: true,
                isAdmin: true,
                inGameName: true,
                uid: true,
                avatar: true,
                phone: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);

        res.status(401).json({
            success: false,
            message: "Invalid token.",
        });
    }
};