
import express from "express";
import upload from "../Middleware/multer.js";
import { createAd, getAds, deleteAd } from "../Controllers/adcontroller.js";
import { adminProtect } from "../Middleware/authmiddleware.js";

const router = express.Router();

router.post("/createads", upload.single("image"), createAd);
router.get("/getads",getAds);
router.delete("/delete/:id",adminProtect, deleteAd);

export default router;
