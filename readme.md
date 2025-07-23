# 🔥 BUGS-BOT 🔥

A powerful WhatsApp multi-function chatbot built . It includes command categories like AI chat (still under developement ), group management, and owner utilities – perfect for automation and entertainment.

---

## 🚀 Features

* 🌐 **AI-Powered Commands**: Use OpenAI for intelligent chat, translations, image generation, and definitions.
* 🛠 **Group Management**: Tools like `kick`, `tagall`, `setwelcome`, `ban`, and more.
* 👑 **Owner Utilities**: Remote bot control (`shutdown`, `restart`, `autobio`, etc).
* 🎮 **Fun and General**: Commands like `joke`, `roll`, `ping`, and styled `menu`.
* 🧠 **Optimized Performance**: Displays bot speed, RAM usage, and system stats in real-time.

---

## 📂 Folder Structure

```
.
├── commands/
│   ├── menu.js
│   ├── owner.js
│   ├── spam.js
│   └── ...
├── media/
│   └── menu.jpg
├── settings.js
├── index.js
├── handler.js
└── README.md
```

---

## ⚙️ Setup Instructions

1. **Clone this bot:**

```bash
git clone https://github.com/morel22/bugsbot.git
cd bugsbot
```

2. **Install dependencies:**

```bash
npm install
```

3. **Edit your `settings.js`:**

```js
export default {
  prefix: '.',
  version: '1.0.0',
  botOwnerNumbers: ['1234567890'], // Your WhatsApp number
  openAiKey: 'sk-xxxxxx', // Your OpenAI key (optional)
};
```

4. **Run the bot:**

```bash
node index.js
```

---

## 🔐 Permissions

| Command   | Who Can Use    |
| --------- | -------------- |
| `.menu`   | Everyone       |
| `.owner`  | Everyone       |
| `.spam`   | **Owner Only** |
| `.tagall` | Admins         |
| `.ask`    | Everyone (AI)  |

---

## 🖼️ Menu Preview

The menu shows all commands grouped in categories with stylish formatting and an optional image banner (`./media/menu.jpg`).

---

## 📌 Notes

* This bot uses [Baileys] for WhatsApp multi-device support.
* Make sure to create your session and scan your QR code before using.
* Ensure `menu.jpg` exists in the `media/` folder or the bot will send text instead.

---

## 🙏 Credits

* Inspired by KnightBot, EliteProBot, and OpenAI integrations.
* Developed with ❤️ by \[Ngoulla Morel].
