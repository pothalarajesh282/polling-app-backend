# 🗳️ Polling App - Backend

Backend API for the Mini Polling Application built with Node.js, Express, MySQL, and Socket.io.

## 🚀 Live Demo

- **Backend API**: [Your Vercel Backend URL]
- **Frontend**: [Your Vercel Frontend URL]

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Rate Limiting

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Polls

- `GET /api/polls` - Get all polls
- `POST /api/polls` - Create poll (Admin only)
- `POST /api/polls/:id/vote` - Vote on poll
- `GET /api/polls/:id/results` - Get poll results

## 🔧 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/polling-app-backend.git
cd polling-app-backend

# Install dependencies
npm install

# Set up environment
.env

# Run migrations
npm run migrate

# Start development server
npm run dev
```

🗄️ Database Schema
-------------------

- Users, Polls, Options, Votes tables

- Relationships with foreign keys

- Indexes for performance

🔒 Security Features
--------------------

- JWT authentication

- Password hashing with bcrypt

- Rate limiting

- Input validation

- CORS configuration

📞 Contact
----------

For questions, open an issue or contact \[your email\].
