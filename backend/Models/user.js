import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },

    // roles / status
    role: { type: String, default: "user" },
    status: { type: String, enum: ["Active", "Inactive", "Blocked"], default: "Active" },

    // public id
    userId: { type: String, unique: true },

    // profile fields (✅ these were missing)
    address: { type: String, default: "" },
    location: { type: String, default: "" },
    bio: { type: String, default: "" },

    // reset
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

// hash password if changed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// generate simple userId
userSchema.pre("save", async function (next) {
  if (!this.userId) this.userId = "USR" + Date.now();
  next();
});

export default mongoose.model("User", userSchema);
