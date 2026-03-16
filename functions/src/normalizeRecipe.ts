export function normalizeRecipe(recipe: any, url: string) {
  const domain = new URL(url).hostname;

  console.log("🔄 Normalizing recipe data:", {
    hasName: !!recipe.name,
    hasRecipeIngredient: !!recipe.recipeIngredient,
    hasRecipeIngredients: !!recipe.recipeIngredients,
    hasRecipeInstructions: !!recipe.recipeInstructions,
    hasInstructions: !!recipe.instructions,
    hasAuthor: !!recipe.author,
    keys: Object.keys(recipe).slice(0, 10)
  });

  // Default normalization - handle multiple field name variations
  let ingredients = recipe.recipeIngredient || recipe.recipeIngredients || recipe.ingredients || [];
  
  let instructions = recipe.recipeInstructions || recipe.instructions || [];
  if (instructions && typeof instructions === 'object' && instructions.itemListElement) {
    instructions = instructions.itemListElement;
  }
  if (Array.isArray(instructions) && instructions.length > 0) {
    instructions = instructions.map((s: any) =>
      typeof s === "string" ? s : (s.text || s)
    );
  }

  // Handle author/chef - could be string or object
  let chef = "";
  if (typeof recipe.author === "string") {
    // Simple: strip HTML tags, split lines, use the line after 'By' if present,
    // otherwise take the first non-empty trimmed line (limit 80 chars).
    const raw = recipe.author.replace(/<[^>]*>/g, "");
    const lines = raw.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean);
    const byIndex = lines.findIndex((l: string) => /^by\b/i.test(l));
    if (byIndex >= 0 && lines[byIndex + 1]) {
      chef = lines[byIndex + 1].substring(0, 80);
    } else if (lines.length > 0) {
      chef = lines[0].substring(0, 80);
    } else {
      chef = raw.substring(0, 80);
    }
  } else if (recipe.author?.name) {
    chef = String(recipe.author.name).trim().substring(0, 80);
  }

  // Handle image - could be string, array, or object with contentUrl
  let imageURL = "";
  let contentUrlBackup = ""; // Keep contentUrl as a backup option
  if (Array.isArray(recipe.image)) {
    imageURL = recipe.image[0];
  } else if (typeof recipe.image === "string") {
    imageURL = recipe.image;
  } else if (recipe.image?.contentUrl) {
    // Handle ImageObject with contentUrl property (e.g., NYTimes)
    imageURL = recipe.image.contentUrl;
    contentUrlBackup = recipe.image.contentUrl;
  } else if (typeof recipe.image === "object" && recipe.image) {
    // Try to extract URL from common properties in object
    const obj = recipe.image as Record<string, any>;
    if (obj.url && typeof obj.url === "string") {
      imageURL = obj.url;
    } else if (obj.src && typeof obj.src === "string") {
      imageURL = obj.src;
    } else if (obj.href && typeof obj.href === "string") {
      imageURL = obj.href;
    } else {
      // Fallback: stringify and extract first HTTP URL
      const str = JSON.stringify(recipe.image);
      if (str.includes("http")) {
        const match = str.match(/(https?:\/\/[^"]*)/);
        if (match) imageURL = match[1];
      }
    }
    // Also save contentUrl if it exists in the object
    if (obj.contentUrl && typeof obj.contentUrl === "string") {
      contentUrlBackup = obj.contentUrl;
    }
  }

  // 🔧 SITE OVERRIDES
  if (domain.includes("nytimes.com")) {
    ingredients = ingredients.map((i: string) => i.replace(/\s+/g, " "));
  }

  // Final safety: if imageURL is still an object, extract URL from it
  if (typeof imageURL === "object" && imageURL) {
    const obj = imageURL as Record<string, any>;
    if (obj.contentUrl && typeof obj.contentUrl === "string") {
      imageURL = obj.contentUrl;
      contentUrlBackup = obj.contentUrl;
    } else if (obj.url && typeof obj.url === "string") {
      imageURL = obj.url;
      contentUrlBackup = obj.url;
    } else if (obj.src && typeof obj.src === "string") {
      imageURL = obj.src;
    } else {
      // Last resort: stringify and extract first HTTPS URL
      const str = JSON.stringify(imageURL);
      if (str.includes("http")) {
        const match = str.match(/(https?:\/\/[^"]*)/);
        if (match) imageURL = match[1];
      } else {
        imageURL = ""; // Clear if we can't extract a URL
      }
    }
  }

  const normalized = {
    dishName: recipe.name || "",
    imageURL,
    contentUrlBackup, // Keep as optional backup
    chef,
    description: recipe.description || "",
    ingredients: Array.isArray(ingredients) ? ingredients : [],
    instructions: Array.isArray(instructions) ? instructions : [],
    servings: recipe.recipeYield || recipe.servings || "",
    totalTime: recipe.totalTime || recipe.totalTime || "",
    source: url,
  };

  console.log("✅ Normalized result:", {
    dishName: normalized.dishName,
    chef: normalized.chef,
    ingredientCount: normalized.ingredients.length,
    instructionCount: normalized.instructions.length,
  });

  return normalized;
}