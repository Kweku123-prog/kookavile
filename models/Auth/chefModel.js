import mongoose from "mongoose";

const chefSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bio: String,
  specialties: [String],
  rating: { type: Number, default: 0 },
  experience: String,
  profileImage: String,
}, { timestamps: true });

export default mongoose.model("Chef", chefSchema);
