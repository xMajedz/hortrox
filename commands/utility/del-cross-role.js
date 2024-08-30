const fs = require('node:fs');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('del-cross-role')
		.setDescription('Deletes cross role.')
		.addRoleOption(option =>
			option.setName('role')
			.setDescription('Cross server role.')
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(client, interaction) {
		const cross_role = interaction.options.getRole('role');

		if (!cross_role) {
			interaction.reply('no role given');
			return;
		}

		const guilds = new Array();
		//TODO: Handle undefined guilds
		for (const [guild_id, data] of client.cross_roles) {
			const cross_roles = new Array();

			for (const [name, id] of data.cross_roles) {
				if (interaction.guildId === guild_id && !(cross_role.name === name))
					cross_roles.push({ id: id, name: name });
			}

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

		interaction.reply(`<@&${cross_role.id}> cross role is deleted`);
	},
}
