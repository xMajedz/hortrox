const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	execute(client, interaction) {
		if (interaction.isChatInputCommand()) {

			const command = interaction.client.commands.get(interaction.commandName);
		
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
		
			try {
				//await command.execute(interaction);
				command.execute(client, interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					//await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
					interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					//await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
					interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		} else if (interaction.isButton()) {
			if (interaction.customId) {
				if (interaction.customId.match("approve")) {
					const clip_id = interaction.customId.slice(8);

					const { clips_channel_id, mod_channel_id } = client.clips_setup.get(interaction.guildId);

					const clips_channel = client.channels.cache.get(clips_channel_id);

					clips_channel.send(client.clips.get(clip_id));
					
					const mod_channel = client.channels.cache.get(mod_channel_id);

					mod_channel.messages.fetch(client.mod_message.get(clip_id)).then(message => {
						interaction.update({components: []});
					});
				}
			}
		}
	},
};
