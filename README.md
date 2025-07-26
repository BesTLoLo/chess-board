# ♟️ Chess Scoreboard

An elegant and modern chess scoreboard web application built with Node.js, Express, HTML, CSS, and JavaScript. Track your chess matches with style!

## ✨ Features

- **Real-time Score Tracking**: Keep track of wins for both players
- **Player Customization**: Edit player names with ease
- **Match History**: View detailed history of all games played
- **Draw Support**: Record draw games
- **Visual Feedback**: Beautiful animations and notifications
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Leading Player Indicator**: Visual highlight for the player currently ahead
- **Confetti Celebration**: Fun confetti animation when a player wins
- **Reset Functionality**: Reset the entire match when needed

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd chess-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎮 How to Use

### Basic Operations

1. **Update Player Names**: Click on the player name fields to edit them
2. **Record a Win**: Click the "Win Game" button under the winning player
3. **Record a Draw**: Click the "Draw Game" button in the controls section
4. **Reset Match**: Click "Reset Match" to clear all scores and history

### Interface Elements

- **Player Cards**: Show player names, scores, and win buttons
- **VS Section**: Displays current game number
- **Match History**: Shows chronological list of all games played
- **Visual Indicators**: Leading player gets a golden highlight
- **Notifications**: Toast messages for all actions
- **Confetti**: Celebration animation for wins

## 🛠️ Development

### Project Structure

```
chess-board/
├── package.json          # Node.js dependencies and scripts
├── server.js             # Express server and API endpoints
├── public/               # Static web files
│   ├── index.html        # Main HTML structure
│   ├── style.css         # Elegant styling
│   └── script.js         # Client-side functionality
└── README.md             # This file
```

### API Endpoints

- `GET /api/game` - Get current game data
- `POST /api/game/update` - Update player names
- `POST /api/game/score` - Record a win or draw
- `POST /api/game/reset` - Reset the entire match

### Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Styling**: CSS3 with gradients, animations, and Flexbox
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## 🎨 Design Features

- **Modern Glass-morphism**: Beautiful translucent cards with backdrop blur
- **Gradient Backgrounds**: Elegant purple gradient background
- **Smooth Animations**: Hover effects and transitions
- **Responsive Layout**: Adapts to different screen sizes
- **Color-coded Elements**: Different colors for different players and actions
- **Interactive Feedback**: Visual and notification feedback for all actions

## 📱 Responsive Design

The scoreboard automatically adapts to different screen sizes:
- **Desktop**: Full side-by-side layout
- **Tablet**: Adjusted spacing and sizing
- **Mobile**: Stacked layout with optimized touch targets

## 🔧 Customization

You can easily customize the appearance by modifying:
- Colors in `public/style.css`
- Player piece assignments (White/Black)
- Animation durations and effects
- Notification styles and messages

## 🎯 Future Enhancements

Potential improvements you could add:
- Timer functionality for timed games
- Tournament bracket support
- Player statistics and analytics
- Export match history
- Sound effects
- Multiple match formats
- Database persistence
- User accounts and profiles

## 📄 License

This project is licensed under the MIT License - feel free to use and modify as needed.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

---

**Enjoy your chess matches!** ♟️✨