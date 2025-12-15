export function normalizeRecipe(recipe: any, url: string) {
  const domain = new URL(url).hostname;

  // Default normalization
  let ingredients = recipe.recipeIngredient || recipe.recipeIngredients || [];
  let instructions =
    recipe.recipeInstructions?.map((s: any) =>
      typeof s === "string" ? s : s.text
    ) || [];

  // 🔧 SITE OVERRIDES
  if (domain.includes("nytimes.com")) {
    ingredients = ingredients.map((i: string) => i.replace(/\s+/g, " "));
  }

  return {
    dishName: recipe.name,
    imageURL: Array.isArray(recipe.image) ? recipe.image[0] : recipe.image,
    chef: recipe.author?.name || "",
    description: recipe.description || "",
    ingredients,
    instructions,
    servings: recipe.recipeYield || "",
    totalTime: recipe.totalTime || "",
    source: url,
  };
}