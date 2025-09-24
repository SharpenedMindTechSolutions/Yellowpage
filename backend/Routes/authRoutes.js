import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  registerAdmin,
  loginAdmin,
} from "../Controllers/authcontroller.js";

const router = express.Router();

// user authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// assume admin routes are similar
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
export default router;
