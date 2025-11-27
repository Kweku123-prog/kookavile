import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    address: { type: String, required: true },
    note: { type: String },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    numberOfPeople: { type: Number, required: true },
    numberOfDays: { type: Number, required: true },
    category: { type: String, required: true,},
    amountPaid: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
