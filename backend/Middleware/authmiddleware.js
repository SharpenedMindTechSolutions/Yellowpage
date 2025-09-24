import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../Models/user.js";
import Admin from "../Models/admin.js";

// user protect
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("User not found, authorization denied");
    }
    req.user = user;
    next();
  } catch (e) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

// admin protect
// export const adminProtect = asyncHandler(async (req, res, next) => {
//   let token;
//   if (req.headers.authorization?.startsWith("Bearer ")) {
//     token = req.headers.authorization.split(" ")[1];
//   }
//   if (!token) {
//     res.status(401);
//     throw new Error("Not authorized, no token");
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const admin = await Admin.findById(decoded.id).select("-password");
//     if (!admin) {
//       res.status(401);
//       throw new Error("Admin not found, authorization denied");
//     }
//     req.admin = admin;
//     next();
//   } catch (e) {
//     res.status(401);
//     throw new Error("Not authorized, token failed");
//   }
// });
export const adminProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support both id and _id depending on how you signed the token
    const admin = await Admin.findById(decoded.id || decoded._id).select("-password");

    if (!admin) {
      res.status(401);
      throw new Error("Admin not found, authorization denied");
    }

    req.admin = admin;
    next();
  } catch (e) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});