# SlothDo - Todo List Manager

A modern, full-stack todo list application built with Node.js, Express, MongoDB, and vanilla JavaScript frontend.

![SlothDo Preview](https://img.shields.io/badge/Status-Complete-green)

## ✨ Features

### ✅ Implemented Features (as per your checklist)

- **Node.js Backend Application** - Complete REST API with Express
- **Create TodoList** - Create new todo lists with name and description
- **Edit TodoList Name** - Update list names and descriptions
- **Delete TodoList** - Remove lists and all associated items
- **Get TodoList** - Retrieve specific todo lists
- **Get One Item {UnitID}** - Find items by unique unit ID
- **Get All Items** - Retrieve all items from a specific list
- **Get All Items in Database** - Global item retrieval across all lists
- **Update Item {item_id, new_content}** - Modify item content and completion status
- **Frontend** - Beautiful, responsive web interface
- **Create Auth Page** - Login/Register modals (UI ready, backend placeholder)
- **List Description** - Full description support for todo lists

### 🚀 Additional Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Instant UI updates after operations
- **Modern UI/UX** - Beautiful design with animations and hover effects
- **Notification System** - Success/error feedback for all actions
- **Unique Unit IDs** - Auto-generated unique identifiers for items
- **Completion Tracking** - Mark items as complete/incomplete
- **Creation Timestamps** - Track when lists and items were created

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with CSS Variables, Font Awesome icons
- **Database**: MongoDB with Mongoose ODM

## 📁 Project Structure

```
SlothDo/
├── controllers/
│   ├── todos.js          # Original todo controller
│   ├── todoLists.js      # Todo list management
│   └── todoItems.js      # Individual item management
├── models/
│   ├── Todo.js           # Original todo model
│   ├── TodoList.js       # Todo list schema
│   └── TodoItem.js       # Todo item schema
├── routes/
│   ├── todos.js          # Original todo routes
│   ├── todoLists.js      # List management routes
│   └── todoItems.js      # Item management routes
├── frontend/
│   ├── index.html        # Main HTML file
│   ├── style.css         # Beautiful CSS styling
│   └── script.js         # Frontend JavaScript
├── server.js             # Main server file
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone or navigate to your project directory**
   ```bash
   cd SlothDo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/slothdo
   PORT=5000
   ```

4. **Start MongoDB**
   - **Local MongoDB**: Make sure MongoDB is running on your system
   - **MongoDB Atlas**: Update the MONGODB_URI in `.env` with your Atlas connection string

5. **Start the application**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 📚 API Documentation

### Todo Lists

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todolists` | Get all todo lists |
| GET | `/api/todolists/:id` | Get specific todo list |
| POST | `/api/todolists` | Create new todo list |
| PUT | `/api/todolists/:id` | Update todo list |
| DELETE | `/api/todolists/:id` | Delete todo list and all items |
| GET | `/api/todolists/:id/items` | Get all items from specific list |

### Todo Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todoitems` | Get all items in database |
| GET | `/api/todoitems/unit/:unitId` | Get item by unit ID |
| POST | `/api/todoitems` | Create new item |
| PUT | `/api/todoitems/:id` | Update item by ID |
| PUT | `/api/todoitems/unit/:unitId` | Update item by unit ID |
| DELETE | `/api/todoitems/:id` | Delete item by ID |
| DELETE | `/api/todoitems/unit/:unitId` | Delete item by unit ID |

### Example API Calls

**Create a new todo list:**
```javascript
POST /api/todolists
{
  "name": "My Shopping List",
  "description": "Weekly grocery shopping"
}
```

**Add item to list:**
```javascript
POST /api/todoitems
{
  "content": "Buy milk",
  "listId": "list_id_here",
  "completed": false
}
```

**Update item content:**
```javascript
PUT /api/todoitems/item_id_here
{
  "content": "Buy organic milk",
  "completed": true
}
```

## 🎨 Frontend Features

- **Responsive Grid Layout** - Sidebar for lists, main content area
- **Modal Dialogs** - For creating/editing lists and authentication
- **Interactive Items** - Click to complete, edit, delete
- **Real-time Notifications** - Success/error feedback
- **Keyboard Shortcuts** - Enter to save, ESC to close modals
- **Loading States** - Visual feedback during API calls

## 🔧 Development

### Available Scripts

- `npm start` - Run the production server
- `npm run dev` - Run with nodemon for development
- `npm test` - Run tests (placeholder)

### Development Tools

The frontend includes a development API for testing:
```javascript
// Open browser console and use:
window.devAPI.getAllItems()          // Get all items
window.devAPI.getItemByUnitId(id)    // Get item by unit ID
window.devAPI.showAuthModal()        // Show auth modal
```

## 🔮 Future Enhancements

- **User Authentication** - Complete JWT-based auth system
- **Real-time Collaboration** - Socket.io for live updates
- **File Attachments** - Upload files to todo items
- **Categories/Tags** - Organize lists with categories
- **Due Dates** - Add deadlines to items
- **Search & Filter** - Find items across all lists
- **Dark Mode** - Theme switching
- **Mobile App** - React Native or PWA version

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your connection string in `.env`
   - For Atlas, ensure network access is configured

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Or stop the process using port 5000

3. **CORS Issues**
   - The server includes CORS middleware
   - For production, configure specific origins

4. **Frontend Not Loading**
   - Ensure you're accessing `http://localhost:5000` (not a different port)
   - Check browser console for JavaScript errors

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Feel free to submit issues and pull requests to improve SlothDo!

---

**Happy Todo Managing! 🦥✅** 