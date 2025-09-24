import express from "express";
import {
  createaddBusiness,
  getUserBusinesses,
  getUserProfile,
  updateUserProfile,
  getAds,
  deleteBusiness,
  updateBusiness,
  searchBusinesses,
  getAllBusiness,
  getBusinessesByCategory,
  getBusinessId,
  createContact,getCategories,
  getBranchRegions
} from "../Controllers/usercontroller.js";
import { protect } from "../Middleware/authmiddleware.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });
const router = express.Router();

/* USER ROUTES */
router.post(
  "/create-business",
  protect,
  upload.single("image"),
  createaddBusiness
);
router.get("/businesses", protect, getUserBusinesses);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/business/:id", protect, updateBusiness);
router.delete("/business/:id", protect, deleteBusiness);
router.get("/getads", getAds);

router.get("/search", searchBusinesses);
router.get("/getall-business", getAllBusiness);
router.get("/getall-category", getBusinessesByCategory);
router.get("/get-categorybusiness/:id", getBusinessId);
router.post("/contactform",createContact);
router.get("/business/:id",getBusinessId);
router.get("/get-category", getCategories);
router.get("/get-branch", getBranchRegions)

export default router;
