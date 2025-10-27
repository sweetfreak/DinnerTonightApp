import {useState, useEffect} from 'react'
import type {ChangeEvent} from 'react'
import { db } from "../../firebase/firebaseConfig"
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import {useAuth } from "../../contexts/authContext/index"
import type UserProfile  from '../../types/User'
 import type Recipe from "../../types/Recipe"

interface EditRecipeProps {
    currentUserProfile: UserProfile | null
    //onRecipeAdded: (recipe: Recipe | null) => void
    selectedRecipe: Recipe
    openRecipe: (recipe: Recipe) => void

}

export default function EditRecipe({currentUserProfile, selectedRecipe, openRecipe}: EditRecipeProps) {

    const { currentUser } = useAuth()  
    const isCurrentUser = currentUser?.uid === currentUserProfile?.uid

    const[ingredients, setIngredients] = useState<string[]>([])
    const[instructions, setInstructions] = useState<string[]>([])    

    console.log('rendered')
    function addIngredient() {
        setIngredients([...ingredients, ''])
        console.log(ingredients)
    }

    function handleIngredientChange(index: number, value: string) {
        const newIngredients = [...ingredients]
        newIngredients[index] = value
        setIngredients(newIngredients)
    }

    function addInstruction() {
        setInstructions([...instructions, ''])
    }

    function handleInstructionChange(index: number, value: string) {
        const newInstructions = [...instructions]
        newInstructions[index] = value
        setInstructions(newInstructions)
    }

    //   function handleFormChange(event: ChangeEvent<HTMLInputElement>) {
    //         const {name, value, type, checked} = event.target
    //         setRecipeData(prevData => ({
    //             ...prevData,
    //             [name]: type === 'checkbox' ? checked : value,
    //         }))
    //     }

    function handleFormChange(event: ChangeEvent<HTMLInputElement>) {
        const {name, value, type, checked} = event.target
        
        // List of dietary restriction fields
        const dietaryFields = ['vegetarian', 'vegan', 'dairyFree', 'containsNuts', 'glutenFree', 'kosher', 'halal']
        
        if (dietaryFields.includes(name)) {
            setRecipeData(prevData => ({
                ...prevData,
                dietaryRestrictions: {
                    ...prevData.dietaryRestrictions,
                    [name]: checked
                }
            }))
        } else {
            setRecipeData(prevData => ({
                ...prevData,
                [name]: type === 'checkbox' ? checked : value,
            }))
        }
    }


    const [recipeData, setRecipeData] = useState( {
        dishName: '',
        source: '',
        chef: '',
        cuisine: '',
        description: '',
        prepTime: '',
        cookTime: '',
        additionalTime: '',
        totalTime: '', 
        servings: '',
        imageURL: '',
        ingredients,
        instructions,
        notes: '',
        dietaryRestrictions: {
            vegetarian: false,
            vegan: false,
            dairyFree: false,
            containsNuts: false,
            glutenFree: false,
            kosher: false,
            halal: false,
        },
    })

    useEffect(() => {
    if (selectedRecipe) {
        setIngredients(selectedRecipe.ingredients ?? [])
        setInstructions(selectedRecipe.instructions ?? [])
    }   
        if(currentUserProfile) {
            setRecipeData({
                dishName: selectedRecipe.dishName ?? '',
                source: selectedRecipe.source ?? '',
                chef: selectedRecipe.chef ?? '',
                cuisine: selectedRecipe.cuisine ?? '',
                description: selectedRecipe.description ?? '',
                prepTime: selectedRecipe.prepTime ?? '',
                cookTime: selectedRecipe.cookTime ?? '',
                additionalTime: selectedRecipe.additionalTime ?? '',
                totalTime: selectedRecipe.totalTime ?? '',
                servings: selectedRecipe.servings ?? '',
                imageURL: selectedRecipe.imageURL ?? '',
                ingredients: selectedRecipe.ingredients,
                instructions: selectedRecipe.instructions,
                notes: selectedRecipe.notes ?? '',
                dietaryRestrictions: {
                    vegetarian: selectedRecipe.dietaryRestrictions.vegetarian,
                    vegan: selectedRecipe.dietaryRestrictions.vegan,
                    dairyFree: selectedRecipe.dietaryRestrictions.dairyFree,
                    containsNuts: selectedRecipe.dietaryRestrictions.containsNuts,
                    glutenFree: selectedRecipe.dietaryRestrictions.glutenFree,
                    kosher: selectedRecipe.dietaryRestrictions.kosher,
                    halal: selectedRecipe.dietaryRestrictions.halal,
                },
            })
        }
    }, [selectedRecipe])

    async function handleUpdateRecipe(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!currentUser || !isCurrentUser) return;

        try {
            const recipeRef = await doc(db, 'recipes', selectedRecipe.id)
            await updateDoc(recipeRef, {
                dishName: recipeData.dishName,
                source: recipeData.source ,
                chef: recipeData.chef ,
                cuisine: recipeData.cuisine ,
                description: recipeData.description ,
                prepTime: recipeData.prepTime ,
                cookTime: recipeData.cookTime ,
                additionalTime: recipeData.additionalTime ,
                totalTime: recipeData.totalTime ,
                servings: recipeData.servings ,
                imageURL: recipeData.imageURL ,
                ingredients: ingredients,
                instructions: instructions,
                notes: recipeData.notes,
                dietaryRestrictions: {
                    vegetarian: recipeData.dietaryRestrictions.vegetarian,
                    vegan: recipeData.dietaryRestrictions.vegan,
                    dairyFree: recipeData.dietaryRestrictions.dairyFree,
                    containsNuts: recipeData.dietaryRestrictions.containsNuts,
                    glutenFree: recipeData.dietaryRestrictions.glutenFree,
                    kosher: recipeData.dietaryRestrictions.kosher,
                    halal: recipeData.dietaryRestrictions.halal,
                },
                createdByDisplayName: currentUserProfile?.displayName,
                updatedAt: Date.now()
                
            } )

            // setIngredients([])
            // setInstructions([])
            openRecipe(selectedRecipe)
            
        } catch (error) {
            console.error('there was an error saving the updates', error)
        }

    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
        if (event.key === "Enter" && (event.currentTarget as HTMLElement).tagName !== 'TEXTAREA') {
            event.preventDefault()
        }
    }


    return (
        <>
       
        <section className='p-10' >
            <br />
            <form onSubmit={handleUpdateRecipe} onKeyDown={handleKeyDown} className="font-bold" method="POST">
            <h2>Edit your recipe:</h2>
                <div className="p-3">
                    <label> Dish Name:
                        <input id="dishName" type="text" name="dishName" value={recipeData.dishName}
              onChange={handleFormChange} required />
                    </label>
                    <br />
                </div>

                <div className="p-3">
                    <label> Source:
                    <input id="source" type="text" name="source" value={recipeData.source}
              onChange={handleFormChange} />
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Chef's Name:
                    <input id="chef" type="text" name="chef" value={recipeData.chef}
              onChange={handleFormChange} />
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Cuisine
                    <input id="cuisine" type="text" name="cuisine" value={recipeData.cuisine}
              onChange={handleFormChange} />
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Description:
                    <input id="description" type="text" name="description" value={recipeData.description}
              onChange={handleFormChange} />
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Prep Time:
                    <input id="preptime" type="number" name="preptime"  value={recipeData.prepTime}
              onChange={handleFormChange} />minutes
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Cook Time:
                    <input id="cooktime" type="number" name="cooktime" value={recipeData.cookTime}
              onChange={handleFormChange} />minutes
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Additional Time:
                    <input id="additionaltime" type="number" name="additionaltime" value={recipeData.additionalTime}
              onChange={handleFormChange} />minutes
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Total Time:
                    <input id="totaltime" type="number" name="totaltime" value={recipeData.totalTime}
              onChange={handleFormChange}  />minutes
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Servings:
                    <input id="servings" type="text" name="servings" value={recipeData.servings}
              onChange={handleFormChange} />servings
                </label>
                <br />
                </div>
                <div>
                    <h3>Ingredients</h3>
                    <ul>
                    {ingredients.map((ingredient, i) => (
                        <li key={i}>
                        <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => handleIngredientChange(i, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                e.preventDefault()
                                addIngredient()
                                }
                            }}
                            placeholder={`Ingredient ${i + 1}`}
                        />
                        </li>
                    ))}
                    </ul>
                    <button type="button" onClick={addIngredient}>
                    + Add another ingredient
                    </button>
                </div>

                <br />

                <div>
                    <h3>Instructions</h3>
                    
                    <ol>
                    {instructions.map((step, i) => (
                        <li key={i}>
                        <input
                            type="text"
                            value={step}
                            onChange={(e) => handleInstructionChange(i, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                e.preventDefault()
                                addInstruction()
                                }
                            }}
                            placeholder={`Step ${i + 1}`}
                        />
                        </li>
                    ))}
                    </ol>

                    <button type="button" onClick={addInstruction}>
                    + Add another step
                    </button>

                </div>
                <br />

                <div className="p-3">
                    <label> Additional Notes:
                    <input id="notes" type="text" name="notes" value={recipeData.notes}
              onChange={handleFormChange} />
                </label>
                <br />
                </div>

                <div className="p-3">
                    <label> Image:
                    <input id="dishName" type="text" name="dishName" value={recipeData.imageURL}
              onChange={handleFormChange}  />
                </label>

                            </div>

                <br />
                <div className="flex-row">
                Dietary Notes:
                    <div className="flex-row pl-10">
                        <p>Vegetarian <input id="vegetarian" type="checkbox" name="vegetarian" defaultChecked={selectedRecipe.dietaryRestrictions.vegetarian}
              onChange={handleFormChange} /> </p>
                        <p>Vegan <input id="vegan" type="checkbox" name="vegan" defaultChecked={selectedRecipe.dietaryRestrictions.vegan}
              onChange={handleFormChange} /> </p>
                        <p>Dairy-free <input id="diaryFree" type="checkbox" name="diaryFree" defaultChecked={selectedRecipe.dietaryRestrictions.dairyFree}
              onChange={handleFormChange} /> </p>
                        <p>Contains Nuts <input id="containsNuts" type="checkbox" name="containsNuts" defaultChecked={selectedRecipe.dietaryRestrictions.containsNuts}
              onChange={handleFormChange} /> </p>
                        <p>Gluten-free <input id="glutenFree" type="checkbox" name="glutenFree" defaultChecked={selectedRecipe.dietaryRestrictions.glutenFree}
              onChange={handleFormChange} /> </p>
                        <p>Kosher <input id="kosher" type="checkbox" name="kosher" defaultChecked={selectedRecipe.dietaryRestrictions.kosher}
              onChange={handleFormChange} /> </p>
                        <p>Halal <input id="halal" type="checkbox" name="halal" defaultChecked={selectedRecipe.dietaryRestrictions.halal}
              onChange={handleFormChange} /> </p>
                    </div>
                </div>
                <br /> 

                <button className='p-2 rounded text-white bg-blue-500' type="submit">Save Changes</button>
                {/* <p className='text-red' >{showMissingInfo ? "Some information may be missing" : ""}</p> */}
            </form>
        </section>
        </>
    )
}