const { Client, Events, GatewayIntentBits } = require('discord.js');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.TOKEN);
