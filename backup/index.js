const mysql = require("mysql");
const { token, client_id, host, user, password, database } = require("./config.json");
const {
	Client,
	Events,
	Collection,
	GatewayIntentBits,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

const db = mysql.createConnection({
	host: host,
	user: user,
	password: password, 
	database: database,
});

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.once(Events.ClientReady, c => {
	console.log(c.user.username + " is Online");
});

db.connect(err => {
	if (err) throw err;
	console.log("Connected to MySQL server");
});

client.on(Events.MessageCreate, message=> {
	if (message.author.bot) return;

	db.query("SELECT * FROM setup WHERE guild_id = " + message.guildId, (err, result) => {
		if(err) throw err;

		if (result.length === 0) return;

		const share_channel_id = result[0].share_channel_id;

		if (share_channel_id === null || !(share_channel_id === message.channelId)) return;

		const mod_channel_id = result[0].mod_channel_id;
		const moderation = result[0].moderation;

		const guild = client.guilds.cache.get(message.guildId);
		const member = guild.members.cache.get(message.author.id);

		let nick;

		if (message.author.username != null) nick = message.author.username;
		if (message.author.globalName != null) nick = message.author.globalName;
		if (member.nickname != null) nick = member.nickname;

		const clips = new Collection();

		if (message.attachments.size > 0) {
			const attachments = message.attachments.filter(attachment =>
				attachment.contentType == "video/mp4" ||
				attachment.contentType == "video/mov" ||
				attachment.contentType == "video/quicktime" 
			);

			for (let attachment of attachments) {
				const clip_id = Math.random().toString(8).slice(2);
				const msg_link = "https://discord.com/channels/" + message.guildId + "/" + message.channelId + "/" + message.id + "\n";
				clips.set(clip_id, msg_link + "Sent By: " + nick + "\n" + attachment[1].url);
			}
		}
		
		if(message.content != "") {
			const content = message.content.split(" ");
			const links = content.filter(link => /https*:\/\//.test(link));
			const filtered = links.filter(link => 
				/discordapp.net/.test(link) ||
				/discordapp.com/.test(link) ||
				/discord.net/.test(link) ||
				/discord.com/.test(link) ||
				/imgur.com/ ||
				/gyazo.com/
			);

			for (let link of filtered) {
				const clip_id = Math.random().toString(16).slice(2);
				const msg_link = "https://discord.com/channels/" + message.guildId + "/" + message.channelId + "/" + message.id + "\n";
				clips.set(clip_id, msg_link + "Sent By: " + nick + "\n" + link);
			}
		}
		
		if (moderation === 1 && mod_channel_id != null) {
			const mod_channel = client.channels.cache.get(mod_channel_id);

			for (let clip of clips) {
				db.query("INSERT INTO queue (guild_id, clip_id, content) VALUES (" + message.guildId + ", '" + clip[0] + "', '" + clip[1] + "');",
					(err, result) => { if (err) throw err; });

				const approve = new ButtonBuilder()
					.setCustomId("approve " + clip[0])
					.setLabel("Approve")
					.setStyle(ButtonStyle.Success);

				const disapprove = new ButtonBuilder()
					.setCustomId("disapprove " + clip[0])
					.setLabel("Disapprove")
					.setStyle(ButtonStyle.Danger);
				const row = new ActionRowBuilder()
					.addComponents(approve, disapprove);

				mod_channel.send({ content: clip[1], components: [row] });
			}
		} else {
			const clips_channel = client.channels.cache.get(clips_channel_id);

			for (let clip of clips) {
				clips_channel.send(clip[1]);
			}
		}
	});
});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.customId) {
		if (interaction.customId.match("approve")) {
			const clip_id = interaction.customId.slice(8);

			db.query("SELECT content FROM queue WHERE clip_id = '" + clip_id + "';", (err, result) => {
				if (err) throw err;

				if (result.length === 0) return;

				const content = result[0].content;

				if (content === null) return;

				db.query("SELECT clips_channel_id FROM setup WHERE guild_id = " + interaction.guildId, (err, result) => {
					if (err) throw err;

					if (result.length === 0) return;

					const clips_channel_id = result[0].clips_channel_id;
				
					if (clips_channel_id === null) return;

					const clips_channel = client.channels.cache.get(clips_channel_id);

					clips_channel.send(content)

					db.query("DELETE FROM queue WHERE clip_id = '" + clip_id + "';", err => { if (err) throw err; });
				});

			});

			await interaction.reply({ content: "Approve", ephemeral: true });
		} else if (interaction.customId.match("disapprove")) {
			const clip_id = interaction.customId.slice(11);

			db.query("DELETE FROM queue WHERE clip_id = '" + clip_id + "';", err => { if (err) throw err; });

			await interaction.reply({ content: "Disapprove", ephemeral: true });
		}
	}
});

client.login(token);
