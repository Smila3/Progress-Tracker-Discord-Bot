const { Client, Events, GatewayIntentBits } = require('discord.js');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent
] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, message => {

	console.log(message); //can us message.content if you only want to get the message text
	if (message.content.includes("sushi")){
		message.reply("yes please! :3")
	}

});

client.login(process.env.TOKEN);
