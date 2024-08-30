const fs = require('node:fs');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clips-setup')
		.setDescription('setup your clips channels.')
		.addChannelOption(option =>
			option.setName('clips')
				.setDescription('Channel to send clips to.')
		)
		.addChannelOption(option =>
			option.setName('share')
				.setDescription('Channel to take clips from.')
		)
		.addChannelOption(option =>
			option.setName('mod')
				.setDescription('Channel to mod clips from.')
		)
		.addChannelOption(option =>
			option.setName('hof')
				.setDescription('Channel to send clips to.')
		)
		.addChannelOption(option =>
			option.setName('hof_submissions')
				.setDescription('Channel to submit clips.')
		)
		.addBooleanOption(option =>
			option.setName('moderation')
				.setDescription('Moderation toggle.')
		)
		.addBooleanOption(option =>
			option.setName('hall_of_fame')
				.setDescription('Hall of fame toggle.')
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(client, interaction) {
		const clips_channel = interaction.options.getChannel('clips');
		const share_channel = interaction.options.getChannel('share');
		const mod_channel = interaction.options.getChannel('mod');
		const hof_channel = interaction.options.getChannel('hof');
		const hof_submissions_channel = interaction.options.getChannel('hof_submissions');
		const moderation = interaction.options.getBoolean('moderation');

		fs.writeFile('./test.json', JSON.stringify(client.clips_setup, null, 2), e => {
			if (e) {
				console.error(e);
				return;
			}
			console.log('data written');
		});
	},
};
