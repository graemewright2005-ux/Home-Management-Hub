/* ============================================
   NOTIFICATIONS.JS
   Push notification handling
   ============================================ */

import { getData, updateData } from './storage.js';

/**
 * Check if notifications are supported
 */
export function isNotificationSupported() {
    return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getPermissionStatus() {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission;
}

/**
 * Request notification permission
 */
export async function requestPermission() {
    if (!isNotificationSupported()) {
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            // Update settings
            const data = getData('settings');
            data.notificationsEnabled = true;
            updateData('settings', data);
            
            // Show test notification
            showNotification('Home Management Hub', {
                body: 'Notifications enabled! You\'ll receive reminders for tasks and meals.',
                icon: '🏠'
            });
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error requesting permission:', error);
        return false;
    }
}

/**
 * Show a notification
 */
export function showNotification(title, options = {}) {
    if (!isNotificationSupported() || Notification.permission !== 'granted') {
        return null;
    }

    const defaultOptions = {
        icon: '🏠',
        badge: '🏠',
        vibrate: [200, 100, 200],
        tag: 'home-management',
        renotify: false
    };

    const notification = new Notification(title, {
        ...defaultOptions,
        ...options
    });

    // Close notification after 5 seconds
    setTimeout(() => {
        notification.close();
    }, 5000);

    return notification;
}

/**
 * Schedule task reminder
 */
export function scheduleTaskReminder(task) {
    if (!task.dueDate || !task.reminder) return;

    const settings = getData('settings');
    if (!settings.notificationsEnabled) return;

    const dueDate = new Date(task.dueDate);
    const now = new Date();

    // If due today, show notification
    if (dueDate.toDateString() === now.toDateString()) {
        showNotification('Task Due Today', {
            body: task.name,
            tag: `task-${task.id}`
        });
    }

    // If overdue, show notification
    if (dueDate < now) {
        showNotification('Overdue Task', {
            body: `${task.name} was due on ${dueDate.toLocaleDateString('en-GB')}`,
            tag: `task-${task.id}`,
            requireInteraction: true
        });
    }
}

/**
 * Check for due tasks and send notifications
 */
export function checkDueTasks() {
    const settings = getData('settings');
    if (!settings.notificationsEnabled || !settings.notifyCleaning) return;

    const cleaningTasks = getData('cleaningTasks') || [];
    const maintenanceTasks = getData('maintenanceTasks') || [];
    const allTasks = [...cleaningTasks, ...maintenanceTasks];

    const today = new Date().toISOString().split('T')[0];
    const dueTasks = allTasks.filter(task => 
        !task.completed && task.dueDate === today
    );

    if (dueTasks.length > 0) {
        showNotification(`${dueTasks.length} Task${dueTasks.length > 1 ? 's' : ''} Due Today`, {
            body: dueTasks.map(t => t.name).join(', '),
            tag: 'daily-tasks'
        });
    }
}

/**
 * Remind about meal planning
 */
export function remindMealPlanning() {
    const settings = getData('settings');
    if (!settings.notificationsEnabled || !settings.notifyMeals) return;

    const weeklyPlan = getData('weeklyPlan') || {};
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

    // Check if today's meals are planned
    const todayMeals = weeklyPlan[dayName] || [];
    
    if (todayMeals.length === 0 && today.getHours() === 9) {
        showNotification('Meal Planning Reminder', {
            body: 'No meals planned for today. Time to plan!',
            tag: 'meal-planning'
        });
    }
}

/**
 * Remind about shopping
 */
export function remindShopping() {
    const settings = getData('settings');
    if (!settings.notificationsEnabled || !settings.notifyShopping) return;

    const shoppingList = getData('shoppingList') || [];
    const uncheckedItems = shoppingList.filter(item => !item.checked);

    if (uncheckedItems.length > 5) {
        showNotification('Shopping Reminder', {
            body: `You have ${uncheckedItems.length} items on your shopping list`,
            tag: 'shopping'
        });
    }
}

/**
 * Initialize notification system
 */
export function initNotifications() {
    if (!isNotificationSupported()) {
        console.log('Notifications not supported');
        return;
    }

    const settings = getData('settings');
    if (settings.notificationsEnabled && Notification.permission === 'granted') {
        // Check for due tasks on page load
        checkDueTasks();

        // Set up periodic checks (every hour)
        setInterval(checkDueTasks, 60 * 60 * 1000);
    }
}

/**
 * Disable notifications
 */
export function disableNotifications() {
    const data = getData('settings');
    data.notificationsEnabled = false;
    updateData('settings', data);
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
} else {
    initNotifications();
}
