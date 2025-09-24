import mongoose from "mongoose";

const branchSubSchema = new mongoose.Schema({
  city: { type: String, required: true },
  address: { type: String, required: true },
  phones: [{ type: String, required: true }],
  email: { type: String },
});

const branchSchema = new mongoose.Schema(
  {
    branches: [branchSubSchema], 
  },
  { timestamps: true }
);

const BranchRegion = mongoose.model("BranchRegion", branchSchema);

export default BranchRegion;

