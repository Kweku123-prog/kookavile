import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/Auth/userModel.js";
import Category from "../../models/Auth/categoriesModel.js"; // 👈 import category model

export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      description,
      specialties,
      experienceYears,
      profileImage,
      categories,
      documentsUpload,
      verified,
      phoneNumber,
      paymentDetails,
      availableBalance
      
    } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "Full name, email, password, and role are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      fullName,
      email,
      password: hashedPassword,
      role,
    };

    // 🧠 If role is chef, validate category IDs and include them
    if (role === "chef" || role==="seller") {
      if (categories && categories.length > 0) {
        // Verify all category IDs exist
        const validCategories = await Category.find({ _id: { $in: categories } });
        if (validCategories.length !== categories.length) {
          return res.status(400).json({ message: "One or more category IDs are invalid" });
        }
        userData.categories = categories;
      }
      userData.availableBalance = availableBalance || 0.0; 
      userData.phoneNumber=phoneNumber || "";  
      userData.description = description || "";
      userData.documentsUpload = documentsUpload || "";
      userData.verified = verified || false;
      userData.specialties = specialties || [];
      userData.experienceYears = experienceYears || 0;
      userData.profileImage = profileImage || "https://res.cloudinary.com/dlqbeerkn/image/upload/v1762471911/kookavile/kwmipjk1niod0duyo787.jpg";
console.log("This the role assigned"+role);
      if(role=="seller"){
console.log("Seller role assigned");
         userData.categories = ["691b99414b8d19aca8036d62"];

    
    }
      // 👇 Payment details ONLY for chefs
      if (paymentDetails) {
        userData.paymentDetails = {
          bankName: paymentDetails.bankName || "",
          accountNumber: paymentDetails.accountNumber || "",
          accoutName: paymentDetails.accoutName || "",
        };
      }

      
    }

    const user = await User.create(userData);

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllChefs = async (req, res) => {
  try {
    const { categoryId } = req.query; // optional query param

    // Build the query
    let query = { role: "chef" };

    // If categoryId is provided, filter chefs belonging to that category
    if (categoryId) {
      query.categories = categoryId; // Mongoose will match ObjectId in array
    }

    const chefs = await User.find(query)
      .populate("categories", "name description")
      .select("-password");

    res.status(200).json(chefs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import mongoose from "mongoose";

// Add to chef's available balance (Decimal128 safe)
export const addAmount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (amount === undefined || typeof amount !== "number") {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "chef") {
      return res.status(400).json({ message: "Only chefs have an available balance" });
    }

    // Convert Decimal128 to number, add new amount, and save as Decimal128
    const currentBalance = parseFloat(user.availableBalance.toString()) || 0;
    const newBalance = currentBalance + amount;

    user.availableBalance = mongoose.Types.Decimal128.fromString(newBalance.toString());
    await user.save();

    res.status(200).json({
      message: "Available balance updated successfully",
      availableBalance: parseFloat(user.availableBalance.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in user details
export const getUserDetails = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details retrieved successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const rateSeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { stars, comment } = req.body;
    const userId = req.user.id; // from auth middleware

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (sellerId === userId) {
      return res.status(400).json({ message: "You cannot rate yourself" });
    }

    const seller = await User.findById(sellerId);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (seller.role !== "seller" && seller.role !== "chef") {
      return res.status(400).json({ message: "User is not a seller or chef" });
    }

    // Check if user has already rated the seller
    const existingRatingIndex = seller.ratings.findIndex(
      (r) => r.ratedBy.toString() === userId
    );

    if (existingRatingIndex !== -1) {
      // Update the previous rating
      seller.ratings[existingRatingIndex].stars = stars;
      seller.ratings[existingRatingIndex].comment = comment || "";
    } else {
      // Add new rating
      seller.ratings.push({
        ratedBy: userId,
        stars,
        comment,
      });

      seller.rating.totalRatings += 1;
    }

    // Recalculate average rating
    const totalStars = seller.ratings.reduce((sum, r) => sum + r.stars, 0);
    const avgRating = totalStars / seller.ratings.length;

    seller.rating.average = parseFloat(avgRating.toFixed(2));

    await seller.save();

    res.status(200).json({
      message: "Rating submitted successfully",
      rating: seller.rating,
      ratings: seller.ratings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getSellerRating = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId).select("rating");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json({
      message: "Seller rating retrieved successfully",
      rating: seller.rating,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserDetailsByUserId = async (req, res) => {
  try {

    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details retrieved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  
 

};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getSellerRatingDetails = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId)
      .select("rating ratings")
      .populate("ratings.ratedBy", "fullName profileImage");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    res.status(200).json({
      message: "Seller rating retrieved successfully",
      rating: seller.rating,
      reviews: seller.ratings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
