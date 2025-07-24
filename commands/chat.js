// commands/chat.js
export const name = 'chat';
export const description = 'Ask anything to the AI';
export const usage = '.chat [question]';

export async function execute(sock, msg, args, { replyJid, sendReply }) {
    const question = args.join(' ');
    if (!question) {
        return sendReply(replyJid, '❓ Please ask a question.\n\nExample: `.chat What is JavaScript?`');
    }

    try {
        const fetch = (await import('node-fetch')).default;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // ← put your key in .env
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Or gpt-4 if available
                messages: [{ role: 'user', content: question }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.text();
            return sendReply(replyJid, `❌ OpenAI API error:\n${error}`);
        }

        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content || '🤖 No response from AI.';
        await sendReply(replyJid, `🤖 *AI says:*\n\n${aiReply}`);
    } catch (err) {
        console.error('AI Chat error:', err);
        return sendReply(replyJid, '⚠️ Failed to fetch response from OpenAI.');
    }
}
