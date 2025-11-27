import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
        image: {
      type: String,
      required: [true, "Category image is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },


amount: {
  type: mongoose.Schema.Types.Decimal128,
  default: 0.0,
}
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
