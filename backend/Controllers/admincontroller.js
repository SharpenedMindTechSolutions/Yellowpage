import User from "../Models/user.js";
import Admin from "../Models/admin.js";
import multer from "multer";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import Business from "../Models/business.js";
import cloudinary from "../config/cloudinary.js";

// --------------------------------------------------------------------------------------------------------

//  user Management  - get all users (both users and admins)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    const admins = await Admin.find();

    const allUsers = [
      ...users.map((u) => ({
        id: u._id,
        userId: u.userId,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: "User",
        status: u.status,
        joined: u.createdAt,
      })),
      ...admins.map((a) => ({
        id: a._id,
        userId: a.userId,
        name: a.FullName,
        email: a.email,
        phone: a.phone,
        role: "Admin",
        status: a.status,
        joined: a.createdAt,
      })),
    ];

    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const blockUser = async (req, res) => {
  try {
    const entityId = req.params.id;
    let entity = null;
    let entityType = null;

    if (entityId.match(/^[0-9a-fA-F]{24}$/)) {
      entity = await User.findById(entityId);
      entityType = "User";
    }
    if (!entity) {
      entity = await Admin.findById(entityId);
      entityType = "Admin";
    }
    if (!entity) {
      return res.status(404).json({ message: "User/Admin not found" });
    }

    entity.status = "Blocked";
    await entity.save();

    res.json({
      message: `${entityType} blocked successfully`,
      [entityType.toLowerCase()]: entity,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const UnblockUser = async (req, res) => {
  try {
    const entityId = req.params.id;
    let entity = null;
    let entityType = null;

    if (entityId.match(/^[0-9a-fA-F]{24}$/)) {
      entity = await User.findById(entityId);
      entityType = "User";
    }
    if (!entity) {
      entity = await Admin.findById(entityId);
      entityType = "Admin";
    }
    if (!entity) {
      return res.status(404).json({ message: "User/Admin not found" });
    }

    entity.status = "Active";
    await entity.save();

    res.json({
      message: `${entityType} Active successfully`,
      [entityType.toLowerCase()]: entity,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const exportUsersExcel = async (req, res) => {
  try {
    const users = await User.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    // Add headers
    worksheet.columns = [
      { header: "Name", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Role", key: "role", width: 15 },
      { header: "Status", key: "status", width: 15 },
    ];

    // Add rows
    users.forEach((user) => {
      worksheet.addRow({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------------------------------------------------------------------

// admin profile update controller with multer for image upload

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({ storage }).single("profilePic");

// GET Admin by ID
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({
      fullName: admin.fullName || "",
      email: admin.email || "",
      phone: admin.phone || "",
      role: admin.role || "",
      status: admin.status || "",
      dob: admin.dob ? admin.dob.toISOString().split("T")[0] : "",
      gender: admin.gender || "",
      location: admin.location || "",
      profilePic: admin.profilePic || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// UPDATE Admin by ID
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const fields = [
      "fullName",
      "email",
      "phone",
      "gender",
      "dob",
      "company",
      "location",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        admin[field] = req.body[field];
      }
    });

    if (req.file) {
      if (admin.profilePic) {
        const oldPicPath = path.join(uploadDir, admin.profilePic);
        if (fs.existsSync(oldPicPath)) fs.unlinkSync(oldPicPath);
      }

      admin.profilePic = req.file.filename;
    }

    await admin.save();

    // Return only allowed fields
    const {
      fullName,
      email,
      phone,
      gender,
      dob,
      company,
      location,
      profilePic,
      role,
      status,
    } = admin;

    res.json({
      message: "Profile updated successfully",
      admin: {
        fullName,
        email,
        phone,
        gender,
        dob,
        company,
        location,
        profilePic,
        role,
        status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Add New Business (Admin)
export const addBusiness = async (req, res) => {
  try {
    let {
      name,
      category,
      description,
      address,
      phone,
      status,
      email,
      googleMapUrl,
      specifications, 
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }

    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "business_logos",
      });
      imageUrl = result.secure_url;
    }

    const adminId = req.admin?._id;
    if (!adminId) {
      return res.status(401).json({ message: "Not authorized, admin missing" });
    }

    // 🔹 Parse specifications if it is a string
    if (specifications && typeof specifications === "string") {
      try {
        specifications = JSON.parse(specifications);
      } catch (err) {
        specifications = [];
      }
    }

    const newBusiness = new Business({
      user: adminId,
      name,
      category,
      description: description || "",
      address: address || "",
      phone: phone || "",
      email: email || "",
      status: status || "pending",
      images: imageUrl ? [imageUrl] : [],
      googleMapUrl: googleMapUrl || "",
      specifications: Array.isArray(specifications) ? specifications : [],
    });

    await newBusiness.save();

    res.status(201).json({
      message: "Business added successfully",
      business: newBusiness,
    });
  } catch (error) {
    console.error("Error adding business:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Delete Business by ID (Admin)
export const deleteBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const business = await Business.findById(id);

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    await Business.findByIdAndDelete(id);

    res.json({ message: "Business deleted successfully" });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Business by ID (Admin)
export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // ✅ If new image uploaded, replace
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "business_logos",
      });
      updates.images = [result.secure_url];
    }

    // ✅ Parse specifications if sent as JSON string
    if (updates.specifications && typeof updates.specifications === "string") {
      try {
        updates.specifications = JSON.parse(updates.specifications);
      } catch (err) {
        console.warn("Failed to parse specifications:", err);
        updates.specifications = [];
      }
    }

    // ✅ Update business fields including googleMapUrl
    Object.keys(updates).forEach((key) => {
      business[key] = updates[key];
    });

    await business.save();

    res.json({ message: "Business updated successfully", business });
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateBusinessStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    business.status = status;
    await business.save();

    return res.status(200).json({
      message: "Business status updated successfully",
      business,
    });
  } catch (error) {
    console.error("Error updating business status:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------------------------------------------
// customer category count

export const getCategoryCounts = async (req, res) => {
  try {
    const counts = await Business.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json(counts);
  } catch (error) {
    console.error("Error fetching category counts:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// -----------------------------------------------------------------------------
// 1. Dashboard Stats API
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBusinesses = await Business.countDocuments();
    const approvedBusinesses = await Business.countDocuments({
      status: "approved",
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBusinesses,
        approvedBusinesses,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// 2. Recent Businesses API
export const getRecentBusinesses = async (req, res) => {
  try {
    const recent = await Business.find(
      {},
      "name category title status images createdAt"
    )
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      recent,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// ------------------------------------------------------------------------------------

// business listing - pagination

// ✅ business listing - pagination + filters
export const getAllBusinesses = async (req, res) => {
  try {
    let { page = 1, limit = 10, status, category, search } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    // 🔹 Apply status filter
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    // 🔹 Apply category filter
    if (category && category.trim() !== "") {
      filter.category = category;
    }

    // 🔹 Apply search filter (name, email, description, address, phone)
    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Business.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const businesses = await Business.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ businesses, totalPages, currentPage: page, total });
  } catch (err) {
    console.error("Error fetching businesses:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const exportBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().lean();

    if (!businesses || businesses.length === 0) {
      return res.status(404).json({ message: "No businesses found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Businesses");

    // Define columns
    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 20 },
      { header: "Description", key: "description", width: 40 },
      { header: "Address", key: "address", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Created At", key: "createdAt", width: 25 },
    ];

    // Add rows
    businesses.forEach((b) => {
      worksheet.addRow({
        name: b.name,
        category: b.category,
        description: b.description,
        address: b.address,
        status: b.status,
        createdAt: b.createdAt ? new Date(b.createdAt).toLocaleString() : "N/A",
      });
    });

    // Styling headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: "center" };

    // Send as response
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=businesses.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
