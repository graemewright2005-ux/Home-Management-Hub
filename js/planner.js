/* planner.js - Weekly Meal Planner */
import { getData, updateData } from './storage.js';
import { showSuccess, getDayOfWeek } from './app.js';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getWeeklyPlan() {
    return getData('weeklyPlan') || {};
}

export function addMealToDay(day, mealId) {
    const plan = getWeeklyPlan();
    if (!plan[day]) plan[day] = [];
    if (!plan[day].includes(mealId)) {
        plan[day].push(mealId);
        updateData('weeklyPlan', plan);
        showSuccess(`Meal added to ${day}!`);
        return true;
    }
    return false;
}

export function removeMealFromDay(day, mealId) {
    const plan = getWeeklyPlan();
    if (plan[day]) {
        plan[day] = plan[day].filter(id => id !== mealId);
        updateData('weeklyPlan', plan);
        showSuccess('Meal removed');
        return true;
    }
    return false;
}

export function clearDay(day) {
    const plan = getWeeklyPlan();
    plan[day] = [];
    updateData('weeklyPlan', plan);
    showSuccess(`${day} cleared`);
}

export function clearWeek() {
    const plan = {};
    DAYS.forEach(day => plan[day] = []);
    updateData('weeklyPlan', plan);
    showSuccess('Week cleared!');
}

export function getTodaysMeals() {
    const today = getDayOfWeek();
    const plan = getWeeklyPlan();
    return plan[today] || [];
}

export function getMealsForDay(day) {
    const plan = getWeeklyPlan();
    return plan[day] || [];
}
