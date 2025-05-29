// Authentication API Configuration
const AUTH_API_BASE_URL = 'http://localhost:5000/api';

// Global Variables
let currentUser = null;
let authToken = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthStatus();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Check Authentication Status
function checkAuthStatus() {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
        authToken = savedToken;
        // Redirect to dashboard if on landing page
        if (window.location.pathname.includes('landing.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
    } else {
        // Redirect to landing if trying to access protected pages
        if (!window.location.pathname.includes('landing.html') && window.location.pathname !== '/') {
            window.location.href = 'landing.html';
        }
    }
}

// Navigation Functions
function showLanding() {
    document.getElementById('landingPage').style.display = 'block';
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'none';
}

function showLogin() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('registerContainer').style.display = 'none';
    document.getElementById('loginUsername').focus();
}

function showRegister() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'flex';
    document.getElementById('registerUsername').focus();
}

// Authentication API Functions
async function authApiCall(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Add auth token if available
        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }

        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(`${AUTH_API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Auth API call failed:', error);
        throw error;
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await authApiCall('/auth/login', 'POST', {
            username,
            password
        });
        
        // Store authentication data
        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    } catch (error) {
        hideLoading();
        console.error('Login error:', error);
        showNotification('Login failed. Please check your credentials.', 'error');
    }
}

// Handle Registration
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const age = document.getElementById('registerAge').value;
    const profession = document.getElementById('registerProfession').value;
    
    // Get selected interests
    const interestCheckboxes = document.querySelectorAll('input[name="interests"]:checked');
    const interests = Array.from(interestCheckboxes).map(cb => cb.value);
    
    // Validation
    if (!username || !password || !age || !profession) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (username.length < 3) {
        showNotification('Username must be at least 3 characters', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (age < 13 || age > 120) {
        showNotification('Please enter a valid age', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await authApiCall('/auth/register', 'POST', {
            username,
            password,
            age: parseInt(age),
            profession,
            interests
        });
        
        // Store authentication data
        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        showNotification('Registration successful! Welcome to SlothDo!', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        hideLoading();
        console.error('Registration error:', error);
        if (error.message.includes('already exists')) {
            showNotification('Username already exists. Please choose a different one.', 'error');
        } else {
            showNotification('Registration failed. Please try again.', 'error');
        }
    }
}

// Dashboard Functions
async function loadDashboard() {
    if (!authToken) {
        window.location.href = 'landing.html';
        return;
    }
    
    try {
        showLoading();
        const response = await authApiCall('/auth/dashboard');
        
        hideLoading();
        displayDashboard(response);
        
    } catch (error) {
        hideLoading();
        console.error('Dashboard load error:', error);
        if (error.message.includes('401') || error.message.includes('403')) {
            logout();
        } else {
            showNotification('Failed to load dashboard', 'error');
        }
    }
}

function displayDashboard(data) {
    const user = data.user;
    const stats = data.stats;
    
    // Update welcome message
    document.getElementById('dashboardUsername').textContent = user.username;
    
    // Update user info cards
    document.getElementById('userAge').textContent = user.age;
    document.getElementById('userProfession').textContent = 
        user.profession.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    document.getElementById('memberSince').textContent = 
        new Date(user.createdAt).toLocaleDateString();
    document.getElementById('lastLogin').textContent = 
        new Date(user.lastLogin).toLocaleDateString();
    
    // Update stats
    document.getElementById('totalLists').textContent = stats.totalLists;
    document.getElementById('totalItems').textContent = stats.totalItems;
    document.getElementById('completedItems').textContent = stats.completedItems;
    document.getElementById('pendingItems').textContent = stats.pendingItems;
    
    // Display interests
    const interestsContainer = document.getElementById('userInterests');
    interestsContainer.innerHTML = '';
    
    if (user.interests && user.interests.length > 0) {
        user.interests.forEach(interest => {
            const tag = document.createElement('span');
            tag.className = 'interest-tag';
            tag.textContent = interest.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            interestsContainer.appendChild(tag);
        });
    } else {
        interestsContainer.innerHTML = '<p style="color: var(--text-secondary);">No interests selected</p>';
    }
}

// Logout Function
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'landing.html';
}

// Navigate to Todo App
function goToTodoApp() {
    window.location.href = 'index.html';
}

// Edit Profile (placeholder)
function editProfile() {
    showNotification('Profile editing feature coming soon!', 'warning');
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

function showLoading() {
    const existingOverlay = document.querySelector('.loading-overlay');
    if (existingOverlay) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Interest display helper
function formatInterestName(interest) {
    return interest
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

// Interest icon helper
function getInterestIcon(interest) {
    const iconMap = {
        'art': 'fa-palette',
        'painting': 'fa-paint-brush',
        'web_development': 'fa-code',
        'app_development': 'fa-mobile-alt',
        'music': 'fa-music',
        'photography': 'fa-camera',
        'writing': 'fa-pen',
        'reading': 'fa-book',
        'gaming': 'fa-gamepad',
        'sports': 'fa-football-ball',
        'cooking': 'fa-utensils',
        'travel': 'fa-plane',
        'fitness': 'fa-dumbbell',
        'dancing': 'fa-music',
        'singing': 'fa-microphone',
        'coding': 'fa-laptop-code',
        'design': 'fa-drafting-compass',
        'entrepreneurship': 'fa-lightbulb',
        'marketing': 'fa-chart-line',
        'data_science': 'fa-chart-bar',
        'ai_ml': 'fa-robot',
        'blockchain': 'fa-link',
        'cybersecurity': 'fa-shield-alt',
        'mobile_dev': 'fa-mobile',
        'backend_dev': 'fa-server',
        'frontend_dev': 'fa-desktop'
    };
    
    return iconMap[interest] || 'fa-heart';
}

// Export functions for dashboard page
window.authFunctions = {
    loadDashboard,
    logout,
    goToTodoApp,
    editProfile,
    showNotification
}; 