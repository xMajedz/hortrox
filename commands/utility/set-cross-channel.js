const fs = require('node:fs');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set-cross-channel')
		.setDescription('Sets cross channel.')
		.addChannelOption(option =>
			option.setName('channel')
			.setDescription('Cross server channel.')
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(client, interaction) {
		const channel = interaction.options.getChannel('channel');
		const cross_channel = channel ? channel.id : interaction.channelId;
		console.log(cross_channel)

		const guilds = new Array();
		//TODO: Handle undefined guilds
		for (const [guild_id, data] of client.cross_roles) {
			const cross_roles = new Array();

			for (const [name, id] of data.cross_roles) {
				cross_roles.push({ id: id, name: name });
			}

			if (interaction.guildId === guild_id)
				data.cross_channel_id = cross_channel;

			console.log(data.cross_channel_id);

			guilds.push({
				guild_id: guild_id,
				cross_channel_id: data.cross_channel_id,
				cross_roles: cross_roles,
			});
		}

		fs.writeFile('./cross-roles.json', JSON.stringify({ guilds: guilds }, null, 2), e => {
			if (e) {
				console.error(e);
				return;
			}

			console.log('Written cross-roles.json');
		});

		interaction.reply(`Cross channel set to <#${cross_channel}>`);
	},
};
