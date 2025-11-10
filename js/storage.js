/* ============================================
   STORAGE MODULE
   Data Persistence with localStorage
   ============================================ */

const STORAGE_KEY = 'homeManagementData';

// Default data structure
const defaultData = {
    meals: [],
    weeklyPlan: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: []
    },
    shoppingList: [],
    householdItems: [],
    cleaningTasks: [],
    maintenanceTasks: [],
    settings: {
        notificationsEnabled: false,
        notifyMeals: true,
        notifyCleaning: true,
        notifyShopping: true,
        lastExport: null
    }
};

/**
 * Load all data from localStorage
 * @returns {Object} The data object
 */
export function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            // Merge with defaults to ensure all properties exist
            return {
                ...defaultData,
                ...data,
                weeklyPlan: { ...defaultData.weeklyPlan, ...data.weeklyPlan },
                settings: { ...defaultData.settings, ...data.settings }
            };
        }
        return { ...defaultData };
    } catch (error) {
        console.error('Error loading data:', error);
        return { ...defaultData };
    }
}

/**
 * Save all data to localStorage
 * @param {Object} data - The data object to save
 * @returns {boolean} Success status
 */
export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        
        // Check if quota exceeded
        if (error.name === 'QuotaExceededError') {
            alert('Storage quota exceeded. Consider exporting your data and clearing old items.');
        }
        return false;
    }
}

/**
 * Get specific data section
 * @param {string} section - Section name (meals, shoppingList, etc.)
 * @returns {any} The requested section data
 */
export function getData(section) {
    const data = loadData();
    return data[section];
}

/**
 * Update specific data section
 * @param {string} section - Section name
 * @param {any} value - New value for the section
 * @returns {boolean} Success status
 */
export function updateData(section, value) {
    const data = loadData();
    data[section] = value;
    return saveData(data);
}

/**
 * Export all data as JSON file
 * @returns {void}
 */
export function exportData() {
    try {
        const data = loadData();
        data.exportDate = new Date().toISOString();
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `home-management-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        // Update last export time
        data.settings.lastExport = new Date().toISOString();
        saveData(data);
        
        return true;
    } catch (error) {
        console.error('Error exporting data:', error);
        alert('Error exporting data. Please try again.');
        return false;
    }
}

/**
 * Import data from JSON file
 * @param {File} file - The file to import
 * @returns {Promise<boolean>} Success status
 */
export function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate imported data structure
                if (!importedData || typeof importedData !== 'object') {
                    throw new Error('Invalid data format');
                }
                
                // Merge with defaults to ensure all properties exist
                const mergedData = {
                    ...defaultData,
                    ...importedData,
                    weeklyPlan: { ...defaultData.weeklyPlan, ...importedData.weeklyPlan },
                    settings: { ...defaultData.settings, ...importedData.settings }
                };
                
                if (saveData(mergedData)) {
                    resolve(true);
                } else {
                    reject(new Error('Failed to save imported data'));
                }
            } catch (error) {
                console.error('Error parsing import file:', error);
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Error reading file'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Clear all data (with confirmation)
 * @param {boolean} confirmed - Whether user has confirmed
 * @returns {boolean} Success status
 */
export function clearAllData(confirmed = false) {
    if (!confirmed) {
        if (!confirm('Clear ALL data? This cannot be undone!')) {
            return false;
        }
        if (!confirm('Are you absolutely sure? All meals, plans, and tasks will be deleted.')) {
            return false;
        }
    }
    
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}

/**
 * Get storage usage information
 * @returns {Object} Storage info
 */
export function getStorageInfo() {
    try {
        const data = loadData();
        const dataStr = JSON.stringify(data);
        const bytes = new Blob([dataStr]).size;
        const kb = (bytes / 1024).toFixed(2);
        const mb = (bytes / 1024 / 1024).toFixed(2);
        
        // Estimate localStorage limit (usually 5-10MB)
        const estimatedLimit = 5 * 1024 * 1024; // 5MB
        const percentUsed = ((bytes / estimatedLimit) * 100).toFixed(1);
        
        return {
            bytes,
            kb,
            mb,
            percentUsed,
            itemCounts: {
                meals: data.meals.length,
                shoppingItems: data.shoppingList.length,
                householdItems: data.householdItems.length,
                cleaningTasks: data.cleaningTasks.length,
                maintenanceTasks: data.maintenanceTasks.length
            }
        };
    } catch (error) {
        console.error('Error getting storage info:', error);
        return null;
    }
}

/**
 * Check if storage is available
 * @returns {boolean} Whether localStorage is available
 */
export function isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Initialize storage (run on app start)
 * @returns {Object} Initial data
 */
export function initStorage() {
    if (!isStorageAvailable()) {
        console.warn('localStorage is not available');
        return defaultData;
    }
    
    const data = loadData();
    
    // If no data exists, save defaults
    if (!localStorage.getItem(STORAGE_KEY)) {
        saveData(defaultData);
        return defaultData;
    }
    
    return data;
}

// Export storage key for direct access if needed
export { STORAGE_KEY };
