/* ============================================
   APP.JS - Core Application
   Initialization, routing, and utilities
   ============================================ */

import { initStorage } from './storage.js';

/**
 * Initialize the application
 */
export function initApp() {
    // Initialize storage
    const data = initStorage();
    
    // Check for navigation state
    updateActiveNav();
    
    // Set up event listeners
    setupGlobalListeners();
    
    return data;
}

/**
 * Update active navigation tab
 */
export function updateActiveNav() {
    const currentPage = getCurrentPage();
    const navTabs = document.querySelectorAll('.nav-tab');
    
    navTabs.forEach(tab => {
        const section = tab.dataset.section;
        if (section === currentPage) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

/**
 * Get current page from URL
 */
export function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    
    // Map page names to section names
    const pageMap = {
        'index': 'dashboard',
        'meals': 'meals',
        'planner': 'planner',
        'shopping': 'shopping',
        'cleaning': 'cleaning',
        'maintenance': 'maintenance',
        'settings': 'settings'
    };
    
    return pageMap[page] || 'dashboard';
}

/**
 * Navigate to a page
 */
export function navigateToPage(page) {
    const pageMap = {
        'dashboard': 'index.html',
        'meals': 'pages/meals.html',
        'planner': 'pages/planner.html',
        'shopping': 'pages/shopping.html',
        'cleaning': 'pages/cleaning.html',
        'maintenance': 'pages/maintenance.html',
        'settings': 'pages/settings.html'
    };
    
    const url = pageMap[page];
    if (url) {
        window.location.href = url;
    }
}

/**
 * Setup global event listeners
 */
function setupGlobalListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modals
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Click outside modal to close
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

/**
 * Close all open modals
 */
export function closeAllModals() {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => modal.classList.remove('active'));
}

/**
 * Format date for display (UK format)
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Format date for input fields (ISO format)
 */
export function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

/**
 * Get today's date as ISO string
 */
export function getTodayISO() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Get day of week from date
 */
export function getDayOfWeek(dateString) {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Check if date is today
 */
export function isToday(dateString) {
    const today = getTodayISO();
    return dateString === today;
}

/**
 * Check if date is in the past
 */
export function isPast(dateString) {
    const today = getTodayISO();
    return dateString < today;
}

/**
 * Generate unique ID
 */
export function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Debounce function for search inputs
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show success message
 */
export function showSuccess(message, duration = 3000) {
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = message;
    
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, duration);
}

/**
 * Show error message
 */
export function showError(message, duration = 5000) {
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = message;
    
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, duration);
}

/**
 * Show info message
 */
export function showInfo(message, duration = 3000) {
    const div = document.createElement('div');
    div.className = 'info-message';
    div.textContent = message;
    
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.remove();
    }, duration);
}

/**
 * Confirm action with user
 */
export function confirmAction(message) {
    return confirm(message);
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showSuccess('Copied to clipboard');
        return true;
    } catch (error) {
        console.error('Copy failed:', error);
        showError('Failed to copy');
        return false;
    }
}

/**
 * Check if device is mobile
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device is iOS
 */
export function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) return formatDate(dateString);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

/**
 * Format price in GBP
 */
export function formatPrice(amount) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
    }).format(amount);
}

/**
 * Parse price from string
 */
export function parsePrice(priceString) {
    const cleaned = priceString.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
}

/**
 * Initialize app when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
