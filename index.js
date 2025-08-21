import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";
import path from "path";
import pino from "pino";
import readline from "readline";
import { handleCommand, handleStatus, initGroupListeners } from "./handler.js";

const authFolder = "./auth";
const sessionsFolder = "./sessions";

// 📁 Load Anti-Link settings
const antiLinkPath = "./data/antilink.json";
let antiLinkData = fs.existsSync(antiLinkPath)
    ? JSON.parse(fs.readFileSync(antiLinkPath, "utf-8"))
    : {};

// 🎨 Glitch banner
const glitchBanner = `
██████   ██    ██   ██████   ███████ 
██   ██  ██    ██  ██        ██      
██████   ██    ██  ██   ███  ███████   
██   ██  ██    ██  ██    ██       ██      
██████    ██████    ██████   ███████


       █▓▒░ BOT DEVELOPER ░▒▓█
-----------------------------------------
\n\n\n
📱 Enter your WhatsApp number (e.g. 2348012345678): 
`;

// 📥 Ask user for number
async function askNumber() {
    console.clear();
    console.log(glitchBanner); // ✅ No animation

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => {
        rl.question("📱 Enter your WhatsApp number (e.g. 2348012345678): ", (num) => {
            rl.close();
            resolve(num.trim());
        });
    });
}

async function startBot() {
    // ✅ Auth and version setup
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    // 🔌 Create socket connection
    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        syncFullHistory: false
    });

    // 💾 Auto-save updated credentials
    sock.ev.on("creds.update", saveCreds);

    // 📩 Handle incoming messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const isGroup = msg.key.remoteJid.endsWith("@g.us");
        let text = msg.message?.conversation
            || msg.message?.extendedTextMessage?.text
            || msg.message?.imageMessage?.caption
            || msg.message?.videoMessage?.caption
            || msg.message?.documentMessage?.caption
            || "";

        // 🚫 Anti-link check (groups only)
        if (isGroup && antiLinkData[msg.key.remoteJid] && !msg.key.fromMe) {
            const linkRegex = /https?:\/\/[^\s]+/gi;
            if (linkRegex.test(text)) {
                try {
                    await sock.sendMessage(msg.key.remoteJid, { text: "🚫 *Link detected!* Message removed.", quoted: msg });
                    await sock.sendMessage(msg.key.remoteJid, {
                        delete: {
                            remoteJid: msg.key.remoteJid,
                            fromMe: false,
                            id: msg.key.id,
                            participant: msg.key.participant
                        }
                    });
                    console.log(`🚷 Deleted link message in ${msg.key.remoteJid}`);
                    return; // Skip command handling
                } catch (err) {
                    console.error("❌ Failed to delete message:", err);
                }
            }
        }

        // ⚙️ Handle commands and status
        await handleCommand(sock, msg);
        await handleStatus(sock, msg);
    });

    // ✅ Initialize group listeners for welcome/goodbye
    initGroupListeners(sock);

    // 🔁 Connection updates
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        // 🔑 Number-based pairing (if creds.json missing)
        const credsPath = path.join(authFolder, "creds.json");
        if (connection === "connecting" && !fs.existsSync(credsPath)) {
            const number = await askNumber();
            try {
                const code = await sock.requestPairingCode(number);
                console.log(`\n🔑 Your WhatsApp Pairing Code: ${code}\n`);

                await sock.sendMessage(number + "@s.whatsapp.net", {
                    text: `🔑 Your WhatsApp Pairing Code is: *${code}*\n\nEnter this on WhatsApp to link your bot.\n\n> 🤖 BUGS BOT`,
                });
                console.log(`📩 Pairing code sent to ${number}`);
            } catch (err) {
                console.error("❌ Failed to send pairing code:", err);
            }
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error instanceof Boom &&
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            console.log("⚠️ Connection closed. Reconnecting:", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("✅ Bot connected successfully");

            // 📦 Export session file once
            const sessionPath = path.join(sessionsFolder, "cred.js");
            if (!fs.existsSync(sessionPath)) {
                if (fs.existsSync(credsPath)) {
                    const credsData = fs.readFileSync(credsPath);
                    fs.writeFileSync(sessionPath, credsData);

                    const me = sock.user.id;
                    await sock.sendMessage(me, {
                        document: { url: sessionPath },
                        mimetype: "application/json",
                        fileName: "cred.js",
                        caption: `✅ *Your session file*\n\n⚠️ *Don't share this file.*\n\nTo reuse the bot`
                    });
                    console.log("📤 Sent session cred.js file to:", me);
                } else {
                    console.warn("❌ Could not find Baileys creds.json");
                }
            }
        }
    });
}

// 🚀 Start the bot
startBot();
