const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const intents = new Array();

intents.push(GatewayIntentBits.Guilds);
intents.push(GatewayIntentBits.GuildMembers);
intents.push(GatewayIntentBits.GuildMessages);
intents.push(GatewayIntentBits.MessageContent);

const client = new Client({ intents: intents });

client.clips = new Collection();

client.mod_message = new Collection();

client.cross_roles = new Collection();

fs.readFile('./cross-roles.json', 'utf8', (e, data) => {
	if (e) {
		console.error(e);
		return;
	}

	const { guilds } = JSON.parse(data);

	for (const {guild_id, cross_channel_id, cross_roles} of guilds) {
		const roles = new Collection();
		for (const {id, name} of cross_roles) {
			roles.set(name, id);
		}
		client.cross_roles.set(guild_id, { cross_channel_id: cross_channel_id, cross_roles: roles });
	}
});

client.clips_setup = new Collection();

fs.readFile('./clips-setup.json', 'utf8', (e, data) => {
	if (e) {
		console.error(e);
		return;
	}

	const { guilds } = JSON.parse(data);

	for (const {guild_id, setup} of guilds)
		client.clips_setup.set(guild_id, setup);
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(client, ...args));
	}
}

client.login(token);
