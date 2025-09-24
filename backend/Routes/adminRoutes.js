import express from "express";
import multer from "multer";
import path from "path";
import {
  getAllUsers,
  blockUser,
  UnblockUser,
  exportUsersExcel,
  getAdminProfile,
  updateAdminProfile,
  deleteBusiness,
  updateBusiness,
  addBusiness,
  getCategoryCounts,
  getDashboardStats,
  getRecentBusinesses,
  getAllBusinesses,
  exportBusinesses,
  updateBusinessStatus,
} from "../Controllers/admincontroller.js";



import { adminProtect } from "../Middleware/authmiddleware.js";

const router = express.Router();

// ✅ Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Admin Routes
router.get("/users", adminProtect, getAllUsers);
router.put("/users/:id/block", adminProtect, blockUser);
router.put("/users/:id/unblock", adminProtect, UnblockUser);
router.get("/users/export/excel", adminProtect, exportUsersExcel);

// ✅ Admin profile routes
router.get("/profile/:id", adminProtect, getAdminProfile);
router.put("/profile/:id", upload.single("profilePic"), updateAdminProfile);

// ✅ customer category count route
router.get("/business/category-counts", adminProtect, getCategoryCounts);

// ✅ dashboard stats and count
router.get("/dashboard/count", adminProtect, getDashboardStats);
router.get("/dashboard/recent-businesses", adminProtect, getRecentBusinesses);

// business list for admin
router.get("/all-business", adminProtect, getAllBusinesses);
router.get("/all-business/export/excel", adminProtect, exportBusinesses);
router.post(
  "/create-business",
  upload.single("image"),
  adminProtect,
  addBusiness
);
router.put(
  "/business/:id",
  adminProtect,
  upload.single("image"),
  updateBusiness
);
router.delete("/business/:id", adminProtect, deleteBusiness);
router.put("/business/:id/status", adminProtect, updateBusinessStatus);


export default router;
