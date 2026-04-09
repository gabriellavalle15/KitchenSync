import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [groceryList, setGroceryList] = useState([]);
  const [selectedRecipeTitle, setSelectedRecipeTitle] = useState("");

  const fetchSavedRecipes = async () => {
    try {
      const response = await axios.get("/api/recipes");
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    }
  };

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  const searchRecipes = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
      );

      setSearchResults(response.data.meals || []);
    } catch (error) {
      console.error("Error searching recipes:", error);
    }
  };

  const extractIngredients = (meal) => {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ingredient && ingredient.trim()) {
        ingredients.push(
          `${measure ? measure.trim() : ""} ${ingredient.trim()}`.trim()
        );
      }
    }

    return ingredients;
  };

  const handleSaveRecipe = async (meal) => {
    const recipeData = {
      title: meal.strMeal,
      category: meal.strCategory || "",
      area: meal.strArea || "",
      ingredients: extractIngredients(meal),
      instructions: meal.strInstructions || "",
      image: meal.strMealThumb || "",
      source: meal.strSource || meal.strYoutube || "",
      mealDbId: meal.idMeal,
    };

    try {
      await axios.post("/api/recipes", recipeData);
      await fetchSavedRecipes();
    } catch (error) {
      console.error("Error saving recipe:", error);
      console.error("Server response:", error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    try {
      const recipeToDelete = recipes.find((recipe) => recipe._id === id);

      await axios.delete(`/api/recipes/${id}`);
      await fetchSavedRecipes();

      if (recipeToDelete && recipeToDelete.title === selectedRecipeTitle) {
        setGroceryList([]);
        setSelectedRecipeTitle("");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const generateGroceryList = (recipe) => {
    const uniqueIngredients = [...new Set(recipe.ingredients)];
    setGroceryList(uniqueIngredients);
    setSelectedRecipeTitle(recipe.title);
  };

  return (
    <div className="app">
      <h1>🍽️ KitchenSync</h1>
      <p className="tagline">Search recipes. Save favorites. Simplify shopping.</p>

      <form className="recipe-form" onSubmit={searchRecipes}>
        <input
          type="text"
          placeholder="Search for recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>

      <h2>Search Results</h2>
      <div className="recipe-list">
        {searchResults.length === 0 ? (
          <p className="empty-state">
            No search results yet. Try searching for pasta, chicken, or tacos.
          </p>
        ) : (
          searchResults.map((meal) => (
            <div key={meal.idMeal} className="recipe-card">
              {meal.strMealThumb && (
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="recipe-image"
                />
              )}

              <h3>{meal.strMeal}</h3>
              <p>
                <strong>Category:</strong> {meal.strCategory}
              </p>
              <p>
                <strong>Area:</strong> {meal.strArea}
              </p>

              <button onClick={() => handleSaveRecipe(meal)}>Save Recipe</button>
            </div>
          ))
        )}
      </div>

      <h2>Saved Recipes</h2>
      <div className="recipe-list">
        {recipes.length === 0 ? (
          <p className="empty-state">
            No saved recipes yet. Save one from the search results to get started.
          </p>
        ) : (
          recipes.map((recipe) => (
            <div key={recipe._id} className="recipe-card">
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="recipe-image"
                />
              )}

              <h3>{recipe.title}</h3>
              <p>
                <strong>Category:</strong> {recipe.category}
              </p>
              <p>
                <strong>Area:</strong> {recipe.area}
              </p>
              <p>
                <strong>Ingredients:</strong> {recipe.ingredients.join(", ")}
              </p>

              {recipe.source && (
                <p>
                  <strong>Source:</strong>{" "}
                  <a href={recipe.source} target="_blank" rel="noreferrer">
                    View Recipe
                  </a>
                </p>
              )}

              <div className="recipe-card-buttons">
                <button onClick={() => generateGroceryList(recipe)}>
                  Grocery List
                </button>
                <button onClick={() => handleDelete(recipe._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <h2>
        Grocery List{selectedRecipeTitle ? ` for ${selectedRecipeTitle}` : ""}
      </h2>

      {groceryList.length === 0 ? (
        <p className="empty-state">
          Choose a saved recipe to generate its grocery list.
        </p>
      ) : (
        <ul className="grocery-list">
          {groceryList.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;