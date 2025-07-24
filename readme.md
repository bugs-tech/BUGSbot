

# 🐞 Bugs_Bot-MD 

Welcome to **Bugs_Bot-MD**, a powerful WhatsApp bot built with Node.js and [Baileys]. This bot includes features such as media commands, game commands, auto-replies, and admin-only tools like group broadcast and autolike.

---

## 📦 Features

- ✅ Command system with cooldown
- 🔁 Autolike, Autotyping, AutoviewStatus (owner-only)
- 🎮 Games: Hangman, RPS, Word Scramble, Tic Tac Toe
- 📥 YouTube & media downloaders
- 📸 Image tools: Blur, Rotate, ToImage, RemoveBG (API)
- 📡 Broadcast to groups (admin-only)
- 🔐 Owner-only features with dynamic detection
- 🎨 Customizable with `.env`

---

## ⚙️ Setup Instructions

### 🔧 Step 1: Clone the repository

```bash
git clone https://github.com/yourusername/bugs_bot-md
cd bugs_bot-md

📱 Step 2: Install Dependencies

npm install

📋 Step 3: Configure Environment Variables

Create a .env file in the root directory:

# .env file

BOT_PREFIX=.
BOT_NAME=Bugs_Bot
BOT_VERSION=1.0.0
WELCOME_MESSAGE=👋 Welcome to Bugs_Bot-MD! Type .menu to begin.

# Owner WhatsApp number(s), comma-separated (you can add your ID from .whoami command)
BOT_OWNER_NUMBERS=234XXXXXXXXXX,237XXXXXXXXXX

# Enable/disable features
ALLOW_PRIVATE_COMMANDS=true
ALLOW_SELF_COMMANDS=false
COMMAND_COOLDOWN=2

# AI config (if you use AI features)
AI_PROVIDER=openai
AI_ENDPOINT=https://api.openai.com/v1/
AI_API_KEY=your_openai_api_key

# Media APIs
REMOVE_BG_API_KEY=your_removebg_key
YOUTUBE_API_KEY=your_youtube_data_api_key
GOOGLE_CLIENT_ID=your_google_client_id

##🧠 Get Your WhatsApp ID

To allow yourself full access to owner-only commands, run this inside WhatsApp:

.whoami

Copy your number (e.g., 237XXXXXXXX) and add it to BOT_OWNER_NUMBERS in .env.
🧪 Running in Termux

    Install Node.js

pkg update && pkg upgrade
pkg install nodejs git ffmpeg

    Clone + setup

git clone https://github.com/yourusername/bugs_bot-md
cd bugs_bot-md
npm install

    Start the bot

node index.js

Scan the QR with WhatsApp.
☁️ Deploying on Render

    Create a new Node.js service on Render.com.

    Connect your GitHub repo.

    Add the following Environment Variables on Render Dashboard:

        BOT_NAME, BOT_PREFIX, etc.

        REMOVE_BG_API_KEY

        YOUTUBE_API_KEY

        GOOGLE_CLIENT_ID

        etc.

    Use node index.js as your start command.

    Make sure Render can write to a sessions/ folder (or change session path to use environment-safe storage).

##🧩 Available Commands

    .play <song name> — YouTube play and download

    .yta <url> — Download audio

    .ytv <url> — Download video

    .toimg, .blur, .rotate — Image tools

    .hangman, .rps, .scramble, .tictactoe — Fun games

    .autolike on/off, .autoviewstatus on/off — Owner features

    .gcbroadcast <msg> — Admin-only broadcast to groups

    .whoami — Shows your WhatsApp ID

    .menu — Full list

##📁 Folder Structure

├── commands/           # All command modules
├── lib/                # Utility modules (autotyping, like status, etc.)
├── sessions/           # Session data for Baileys
├── handler.js          # Main event dispatcher
├── settings.js         # Global settings
├── .env                # Environment variables
├── index.js            # Entry point
└── README.md           # You're here!

##🙋 FAQ

    Q: How do I become bot owner?
    Run .whoami and add your ID to .env under BOT_OWNER_NUMBERS.

    Q: My image commands fail.
    Ensure ffmpeg is installed and working.

    Q: I get API limit errors.
    Make sure to use your own API keys (RemoveBG, YouTube, etc.)

    

##📜 License

MIT — Free to use and modify, with attribution.
## 📞 Contact
**Author:** BUGS-BOT Dev
**WhatsApp:** [+237653871607](https://wa.me/237653871607)

---

## 📄 License
MIT License

## 🧠 Credits

* Inspired by KnightBot, EliteProBot, and OpenAI integrations.
* Developed with ❤️ by \[Ngoulla Morel].
Baileys by @adiwajshing

    Various open APIs and contributors
