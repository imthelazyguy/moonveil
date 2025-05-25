require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

const commands = [];
for (const folder of fs.readdirSync('./commands')) {
  for (const file of fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith('.js'))) {
    const cmd = require(`./commands/${folder}/${file}`);
    if (cmd.data) commands.push(cmd.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);
(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Commands reloaded.');
  } catch (e) {
    console.error(e);
  }
})();
