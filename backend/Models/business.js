import mongoose from "mongoose";

const specificationSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  role: { type: String, default: "" },
  number: { type: String, default: "" },
});

const businessSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    images: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    googleMapUrl: { type: String, default: "" },
    specifications: {
      type: [specificationSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);
