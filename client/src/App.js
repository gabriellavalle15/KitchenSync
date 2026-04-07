import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [groceryList, setGroceryList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get("/api/recipes");
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const resetForm = () => {
    setTitle("");
    setIngredients("");
    setInstructions("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recipeData = {
      title,
      ingredients: ingredients.split(",").map((item) => item.trim()),
      instructions,
    };

    try {
      if (editingId) {
        await axios.put(`/api/recipes/${editingId}`, recipeData);
      } else {
        await axios.post("/api/recipes", recipeData);
      }

      resetForm();
      fetchRecipes();
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  const handleEdit = (recipe) => {
    setTitle(recipe.title);
    setIngredients(recipe.ingredients.join(", "));
    setInstructions(recipe.instructions);
    setEditingId(recipe._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/recipes/${id}`);

      if (editingId === id) {
        resetForm();
      }

      fetchRecipes();
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const generateGroceryList = () => {
    const allIngredients = recipes.flatMap((recipe) => recipe.ingredients);
    const uniqueIngredients = [...new Set(allIngredients)];
    setGroceryList(uniqueIngredients);
  };

  return (
    <div className="app">
      <h1>🍽️ KitchenSync</h1>
      <p className="tagline">Sync your recipes. Simplify your shopping.</p>

      <form className="recipe-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Recipe Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Ingredients (comma separated)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />

        <textarea
          placeholder="Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
        />

        <button type="submit">
          {editingId ? "Update Recipe" : "Add Recipe"}
        </button>

        {editingId && (
          <button type="button" onClick={handleCancelEdit}>
            Cancel Edit
          </button>
        )}
      </form>

      <button className="grocery-btn" onClick={generateGroceryList}>
        Generate Grocery List
      </button>

      <h2>Recipes</h2>
      <div className="recipe-list">
        {recipes.length === 0 ? (
          <p>No recipes yet. Add your first one!</p>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe._id} className="recipe-card">
              <h3>{recipe.title}</h3>
              <p>
                <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
              </p>
              <p>
                <strong>Instructions:</strong> {recipe.instructions}
              </p>

              <div className="recipe-card-buttons">
                <button onClick={() => handleEdit(recipe)}>Edit</button>
                <button onClick={() => handleDelete(recipe._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <h2>Grocery List</h2>
      <ul className="grocery-list">
        {groceryList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;