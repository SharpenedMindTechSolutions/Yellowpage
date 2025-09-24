import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../Controllers/categoryController.js";
import { adminProtect } from "../Middleware/authmiddleware.js";
const router = express.Router();

router.get("/get-category", adminProtect, getCategories);
router.post("/create-category", adminProtect, createCategory);
router.put("/:id", adminProtect, updateCategory);
router.delete("/:id", adminProtect, deleteCategory);

export default router;
