const { Client, Events, GatewayIntentBits, ChannelType } = require('discord.js');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.DirectMessages

	], 

    partials: [
		'CHANNEL', 'MESSAGE'
	],});

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, message => {

	console.log(message); //can use message.content if you only want to get the message text
	if (message.content.includes("sushi") && !message.author.bot) {
		message.reply("yes please! I want sushi!")
	}
	
});

client.login(process.env.TOKEN);
