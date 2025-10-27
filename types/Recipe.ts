export default interface Recipe {
    id: string;
    dishName: string;
    source: string;
    chef: string;
    cuisine: string;
    description: string;
    prepTime: string;
    cookTime: string;
    additionalTime: string;
    totalTime: string;
    servings: string;
    imageURL: string;
    ingredients: string[];
    instructions: string[];
    notes?: string;
    dietaryRestrictions: {
        vegetarian: boolean;
        vegan: boolean;
        dairyFree: boolean;
        containsNuts: boolean;
        glutenFree: boolean;
        kosher: boolean;
        halal: boolean;
    };
    createdBy: string;
    createdByDisplayName?: string
    createdAt: string;
    updatedAt: string;
    public: boolean;
    likes: number;
    likedBy?: string[];
}
