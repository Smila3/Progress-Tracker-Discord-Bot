const fs = require('node:fs');
//const path = require('node:path');

const { Client, Events, GatewayIntentBits, ChannelType, Partials, Collection } = require('discord.js');

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

	console.log(message.content); //can use message.content if you only want to get the message text

	if (message.content.includes("sushi") && !message.author.bot) {
		message.reply("yes please! I want sushi!")
	}

	if(message.channel.type === ChannelType.DM && !message.author.bot) { // Fix comparison here
        message.reply("Sneaking into my DMs, are we? I see you! 👀");
        message.reply("I'm a taken bot, please talk to me in a server instead");
		return;
    }
	
});

client.commands = new Collection();

const fpath = require('node:path');
const commandsPath = fpath.join(__dirname, 'commands');
//const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commandFolders = fs.readdirSync(commandsPath);

/*for (const file of commandFiles) {

	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}*/

for (const folder of commandFolders) {
    const folderPath = fpath.join(commandsPath, folder);
    if (fs.statSync(folderPath).isDirectory()) {
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = fpath.join(folderPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	console.log(interaction);

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}

});

client.login(process.env.TOKEN);
