export default {
    // ✅ Command prefix used to trigger bot commands (e.g., .ping)
    prefix: '.',

    // 🤖 Bot display name (used in menus, welcome messages, etc.)
    botName: 'Bugs_bot',

    // 👋 Default welcome message for new group members
    welcomeMessage: `👋 *Welcome to Bugs_Bot-MD!*\nType *.menu* to get started.`,

    // 🔓 Allow commands in private chats (true = yes, false = group only)
    allowPrivateCommands: true,

    // 🧍 Respond to its own messages (useful for self-testing/debugging)
    allowSelfCommands: true,

    // 🕒 Cooldown between command usages per user (in seconds)
    commandCooldown: 2,

    // 👑 List of bot owners' WhatsApp numbers (without @s.whatsapp.net)
    // Example: ["237123456789", "237987654321"]
    botOwnerNumbers: ['237653871607', '237987654321'],

    // 📦 Bot version (shown in menu/status/info)
    version: '1.0.0',

    // 🤖 AI configuration
    ai: {
        provider: 'openai',  // or 'gpt4-free-proxy' if you want to use the free proxy
        endpoint: 'https://api.openai.com/v1/',  // OpenAI official endpoint
        apiKey: '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',  // <-- Add your OpenAI API key here once you have it
    },
};
