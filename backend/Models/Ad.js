// models/Ad.js
import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  imageUrl: { type: String, required: true }, 
  publicId:{type:String} 
}, { timestamps: true });

export default mongoose.model("Ad", adSchema);
