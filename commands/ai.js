export async function execute(sock, msg, args, context) {
    const chatId = msg.key.remoteJid;
    const prompt = args.join(' ');

    if (!prompt) {
        return await sock.sendMessage(chatId, {
            text: '❗ *Usage:* .ai <your prompt>'
        });
    }

    const openaiKey = settings.openaiApiKey;
    if (!openaiKey) {
        return await sock.sendMessage(chatId, {
            text: '⚠️ OpenAI API key not configured in settings.'
        });
    }

    try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ]
            })
        });

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;

        await sock.sendMessage(chatId, {
            text: reply || '⚠️ AI did not return a response.'
        });

    } catch (err) {
        console.error('❌ AI request failed:', err);
        await sock.sendMessage(chatId, {
            text: `❌ AI request failed: ${err.message}`
        });
    }
}
