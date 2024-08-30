const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list-reactions')
		.setDescription('Lists users recating to a message'),
		//.addChannelOption(),
		//.addMessageOption(),
	async execute(client, interaction) {
		client.channels.cache.get('1255715962196594691').messages.fetch('1258017225894531197').then(message => {
			message.reactions.cache.first().users.fetch().then(user => {
				const name = user.first().username;
				interaction.reply(name);
			});
		});
	},
};
