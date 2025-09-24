import Ad from "../Models/Ad.js";
import { v2 as cloudinary } from "cloudinary";



// create api
export const createAd = async (req, res) => {
  try {
    const { title, date } = req.body;
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    // Upload to cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "ads",
    });

    const newAd = await Ad.create({
      title,
      date,
      imageUrl: uploadResult.secure_url,   
      publicId: uploadResult.public_id,   
    });

    res.status(201).json(newAd);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// ✅ Get Ads
export const getAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Delete Ad + Cloudinary image
export const deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    if (ad.publicId) {
      await cloudinary.uploader.destroy(ad.publicId);
    }

    await ad.deleteOne();

    res.json({ message: "Ad deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
