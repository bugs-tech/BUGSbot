import fetch from 'node-fetch';

export const name = 'joke';
export const description = 'Tells a random joke';
export const category = 'Fun';

export async function execute(sock, msg, args, context) {
  const { sendReply } = context;

  try {
    const res = await fetch('https://api.giftedtech.co.ke/api/fun/jokes?apikey=gifted');
    const data = await res.json();

    if (data.status === 200 && data.success && data.result) {
      const { setup, punchline } = data.result;

      await sendReply(`${setup}\n\n${punchline}`);
    } else {
      await sendReply('😅 Sorry, I could not fetch a joke right now. Try again later.');
    }
  } catch (e) {
    console.error('Error fetching joke:', e);
    await sendReply('😅 Sorry, something went wrong while fetching a joke.');
  }
}
