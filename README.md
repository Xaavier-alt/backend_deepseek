# Xylex Gaming Inc - Backend Server

Backend server for **XYLEX GAMING INCORPORATION** built with Node.js, Express, MongoDB, and Passport.js OAuth.

## Features

- ✅ Express.js REST API server
- ✅ MongoDB integration with Atlas
- ✅ OAuth 2.0 authentication (Google & Discord)
- ✅ User player registration and profiles
- ✅ Newsletter subscription system
- ✅ Game data management via JSON routes
- ✅ Technology stack showcase
- ✅ Server-side game detail pages
- ✅ Security with Helmet.js & CORS
- ✅ Session management with express-session

## Prerequisites

- **Node.js** 18.x - 22.x
- **npm** 9.x or higher
- **MongoDB Atlas** account (free tier works)
- **Google OAuth** credentials (optional, for Google sign-in)
- **Discord OAuth** credentials (optional, for Discord sign-in)

## Installation

1. **Clone/Navigate to the project**
```bash
cd backend_deepseek
```

2. **Install dependencies**
```bash
npm install
```

3. **Create your `.env` file**
```bash
cp .env.example .env
```

4. **Configure `.env` variables**
Edit `.env` with your actual credentials:
```
PORT=5000
NODE_ENV=development
SESSION_SECRET=your_secret_key_here
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `GET /auth/google` - Start Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/discord` - Start Discord OAuth flow
- `GET /auth/discord/callback` - Discord OAuth callback
- `GET /profile` - Get authenticated user profile
- `GET /logout` - Logout current user

### Players
- `GET /api/players` - Get all players (limited to 100)
- `POST /api/player` - Register a new player
  - Body: `{ "username": "string", "email": "string" }`

### Games
- `GET /api/games` - Get all games
- `GET /api/games?search=query` - Search games
- `GET /games/:slug` - Get game detail page (server-rendered)

### Technology
- `GET /api/technology` - Get technology stack info

### Newsletter
- `POST /api/newsletter` - Subscribe to newsletter
  - Body: `{ "email": "string" }`

### Health Check
- `GET /api/health` - Server status and database connection status

## Project Structure

```
backend_deepseek/
├── server.js                 # Main server file
├── package.json             # Dependencies & scripts
├── .env.example             # Example environment variables
├── README.md                # This file
├── public/                  # Static assets & frontend files
│   ├── index.html
│   ├── company.html
│   ├── jobs.html
│   ├── careers.html
│   ├── support.html
│   ├── news.html
│   ├── js/
│   │   └── main.js         # Frontend logic
│   └── images/             # Game and company images
├── routes/
│   ├── games.js            # Game data routes
│   └── technology.js       # Technology data routes
├── data/
│   ├── games.json          # Game listings
│   └── technology.json     # Tech stack data
└── node_modules/           # Dependencies (auto-generated)
```

## Configuration Details

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Server port (default: 5000) |
| NODE_ENV | No | Environment mode (development/production) |
| SESSION_SECRET | Yes | Session encryption key |
| MONGODB_URI | Yes | MongoDB connection string |
| GOOGLE_CLIENT_ID | No | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | No | Google OAuth client secret |
| GOOGLE_CALLBACK_URL | No | Google OAuth redirect URI |
| DISCORD_CLIENT_ID | No | Discord OAuth client ID |
| DISCORD_CLIENT_SECRET | No | Discord OAuth client secret |
| DISCORD_CALLBACK_URL | No | Discord OAuth redirect URI |
| FRONTEND_URLS | No | Allowed CORS origins (comma-separated) |

### MongoDB Collections

- **players** - User accounts (username, email, createdAt)
- **newsletter** - Newsletter subscribers (email, subscribedAt)

## Deployment

### Deploy to Render.com

1. Push code to GitHub
2. Create new Render service from Git repo
3. Set environment variables in Render dashboard
4. Set build command: `npm install`
5. Set start command: `npm start`

### Deploy to Heroku

```bash
heroku create your-app-name
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set SESSION_SECRET="your_secret"
git push heroku main
```

## Troubleshooting

### MongoDB Connection Failed
- ✓ Verify MONGODB_URI in .env
- ✓ Check MongoDB Atlas IP whitelist includes your IP
- ✓ Ensure database user credentials are correct

### OAuth Not Working
- ✓ Verify CLIENT_ID and CLIENT_SECRET are correct
- ✓ Check redirect URIs match in OAuth provider settings
- ✓ Ensure FRONTEND_URLS includes your domain in CORS

### Images Not Loading
- ✓ Check images are in `public/images/` folder
- ✓ Verify image paths in games.json are correct
- ✓ Server serves static files from `public/` directory

### Port Already in Use
```bash
# Kill process using port 5000
# Windows: netstat -ano | findstr :5000, then taskkill /PID <PID> /F
# Mac/Linux: lsof -i :5000, then kill -9 <PID>
```

## Development Tips

- Use `npm run dev` for development with auto-reload
- Check `package.json` for all available scripts
- MongoDB Compass useful for managing databases locally
- Check server console for detailed error messages

## Security Notes

⚠️ **Important Security Measures:**
- Never commit `.env` file to Git
- Use strong SESSION_SECRET in production
- Keep MONGODB_URI and OAuth secrets secure
- Validate all user input on backend
- Use HTTPS in production
- Keep dependencies updated: `npm audit fix`

## Common Issues Fixed in This Version

✅ Fixed CSS `background-clip` compatibility warnings  
✅ Fixed technology.json data structure  
✅ Added static file serving for entire public directory  
✅ Fixed CORS configuration  
✅ Added .env.example for easy setup  

## Support

For issues or questions:
- Email: xylexgaminginc@gmail.com
- Twitter: https://x.com/Xylexgaminginc
- Discord: https://discord.gg/xylexgaming

## License

MIT License © 2026 Xylex Gaming Inc. All rights reserved.
