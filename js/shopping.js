/* shopping.js - Shopping List Management */
import { getData, updateData } from './storage.js';
import { generateId, showSuccess, formatPrice } from './app.js';

export function getShoppingList() {
    return getData('shoppingList') || [];
}

export function addShoppingItem(itemData) {
    const list = getShoppingList();
    const newItem = {
        id: generateId(),
        ...itemData,
        checked: false,
        addedDate: new Date().toISOString()
    };
    list.push(newItem);
    updateData('shoppingList', list);
    showSuccess('Item added to shopping list!');
    return newItem;
}

export function toggleItemChecked(itemId) {
    const list = getShoppingList();
    const item = list.find(i => i.id === itemId);
    if (item) {
        item.checked = !item.checked;
        updateData('shoppingList', list);
        return item.checked;
    }
    return false;
}

export function removeItem(itemId) {
    const list = getShoppingList();
    const filtered = list.filter(i => i.id !== itemId);
    updateData('shoppingList', filtered);
    showSuccess('Item removed');
}

export function clearCheckedItems() {
    const list = getShoppingList();
    const filtered = list.filter(i => !i.checked);
    updateData('shoppingList', filtered);
    showSuccess('Checked items cleared!');
    return filtered;
}

export function getTotalCost() {
    const list = getShoppingList();
    return list.filter(i => !i.checked).reduce((sum, item) => sum + (item.price || 0), 0);
}

export function generateFromMealPlan() {
    const weeklyPlan = getData('weeklyPlan') || {};
    const meals = getData('meals') || [];
    const currentList = getShoppingList();
    
    const ingredients = new Set();
    Object.values(weeklyPlan).forEach(dayMeals => {
        dayMeals.forEach(mealId => {
            const meal = meals.find(m => m.id === mealId);
            if (meal) meal.ingredients.forEach(ing => ingredients.add(ing));
        });
    });
    
    let added = 0;
    ingredients.forEach(ing => {
        if (!currentList.find(item => item.name.toLowerCase() === ing.toLowerCase())) {
            addShoppingItem({ name: ing, quantity: '1', category: 'food', price: 0, aisle: '' });
            added++;
        }
    });
    
    showSuccess(`Added ${added} items from meal plan!`);
    return added;
}
