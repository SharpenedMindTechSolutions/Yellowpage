import User from "../Models/user.js";
import Admin from "../Models/admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register controller
export const registerUser = async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;
  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ msg: "All fields are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ msg: "Email already registered" });

  const user = await User.create({ name, email, phone, password });
  const token = generateToken(user._id);

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: user.password,
    },
    token,
    msg: "User registered successfully",
  });
};

// Login controller
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ msg: "Email and password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ msg: "Invalid email or password" });

  const token = generateToken(user._id);

  res.json({
    user: {
      id: user._id,
      name: user.name,
    },
    token,
    msg: "User login successfully",
  });
};

//forgotPassword controller

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: "User not found" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
    <h2 style="color: #333;">🔐 Reset Your Password</h2>
    <p style="font-size: 15px; color: #555;">
      Hello,
    </p>
    <p style="font-size: 15px; color: #555;">
      We received a request to reset your password. Click the button below to choose a new password. This link is valid for the next <strong>15 minutes</strong>.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background-color: #007BFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Reset Password
      </a>
    </div>

    <p style="font-size: 14px; color: #888;">
      If you didn’t request a password reset, you can safely ignore this email.
    </p>

    <hr style="margin: 30px 0;" />
    <p style="font-size: 12px; color: #aaa; text-align:center;">
      © ${new Date().getFullYear()} Yellowpages. All rights reserved.
    </p>
  </div>
`;

  await sendEmail(user.email, "Reset Password Link", html);

  res.json({ msg: "Password reset link sent to email" });
};

// resetPassword controller

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      _id: decoded.id,
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save(); // will hash password here

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(400).json({ msg: "Invalid or expired token" });
  }
};

// Admin registration and login controllers

export const registerAdmin = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  const existing = await Admin.findOne({ email });
  if (existing) return res.status(400).json({ msg: "Email already in use" });

  const admin = await Admin.create({ fullName, email, password });
  const token = generateToken(admin._id);

  res.status(201).json({
    admin: {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
    },
    token,
  });
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(400).json({ msg: "Invalid email or password" });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch)
    return res.status(400).json({ msg: "Invalid email or password" });

  const token = generateToken(admin._id);

  res.json({
    admin: {
      id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
    },
    token,
  });
};
