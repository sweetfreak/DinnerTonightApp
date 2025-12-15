import { normalizeRecipe } from "../normalizeRecipe";

test("normalizes recipe schema correctly", () => {
  const input = {
    name: "Test Dish",
    recipeIngredient: ["1 cup flour"],
    recipeInstructions: [{ text: "Mix ingredients" }],
  };

  const result = normalizeRecipe(input, "https://example.com");

  expect(result.dishName).toBe("Test Dish");
  expect(result.ingredients.length).toBe(1);
  expect(result.instructions[0]).toBe("Mix ingredients");
});