import express from "express";
import {
  createBranchRegion,
  getBranchRegions,
  updateBranchRegion,
  deleteBranchRegion,
} from "../Controllers/branchController.js";

import { adminProtect } from "../Middleware/authmiddleware.js";

const router = express.Router();

router.post("/create", adminProtect, createBranchRegion);

router.get("/get", adminProtect, getBranchRegions);

router.put("/:id", adminProtect, updateBranchRegion);

router.delete("/:id", adminProtect, deleteBranchRegion);

export default router;
