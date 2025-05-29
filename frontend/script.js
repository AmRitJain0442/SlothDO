// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global Variables
let currentListId = null;
let currentListData = null;
let isEditingList = false;

// DOM Elements
const todoLists = document.getElementById('todoLists');
const contentHeader = document.getElementById('contentHeader');
const itemsSection = document.getElementById('itemsSection');
const welcomeMessage = document.getElementById('welcomeMessage');
const currentListName = document.getElementById('currentListName');
const currentListDescription = document.getElementById('currentListDescription');
const itemsContainer = document.getElementById('itemsContainer');
const newItemContent = document.getElementById('newItemContent');
const listModal = document.getElementById('listModal');
const authModal = document.getElementById('authModal');

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadTodoLists();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Enter key handlers
    newItemContent.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addItem();
        }
    });

    document.getElementById('listName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveList();
        }
    });

    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target === listModal) {
            closeModal();
        }
        if (e.target === authModal) {
            closeAuthModal();
        }
    });
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showNotification('API call failed: ' + error.message, 'error');
        throw error;
    }
}

// TodoList Functions
async function loadTodoLists() {
    try {
        const lists = await apiCall('/todolists');
        displayTodoLists(lists);
    } catch (error) {
        console.error('Failed to load todo lists:', error);
    }
}

function displayTodoLists(lists) {
    todoLists.innerHTML = '';
    
    if (lists.length === 0) {
        todoLists.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No lists yet. Create your first list!</p>';
        return;
    }

    lists.forEach(list => {
        const listElement = document.createElement('div');
        listElement.className = 'todo-list-item';
        listElement.onclick = () => selectList(list._id, list);
        
        listElement.innerHTML = `
            <h4>${escapeHtml(list.name)}</h4>
            <p>${escapeHtml(list.description || 'No description')}</p>
            <div class="todo-item-meta">Created: ${new Date(list.createdAt).toLocaleDateString()}</div>
        `;
        
        todoLists.appendChild(listElement);
    });
}

async function selectList(listId, listData) {
    // Update active state
    document.querySelectorAll('.todo-list-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    currentListId = listId;
    currentListData = listData;

    // Update UI
    currentListName.textContent = listData.name;
    currentListDescription.textContent = listData.description || 'No description';
    
    // Show content sections
    welcomeMessage.style.display = 'none';
    contentHeader.style.display = 'flex';
    itemsSection.style.display = 'block';

    // Load items for this list
    await loadItemsForList(listId);
}

async function loadItemsForList(listId) {
    try {
        const items = await apiCall(`/todolists/${listId}/items`);
        displayItems(items);
    } catch (error) {
        console.error('Failed to load items:', error);
        itemsContainer.innerHTML = '<p style="text-align: center; color: var(--danger-color);">Failed to load items</p>';
    }
}

function displayItems(items) {
    itemsContainer.innerHTML = '';
    
    if (items.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No items yet. Add your first item above!</p>';
        return;
    }

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `todo-item ${item.completed ? 'completed' : ''}`;
        
        itemElement.innerHTML = `
            <input type="checkbox" ${item.completed ? 'checked' : ''} 
                   onchange="toggleItemCompletion('${item._id}', this.checked)">
            <div class="todo-item-content">${escapeHtml(item.content)}</div>
            <div class="todo-item-actions">
                <button class="btn btn-small btn-secondary" onclick="editItem('${item._id}', '${escapeHtml(item.content)}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteItem('${item._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="todo-item-meta">
                Unit ID: ${item.unitId} | Created: ${new Date(item.createdAt).toLocaleDateString()}
            </div>
        `;
        
        itemsContainer.appendChild(itemElement);
    });
}

// Modal Functions
function showCreateListModal() {
    isEditingList = false;
    document.getElementById('modalTitle').textContent = 'Create New List';
    document.getElementById('saveListBtn').textContent = 'Create List';
    document.getElementById('listName').value = '';
    document.getElementById('listDescription').value = '';
    listModal.style.display = 'block';
    document.getElementById('listName').focus();
}

function editCurrentList() {
    if (!currentListData) return;
    
    isEditingList = true;
    document.getElementById('modalTitle').textContent = 'Edit List';
    document.getElementById('saveListBtn').textContent = 'Update List';
    document.getElementById('listName').value = currentListData.name;
    document.getElementById('listDescription').value = currentListData.description || '';
    listModal.style.display = 'block';
    document.getElementById('listName').focus();
}

function closeModal() {
    listModal.style.display = 'none';
}

async function saveList() {
    const name = document.getElementById('listName').value.trim();
    const description = document.getElementById('listDescription').value.trim();
    
    if (!name) {
        showNotification('Please enter a list name', 'error');
        return;
    }

    try {
        const listData = { name, description };
        
        if (isEditingList) {
            await apiCall(`/todolists/${currentListId}`, 'PUT', listData);
            showNotification('List updated successfully!', 'success');
            currentListData = { ...currentListData, ...listData };
            currentListName.textContent = name;
            currentListDescription.textContent = description || 'No description';
        } else {
            await apiCall('/todolists', 'POST', listData);
            showNotification('List created successfully!', 'success');
        }
        
        closeModal();
        loadTodoLists();
    } catch (error) {
        console.error('Failed to save list:', error);
    }
}

async function deleteCurrentList() {
    if (!currentListId) return;
    
    if (!confirm(`Are you sure you want to delete "${currentListData.name}" and all its items?`)) {
        return;
    }

    try {
        await apiCall(`/todolists/${currentListId}`, 'DELETE');
        showNotification('List deleted successfully!', 'success');
        
        // Reset UI
        currentListId = null;
        currentListData = null;
        contentHeader.style.display = 'none';
        itemsSection.style.display = 'none';
        welcomeMessage.style.display = 'block';
        
        loadTodoLists();
    } catch (error) {
        console.error('Failed to delete list:', error);
    }
}

// Item Functions
async function addItem() {
    const content = newItemContent.value.trim();
    
    if (!content) {
        showNotification('Please enter item content', 'error');
        return;
    }

    if (!currentListId) {
        showNotification('Please select a list first', 'error');
        return;
    }

    try {
        await apiCall('/todoitems', 'POST', {
            content,
            listId: currentListId
        });
        
        newItemContent.value = '';
        showNotification('Item added successfully!', 'success');
        loadItemsForList(currentListId);
    } catch (error) {
        console.error('Failed to add item:', error);
    }
}

async function toggleItemCompletion(itemId, completed) {
    try {
        await apiCall(`/todoitems/${itemId}`, 'PUT', { completed });
        loadItemsForList(currentListId);
    } catch (error) {
        console.error('Failed to update item:', error);
    }
}

async function editItem(itemId, currentContent) {
    const newContent = prompt('Edit item:', currentContent);
    
    if (newContent === null || newContent.trim() === '') {
        return;
    }

    try {
        await apiCall(`/todoitems/${itemId}`, 'PUT', {
            content: newContent.trim()
        });
        
        showNotification('Item updated successfully!', 'success');
        loadItemsForList(currentListId);
    } catch (error) {
        console.error('Failed to update item:', error);
    }
}

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        await apiCall(`/todoitems/${itemId}`, 'DELETE');
        showNotification('Item deleted successfully!', 'success');
        loadItemsForList(currentListId);
    } catch (error) {
        console.error('Failed to delete item:', error);
    }
}

// Authentication Functions (Placeholder)
function showAuthModal() {
    authModal.style.display = 'block';
}

function closeAuthModal() {
    authModal.style.display = 'none';
}

function showLoginForm() {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Placeholder for authentication
    showNotification('Authentication feature coming soon!', 'warning');
    closeAuthModal();
}

function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    // Placeholder for authentication
    showNotification('Authentication feature coming soon!', 'warning');
    closeAuthModal();
}

// Utility Functions
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Additional API Testing Functions (for development)
async function getAllItems() {
    try {
        const items = await apiCall('/todoitems');
        console.log('All items in database:', items);
        return items;
    } catch (error) {
        console.error('Failed to get all items:', error);
    }
}

async function getItemByUnitId(unitId) {
    try {
        const item = await apiCall(`/todoitems/unit/${unitId}`);
        console.log('Item by unitId:', item);
        return item;
    } catch (error) {
        console.error('Failed to get item by unitId:', error);
    }
}

// Expose functions to global scope for development/testing
window.devAPI = {
    getAllItems,
    getItemByUnitId,
    apiCall,
    loadTodoLists,
    showAuthModal
}; 