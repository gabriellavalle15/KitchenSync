const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "",
    },
    area: {
      type: String,
      default: "",
    },
    ingredients: {
      type: [String],
      default: [],
    },
    instructions: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      default: "",
    },
    mealDbId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);