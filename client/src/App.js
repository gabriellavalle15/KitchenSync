import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [groceryList, setGroceryList] = useState([]);
  const [selectedRecipeTitle, setSelectedRecipeTitle] = useState("");
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

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

    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) {
      setSearchError("Please enter a recipe name to search.");
      setSearchResults([]);
      return;
    }

    setSearchError("");
    setSaveMessage("");

    try {
      const response = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${trimmedSearch}`
      );

      setSearchResults(response.data.meals || []);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setSearchError("Something went wrong while searching. Please try again.");
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
      const response = await axios.post("/api/recipes", recipeData);
      await fetchSavedRecipes();

      if (response.status === 200) {
        setSaveMessage(`"${meal.strMeal}" is already saved.`);
      } else {
        setSaveMessage(`"${meal.strMeal}" was saved successfully.`);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      console.error("Server response:", error.response?.data);
      setSaveMessage(error.response?.data?.message || "Failed to save recipe.");
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

      if (expandedRecipeId === id) {
        setExpandedRecipeId(null);
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

  const toggleInstructions = (id) => {
    setExpandedRecipeId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="app">
      <header className="hero">
        <h1>🍽️ KitchenSync</h1>
        <p className="tagline">
          Search recipes. Save favorites. Simplify shopping.
        </p>
      </header>

      <section className="app-section">
        <div className="section-heading">
          <h2>Recipe Search</h2>
          <p>Find recipes from an external API and save the ones you love.</p>
        </div>

        <form className="recipe-form" onSubmit={searchRecipes}>
          <input
            type="text"
            placeholder="Search for recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            required
          />
          <button type="submit" className="search-btn">
            <span className="search-icon">🔍</span>
              <span>Search</span>
          </button>
        </form>

        {searchError && <p className="form-message error-message">{searchError}</p>}
        {saveMessage && <p className="form-message success-message">{saveMessage}</p>}

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

                <div className="recipe-meta">
                  <span className="recipe-badge">{meal.strCategory}</span>
                  <span className="recipe-badge">{meal.strArea}</span>
                </div>

                <h3>{meal.strMeal}</h3>

                 <button className="save-btn" onClick={() => handleSaveRecipe(meal)}>
                    Save Recipe
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="app-section">
        <div className="section-heading">
          <h2>Saved Recipes</h2>
          <p>Your hand-picked meals, ready whenever you need them.</p>
        </div>

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

                <div className="recipe-meta">
                  <span className="recipe-badge">{recipe.category || "Recipe"}</span>
                  <span className="recipe-badge">{recipe.area || "Global"}</span>
                </div>

                <h3>{recipe.title}</h3>

                <div className="recipe-instructions">
                  <button
                    className="instructions-toggle"
                    onClick={() => toggleInstructions(recipe._id)}
                  >
                    <span>
                      {expandedRecipeId === recipe._id
                        ? "Hide Instructions"
                        : "View Instructions"}
                    </span>
                    <span className="toggle-icon">
                      {expandedRecipeId === recipe._id ? "−" : "+"}
                    </span>
                  </button>

                  {expandedRecipeId === recipe._id && (
                    <div className="instructions-panel">
                      <p className="instructions-label">Instructions</p>
                      <p className="instructions-text">
                        {recipe.instructions || "No instructions available."}
                      </p>
                    </div>
                  )}
                </div>

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
      </section>

      <section className="app-section grocery-section">
        <div className="section-heading">
          <h2>
            Grocery List{selectedRecipeTitle ? ` for ${selectedRecipeTitle}` : ""}
          </h2>
          <p>
            Build a shopping list directly from the saved recipe you selected.
          </p>
        </div>

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
      </section>
    </div>
  );
}

export default App;