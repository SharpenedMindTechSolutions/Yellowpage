import BranchRegion from "../Models/branchRegion.js";

export const createBranchRegion = async (req, res) => {
  try {
    const { branches } = req.body;
    const newBranchRegion = new BranchRegion({ branches });
    await newBranchRegion.save();
    res.status(201).json(newBranchRegion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBranchRegions = async (req, res) => {
  try {
    const regions = await BranchRegion.find();
    res.status(200).json(regions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBranchRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const updatedRegion = await BranchRegion.findByIdAndUpdate(
      id,
      updatedData,
      { new: true } // return updated document
    );
    if (!updatedRegion) return res.status(404).json({ message: "Not found" });
    res.status(200).json(updatedRegion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBranchRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRegion = await BranchRegion.findByIdAndDelete(id);
    if (!deletedRegion) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "BranchRegion deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
