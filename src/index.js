const { Client, Events, GatewayIntentBits, ChannelType, Partials } = require('discord.js');

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
		Partials.Message,
		Partials.Channel,
	],});

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, message => {

	console.log(message); //can use message.content if you only want to get the message text
	if (message.content.includes("sushi") && !message.author.bot) {
		message.reply("yes please! I want sushi!")
	}

	if(message.channel.type === ChannelType.DM && !message.author.bot) { // Fix comparison here
        message.reply("Sneaking into my DMs, are we? I see you! 👀");
        message.reply("I'm a taken bot, please talk to me in a server instead");
		return;
    }
	
});

client.login(process.env.TOKEN);
