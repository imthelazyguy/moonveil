// deploy/deploy-commands.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

// Load environment variables
const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;

// Array to hold all slash command data
const commands = [];

// Path to command folders
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFolders = fs.readdirSync(commandsPath);

// Traverse through folders and collect slash command data
for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs
    .readdirSync(folderPath)
    .filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }
}

// Initialize Discord REST client
const rest = new REST({ version: '10' }).setToken(TOKEN);

// Deploy commands to the specified guild
(async () => {
  try {
    console.log(`🛠️  Refreshing ${commands.length} application (/) commands...`);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), // Change to Routes.applicationCommands if global
      { body: commands }
    );

    console.log(`✅ Successfully reloaded slash commands for guild ${GUILD_ID}`);
  } catch (error) {
    console.error('❌ Error while deploying commands:', error);
  }
})();
