import asyncHandler from "express-async-handler";
import Business from "../Models/business.js";
import User from "../Models/user.js";
import Ad from "../Models/Ad.js";
import cloudinary from "../config/cloudinary.js";
import business from "../Models/business.js";
import Contact from "../Models/contactform.js";
import nodemailer from "nodemailer";
import Category from "../Models/Category.js";
import BranchRegion from "../Models/branchRegion.js";

/* ===================== BUSINESS ===================== */

// Create new business
// your Cloudinary config



export const createaddBusiness = async (req, res) => {
  try {
    let {
      name,
      category,
      description,
      address,
      phone,
      email,
      website,
      googleMapUrl,
      specifications,
    } = req.body;

    if (typeof specifications === "string") {
      specifications = JSON.parse(specifications);
    }
    if (!name || !category) {
      return res.status(400).json({ message: "Name and category are required" });
    }
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized, user missing" });
    }
    let imageUrl = "";
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "business_images",
      });
      imageUrl = result.secure_url;
    }
    const newBusiness = new Business({
      user: userId,
      name,
      category,
      description: description || "",
      address: address || "",
      phone: phone || "",
      email: email || "",
      website: website || "",
      googleMapUrl: googleMapUrl || "",
      specifications: Array.isArray(specifications) ? specifications : [], 
      status: "pending",
      images: imageUrl ? [imageUrl] : [],
    });
    await newBusiness.save();
    res.status(201).json({
      message: "Business added successfully",
      business: newBusiness,
    });
  } catch (error) {
    console.error("Error adding business (user):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get businesses for logged-in user
export const getUserBusinesses = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Total count
  const total = await Business.countDocuments({ user: req.user._id });

  // Paginated data
  const businesses = await Business.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    businesses,
  });
});

// ✅ Update business (only allowed fields)
// export const updateBusiness = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // whitelist fields user can update
//     const allowedFields = [
//       "name",
//       "category",
//       "description",
//       "address",
//       "phone",
//       "email",
//     ];

//     const updates = {};
//     allowedFields.forEach((field) => {
//       if (req.body[field] !== undefined) {
//         updates[field] = req.body[field];
//       }
//     });

//     const updatedBusiness = await Business.findByIdAndUpdate(
//       id,
//       { $set: updates },
//       { new: true, runValidators: true }
//     );

//     if (!updatedBusiness) {
//       return res.status(404).json({ message: "Business not found" });
//     }

//     res.json(updatedBusiness);
//   } catch (error) {
//     console.error("Error updating business:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const updateBusiness = async (req, res) => {
  try {
    const { id } = req.params;

    // Whitelist fields user can update
    const allowedFields = [
      "name",
      "category",
      "description",
      "address",
      "phone",
      "email",
      "googleMapUrl",
      "specifications", 
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "specifications" && typeof req.body[field] === "string") {
          try {
            updates[field] = JSON.parse(req.body[field]);
          } catch (err) {
            return res.status(400).json({ message: "Invalid specifications format" });
          }
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json(updatedBusiness);
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Delete business
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const searchBusinesses = async (req, res) => {
  try {
    const { q, category, location, page = 1, limit = 10 } = req.query;

    const filter = { status: "approved" };
    const orConditions = [];

    if (q) {
      orConditions.push({ name: { $regex: q, $options: "i" } });
      orConditions.push({ description: { $regex: q, $options: "i" } });
    }

    if (location) {
      orConditions.push({ address: { $regex: location, $options: "i" } });
    }

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    // Convert pagination params to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Query with pagination
    const [businesses, total] = await Promise.all([
      Business.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
      Business.countDocuments(filter),
    ]);

    res.json({
      businesses,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error in searchBusinesses:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* ===================== PROFILE ===================== */

// Get logged-in user's profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// Update logged-in user's profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow these fields
  const allowed = ["name", "email", "phone", "address", "location", "bio"];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  const updated = await user.save({ validateBeforeSave: false });

  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    address: updated.address,
    location: updated.location,
    bio: updated.bio,
  });
});

//  get ads

export const getAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getAllBusiness = async (req, res) => {
  try {
    const businesses = await business.find();
    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getBusinessesByCategory = async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    const businesses = await Business.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
      status: "approved",
    }).sort({ createdAt: -1 });

    res.status(200).json(businesses);
  } catch (error) {
    console.error("Error fetching businesses by category:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getBusinessId = async (req, res) => {
  const { id } = req.params;
  try {
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(business);
  } catch (error) {
    console.error("Error fetching business by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newContact.save();

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact Form Submission: ${subject}`,
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: #2563eb; color: white; padding: 16px; text-align: center;">
        <h1 style="margin: 0; font-size: 20px;">New Contact Submission</h1>
      </div>
      <div style="padding: 20px; color: #111827;">
        <p style="margin: 0 0 10px 0;"><b>Name:</b> ${name}</p>
        <p style="margin: 0 0 10px 0;"><b>Email:</b> ${email}</p>
        <p style="margin: 0 0 10px 0;"><b>Phone:</b> ${phone}</p>
        <p style="margin: 0 0 10px 0;"><b>Subject:</b> ${subject}</p>
        <p style="margin: 0 0 10px 0;"><b>Message:</b></p>
        <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; color: #374151; font-style: italic;">
          ${message}
        </div>
      </div>
      <div style="background: #f3f4f6; padding: 12px; text-align: center; color: #6b7280; font-size: 12px;">
        <p style="margin: 0;">📬 This message was sent from your website contact form.</p>
      </div>
    </div>
  `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Contact saved & email sent successfully",
      contact: newContact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// get all  category
export const getCategories = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const categories = await Category.find(query).sort({ createdAt: -1 });
    res.json({
      categories,
      totalItems: categories.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get all branch regions
export const getBranchRegions = async (req, res) => {
  try {
    const regions = await BranchRegion.find();
    res.status(200).json(regions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
