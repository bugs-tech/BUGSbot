export const name = 'rps';
export const description = 'Play Rock-Paper-Scissors with the bot';

export async function execute(sock, msg, args) {
  const sendReply = async (jid, text) => {
    await sock.sendMessage(jid, { text });
  };

  const choices = ['rock', 'paper', 'scissors'];

  if (!args.length) {
    return sendReply(
      msg.key.remoteJid,
      `Please choose one:\n.rps rock\n.rps paper\n.rps scissors`
    );
  }

  const userChoice = args[0].toLowerCase();

  if (!choices.includes(userChoice)) {
    return sendReply(
      msg.key.remoteJid,
      `Invalid choice! Please pick one of:\nrock, paper, or scissors.\nExample: .rps rock`
    );
  }

  const botChoice = choices[Math.floor(Math.random() * choices.length)];

  let result = '';
  if (userChoice === botChoice) {
    result = "It's a tie! 🤝";
  } else if (
    (userChoice === 'rock' && botChoice === 'scissors') ||
    (userChoice === 'paper' && botChoice === 'rock') ||
    (userChoice === 'scissors' && botChoice === 'paper')
  ) {
    result = 'You win! 🎉';
  } else {
    result = 'You lose! 😢';
  }

  const reply = `You chose: *${userChoice}*\nI chose: *${botChoice}*\n\n${result}`;

  await sendReply(msg.key.remoteJid, reply);
}
