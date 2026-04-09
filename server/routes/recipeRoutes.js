const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");

// GET all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipes", error: error.message });
  }
});

// POST a new recipe
router.post("/", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const {
      title,
      category,
      area,
      ingredients,
      instructions,
      image,
      source,
      mealDbId,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const existingRecipe = mealDbId
      ? await Recipe.findOne({ mealDbId })
      : null;

    if (existingRecipe) {
      return res.status(200).json(existingRecipe);
    }

    const newRecipe = new Recipe({
      title,
      category,
      area,
      ingredients,
      instructions,
      image,
      source,
      mealDbId,
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(400).json({
      message: "Failed to save recipe",
      error: error.message,
    });
  }
});

// DELETE a recipe
router.delete("/:id", async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete recipe", error: error.message });
  }
});

// PUT update a recipe
router.put("/:id", async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      {
        title,
        ingredients,
        instructions,
      },
      { new: true, runValidators: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: "Failed to update recipe", error: error.message });
  }
});

module.exports = router;