import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Blocked"],
      default: "Active",
    },
    gender: { type: String, default: null },
    dob: { type: Date, default: null },
    location: { type: String, default: null },
    profilePic: { type: String, default: null },
    phone: { type: String, default: null },
    userId: { type: String, unique: true },
  },
  { timestamps: true }
);

// Hash password before save
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.pre("save", async function (next) {
  if (!this.userId) {
    this.userId = "ADM" + Date.now();
  }
  next();
});

export default mongoose.model("Admin", adminSchema);
