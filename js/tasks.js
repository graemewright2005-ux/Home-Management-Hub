/* tasks.js - Cleaning & Maintenance Tasks */
import { getData, updateData } from './storage.js';
import { generateId, showSuccess, getTodayISO } from './app.js';

export function getCleaningTasks() {
    return getData('cleaningTasks') || [];
}

export function getMaintenanceTasks() {
    return getData('maintenanceTasks') || [];
}

export function addTask(taskData, type = 'cleaning') {
    const tasks = type === 'cleaning' ? getCleaningTasks() : getMaintenanceTasks();
    const newTask = {
        id: generateId(),
        ...taskData,
        completed: false,
        lastCompleted: null,
        createdDate: new Date().toISOString()
    };
    tasks.push(newTask);
    updateData(type === 'cleaning' ? 'cleaningTasks' : 'maintenanceTasks', tasks);
    showSuccess('Task added!');
    return newTask;
}

export function toggleTaskComplete(taskId, type = 'cleaning') {
    const tasks = type === 'cleaning' ? getCleaningTasks() : getMaintenanceTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            task.lastCompleted = new Date().toISOString();
            if (task.frequency !== 'once') {
                task.dueDate = calculateNextDueDate(task.dueDate, task.frequency);
                task.completed = false;
            }
        }
        updateData(type === 'cleaning' ? 'cleaningTasks' : 'maintenanceTasks', tasks);
        return task;
    }
    return null;
}

export function deleteTask(taskId, type = 'cleaning') {
    const tasks = type === 'cleaning' ? getCleaningTasks() : getMaintenanceTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    updateData(type === 'cleaning' ? 'cleaningTasks' : 'maintenanceTasks', filtered);
    showSuccess('Task deleted');
}

function calculateNextDueDate(currentDate, frequency) {
    const date = new Date(currentDate);
    const freq = {
        daily: 1, weekly: 7, fortnightly: 14, monthly: 30, 
        quarterly: 90, yearly: 365
    };
    date.setDate(date.getDate() + (freq[frequency] || 7));
    return date.toISOString().split('T')[0];
}

export function getDueTasks(type = 'cleaning') {
    const tasks = type === 'cleaning' ? getCleaningTasks() : getMaintenanceTasks();
    const today = getTodayISO();
    return tasks.filter(t => !t.completed && t.dueDate && t.dueDate <= today);
}
