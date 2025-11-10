/* ============================================
   UI.JS - Shared UI Components
   Modals, filters, and common UI utilities
   ============================================ */

/**
 * Modal Management
 */

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        
        // Focus first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
        // Trap focus within modal
        trapFocus(modal);
    }
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

/**
 * Filter Management
 */

export class FilterManager {
    constructor() {
        this.activeFilters = {};
    }

    setFilter(category, value) {
        if (value === 'all' || value === '') {
            delete this.activeFilters[category];
        } else {
            this.activeFilters[category] = value;
        }
    }

    getFilter(category) {
        return this.activeFilters[category] || null;
    }

    clearFilters() {
        this.activeFilters = {};
    }

    hasActiveFilters() {
        return Object.keys(this.activeFilters).length > 0;
    }

    applyFilters(items, filterFn) {
        return items.filter(item => filterFn(item, this.activeFilters));
    }
}

/**
 * Update active filter button
 */
export function updateFilterButtons(groupSelector, activeValue) {
    const buttons = document.querySelectorAll(groupSelector);
    buttons.forEach(btn => {
        const btnValue = btn.dataset.filter || btn.dataset.dietary || 
                        btn.dataset.household || btn.dataset.freq || btn.value;
        
        if (btnValue === activeValue) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Image Upload Handling
 */

export function setupImageUpload(inputId, previewId, placeholderId, callback) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const placeholder = document.getElementById(placeholderId);
    
    if (!input || !preview) return;

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image too large. Please choose an image under 5MB.');
            return;
        }

        // Check file type
        if (!file.type.match('image.*')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
            if (placeholder) {
                placeholder.style.display = 'none';
            }
            
            if (callback) {
                callback(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Form Validation
 */

export function validateForm(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) return false;

    let isValid = true;
    const errors = [];

    Object.keys(rules).forEach(fieldName => {
        const field = form.elements[fieldName];
        const rule = rules[fieldName];

        if (rule.required && !field.value.trim()) {
            isValid = false;
            errors.push(`${rule.label} is required`);
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }

        if (rule.minLength && field.value.length < rule.minLength) {
            isValid = false;
            errors.push(`${rule.label} must be at least ${rule.minLength} characters`);
        }

        if (rule.maxLength && field.value.length > rule.maxLength) {
            isValid = false;
            errors.push(`${rule.label} must be less than ${rule.maxLength} characters`);
        }

        if (rule.pattern && !rule.pattern.test(field.value)) {
            isValid = false;
            errors.push(rule.patternMessage || `${rule.label} is invalid`);
        }
    });

    if (!isValid) {
        showValidationErrors(errors);
    }

    return isValid;
}

function showValidationErrors(errors) {
    const message = errors.join('\n');
    alert(message);
}

/**
 * Search Functionality
 */

export function setupSearch(inputId, items, searchFn, renderFn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const debouncedSearch = debounce((searchTerm) => {
        const filtered = items.filter(item => searchFn(item, searchTerm));
        renderFn(filtered);
    }, 300);

    input.addEventListener('input', (e) => {
        debouncedSearch(e.target.value.toLowerCase());
    });
}

function debounce(func, wait) {
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
 * Dropdown Menu
 */

export function setupDropdown(triggerSelector, menuSelector) {
    const trigger = document.querySelector(triggerSelector);
    const menu = document.querySelector(menuSelector);

    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
    });

    document.addEventListener('click', () => {
        menu.classList.remove('active');
    });
}

/**
 * Tabs
 */

export function setupTabs(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const tabs = container.querySelectorAll('[data-tab]');
    const panels = container.querySelectorAll('[data-panel]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanel = tab.dataset.tab;

            // Remove active from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active to clicked tab and corresponding panel
            tab.classList.add('active');
            const panel = container.querySelector(`[data-panel="${targetPanel}"]`);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
}

/**
 * Accordion
 */

export function setupAccordion(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const triggers = container.querySelectorAll('[data-accordion-trigger]');

    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const targetId = trigger.dataset.accordionTrigger;
            const content = document.getElementById(targetId);

            if (content) {
                const isOpen = content.classList.contains('active');
                
                // Close all accordions
                container.querySelectorAll('[data-accordion-content]').forEach(c => {
                    c.classList.remove('active');
                });

                // Open clicked accordion if it was closed
                if (!isOpen) {
                    content.classList.add('active');
                }

                // Update icon
                trigger.classList.toggle('active');
            }
        });
    });
}

/**
 * Toast Notifications
 */

let toastContainer = null;

function getToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

export function showToast(message, type = 'info', duration = 3000) {
    const container = getToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        padding: 12px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Confirmation Dialog
 */

export function confirmDialog(message, onConfirm, onCancel) {
    const dialog = document.createElement('div');
    dialog.className = 'modal active';
    dialog.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h2>Confirm Action</h2>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" data-action="cancel">Cancel</button>
                <button class="btn btn-danger" data-action="confirm">Confirm</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        if (onConfirm) onConfirm();
        dialog.remove();
    });
    
    dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        if (onCancel) onCancel();
        dialog.remove();
    });
    
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            if (onCancel) onCancel();
            dialog.remove();
        }
    });
}

/**
 * Loading Spinner
 */

export function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

export function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const loading = container.querySelector('.loading');
    if (loading) {
        loading.remove();
    }
}

/**
 * Empty State
 */

export function showEmptyState(containerId, icon, message, actionButton = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let html = `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <p>${message}</p>
    `;
    
    if (actionButton) {
        html += `<button class="btn btn-primary" onclick="${actionButton.action}">${actionButton.label}</button>`;
    }
    
    html += `</div>`;
    container.innerHTML = html;
}

/**
 * Skeleton Loader
 */

export function showSkeleton(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const skeletons = [];
    for (let i = 0; i < count; i++) {
        skeletons.push(`
            <div class="skeleton-card skeleton"></div>
        `);
    }
    
    container.innerHTML = skeletons.join('');
}

/**
 * Copy to Clipboard with Feedback
 */

export async function copyWithFeedback(text, message = 'Copied!') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(message, 'success');
        return true;
    } catch (error) {
        showToast('Failed to copy', 'error');
        return false;
    }
}

/**
 * File Size Formatter
 */

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Initialize UI enhancements
 */

export function initUI() {
    // Add CSS for animations
    if (!document.getElementById('ui-animations')) {
        const style = document.createElement('style');
        style.id = 'ui-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize UI on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}
