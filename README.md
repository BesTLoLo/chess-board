# Chess Scoreboard

An elegant chess scoreboard web application with MongoDB support for persistent data storage.

## Features

- Add and manage chess players
- Record match results (wins/draws)
- View player statistics and rankings
- Admin authentication system
- Persistent MongoDB storage
- Clean, responsive web interface

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd chess-board
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
   - Copy `env.example` to `.env`
   - Update the MongoDB connection string with your credentials:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chess-scoreboard?retryWrites=true&w=majority
   ```
   - Set your admin credentials:
   ```
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ```

4. Start the server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## MongoDB Setup

### Using MongoDB Atlas (Cloud)

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from the "Connect" button
6. Replace the placeholder values in your `.env` file

### Using Local MongoDB

If you prefer to use a local MongoDB instance:
```
MONGODB_URI=mongodb://localhost:27017/chess-scoreboard
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Use the admin credentials to log in to the admin panel
3. Add players and record matches
4. View the scoreboard with player statistics

## API Endpoints

### Public Endpoints
- `GET /api/players` - Get all players with statistics
- `GET /api/matches` - Get all matches

### Protected Endpoints (require authentication)
- `POST /api/players` - Add a new player
- `POST /api/matches` - Record a new match
- `DELETE /api/matches/:id` - Delete a match
- `POST /api/reset` - Reset all tournament data

### Authentication Endpoints
- `POST /api/login` - Login with admin credentials
- `POST /api/logout` - Logout
- `GET /api/auth/check` - Check authentication status

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `ADMIN_USERNAME` - Admin username for authentication
- `ADMIN_PASSWORD` - Admin password for authentication
- `SESSION_TIMEOUT` - Session timeout in milliseconds (default: 24 hours)

## Project Structure

```
chess-board/
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   ├── Player.js           # Player model
│   ├── Match.js            # Match model
│   ├── Session.js          # Session model
│   └── Counter.js          # Counter model for auto-incrementing IDs
├── utils/
│   └── helpers.js          # Utility functions
├── public/                 # Static web files
├── server.js              # Main server file
├── package.json
└── README.md
```

## License

MIT License