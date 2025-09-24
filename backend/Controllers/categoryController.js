import Category from "../Models/Category.js";

export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;

    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const total = await Category.countDocuments(query);

    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      categories,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updated = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
