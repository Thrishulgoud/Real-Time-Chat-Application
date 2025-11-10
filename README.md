# Real-Time Chat Application

A full-stack real-time chat application with features like one-on-one messaging, group chats, message encryption, and read receipts.

## Features

- User authentication (registration and login)
- Real-time messaging using Socket.io
- One-on-one private chats
- Group chat functionality
- Message encryption
- Read receipts
- Online status indicators
- Typing indicators
- Responsive design

## Tech Stack

- Frontend:
  - React.js
  - Material-UI
  - Socket.io-client
  - Axios
  - React Router
  - CryptoJS

- Backend:
  - Node.js
  - Express.js
  - Socket.io
  - MongoDB with Mongoose
  - JWT for authentication
  - bcryptjs for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB installed and running locally
- npm or yarn package manager

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd real-time-chat-app
\`\`\`

2. Install server dependencies:
\`\`\`bash
cd server
npm install
\`\`\`

3. Install client dependencies:
\`\`\`bash
cd ../client
npm install
\`\`\`

4. Create .env files:

For server (.env in server directory):
\`\`\`
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-secret-key-here
MESSAGE_ENCRYPTION_KEY=your-encryption-key-here
\`\`\`

For client (.env in client directory):
\`\`\`
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_MESSAGE_KEY=your-encryption-key-here
\`\`\`

## Running the Application

1. Start the server:
\`\`\`bash
cd server
npm run dev
\`\`\`

2. Start the client (in a new terminal):
\`\`\`bash
cd client
npm start
\`\`\`

The application will be available at http://localhost:3000

## Security Considerations

- All messages are encrypted using CryptoJS
- Passwords are hashed using bcrypt
- JWT is used for authentication
- CORS is configured for security

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request