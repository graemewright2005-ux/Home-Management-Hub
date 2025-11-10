/* meals.js - Meal Management */
import { getData, updateData } from './storage.js';
import { generateId, showSuccess, showError } from './app.js';

export function getMeals() {
    return getData('meals') || [];
}

export function addMeal(mealData) {
    const meals = getMeals();
    const newMeal = {
        id: generateId(),
        ...mealData,
        dateAdded: new Date().toISOString(),
        lastMade: null
    };
    meals.push(newMeal);
    updateData('meals', meals);
    showSuccess('Meal added successfully!');
    return newMeal;
}

export function updateMeal(mealId, mealData) {
    const meals = getMeals();
    const index = meals.findIndex(m => m.id === mealId);
    if (index !== -1) {
        meals[index] = { ...meals[index], ...mealData };
        updateData('meals', meals);
        showSuccess('Meal updated!');
        return meals[index];
    }
    return null;
}

export function deleteMeal(mealId) {
    const meals = getMeals();
    const filtered = meals.filter(m => m.id !== mealId);
    updateData('meals', filtered);
    showSuccess('Meal deleted');
}

export function toggleFavourite(mealId) {
    const meals = getMeals();
    const meal = meals.find(m => m.id === mealId);
    if (meal) {
        meal.favourite = !meal.favourite;
        updateData('meals', meals);
        return meal.favourite;
    }
    return false;
}

export function filterMeals(filters) {
    const meals = getMeals();
    return meals.filter(meal => {
        if (filters.type && filters.type !== 'all' && meal.type !== filters.type) return false;
        if (filters.dietary && !filters.dietary.every(d => meal.dietary.includes(d))) return false;
        if (filters.ingredient && !meal.mainIngredients.some(i => i.toLowerCase().includes(filters.ingredient.toLowerCase()))) return false;
        if (filters.search) {
            const searchText = `${meal.title} ${meal.ingredients.join(' ')}`.toLowerCase();
            if (!searchText.includes(filters.search.toLowerCase())) return false;
        }
        return true;
    });
}
