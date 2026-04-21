const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      trim: true,
      minlength: [2, "Recipe title must be at least 2 characters long"],
      maxlength: [100, "Recipe title cannot exceed 100 characters"],
    },
    category: {
      type: String,
      trim: true,
      default: "",
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    area: {
      type: String,
      trim: true,
      default: "",
      maxlength: [50, "Area cannot exceed 50 characters"],
    },
    ingredients: {
      type: [String],
      default: [],
      validate: {
        validator: function (value) {
          return (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((item) => typeof item === "string" && item.trim().length > 0)
          );
        },
        message: "At least one valid ingredient is required",
      },
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
      maxlength: [5000, "Instructions cannot exceed 5000 characters"],
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    source: {
      type: String,
      trim: true,
      default: "",
    },
    mealDbId: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);