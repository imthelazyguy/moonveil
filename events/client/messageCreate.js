const prefix = process.env.PREFIX || '!';

module.exports = {
  name: 'messageCreate',

  async execute(message, client) {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const command = client.commands.get(cmdName) || client.commands.find(cmd => cmd.aliases?.includes(cmdName));
    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(`Command ${cmdName} failed:`, error);
      message.reply('There was an error trying to execute that command.');
    }
  },
};
