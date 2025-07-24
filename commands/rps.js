export const name = 'rps';
export const description = 'Play rock-paper-scissors with the bot';
export const category = 'Games';

export async function execute(sock, msg, args, context) {
  const { sendReply } = context; // get sendReply from context

  if (args.length === 0) {
    return await sendReply(msg.key.remoteJid, 'Usage: .rps <rock|paper|scissors>');
  }

  const userChoice = args[0].toLowerCase();
  const choices = ['rock', 'paper', 'scissors'];
  if (!choices.includes(userChoice)) {
    return await sendReply(msg.key.remoteJid, 'Invalid choice! Choose rock, paper, or scissors.');
  }

  const botChoice = choices[Math.floor(Math.random() * choices.length)];

  let result = '';
  if (userChoice === botChoice) result = 'It\'s a tie!';
  else if (
    (userChoice === 'rock' && botChoice === 'scissors') ||
    (userChoice === 'paper' && botChoice === 'rock') ||
    (userChoice === 'scissors' && botChoice === 'paper')
  ) {
    result = 'You win! 🎉';
  } else {
    result = 'You lose! 😢';
  }

  await sendReply(msg.key.remoteJid, `You chose *${userChoice}*.\nI chose *${botChoice}*.\n${result}`);
}
