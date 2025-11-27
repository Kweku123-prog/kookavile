import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String},
    role: { type: String, enum: ["customer", "chef","seller","admin"], required: true },

    // Chef-specific fields
    rating: {
  average: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
},
ratings: [
  {
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stars: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }
]
,
    description: { type: String },
    phoneNumber: { type: String },
    documentsUpload: { type: String},
    specialties: [{ type: String }],
    experienceYears: { type: Number },
    verified: { type: Boolean, default: false },
    availableBalance: { type: mongoose.  Schema.Types.Decimal128, default: 0.0 },
    paymentDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      accoutName: { type: String },
    },
    



    // 👇 Reference categories the chef belongs to
    categories: [
      {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      },
    ],
    },
    { timestamps: true }
  );

export default mongoose.model("User", userSchema);
