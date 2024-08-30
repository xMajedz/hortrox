const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	once: false,
	execute(client, message) {
		if (message.author.bot) return;

		for (const [role_id, role] of message.mentions.roles) {
			//TODO: Rework thid mess
			const roles = client.cross_roles.get(message.guildId);
			if (!roles) break;

			for (const [ guild_id, cross_roles ] of client.cross_roles) {
				// Don't cross mention if current server doesn't have the mentioned cross role
				if (!client.cross_roles.get(message.guildId).cross_roles.has(role.name)) break;

				const role_id = cross_roles.cross_roles.get(role.name);
				const cross_channel_id = cross_roles.cross_channel_id;

				if (role_id && !(cross_channel_id === message.channelId))
					client.channels.cache.get(cross_channel_id).send(`<@&${role_id}>`);
			}
		}
		
		const clips_setup = client.clips_setup.get(message.guildId);

		if (!clips_setup) return;

		const { share_channel_id, clips_channel_id, mod_channel_id } = clips_setup;

		if (!share_channel_id) return;
		if (!clips_channel_id) return;

		if (!(message.channelId === share_channel_id)) return;

		const guild = client.guilds.cache.get(message.guildId);
		const member = guild.members.cache.get(message.author.id);

		let nick;

		if (message.author.username != null) nick = message.author.username;
		if (message.author.globalName != null) nick = message.author.globalName;
		if (member.nickname != null) nick = member.nickname;

		if (message.attachments.size > 0) {
			const attachments = message.attachments.filter(attachment =>
				attachment.contentType == "video/mp4" ||
				attachment.contentType == "video/mov" ||
				attachment.contentType == "video/quicktime" 
			);

			for (let [id, attachment] of attachments) {
				const clip_id = Math.random().toString(8).slice(2);
				const msg_link = `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}\n`;
				clips.set(clip_id, `${msg_link}Sent By: ${nick}\n${attachment.url}`);
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
				const msg_link = `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}\n`;
				client.clips.set(clip_id, `${msg_link}Sent By: ${nick}\n${link}`);
			}
		}

		const moderation = 1;

		if (moderation === 1 && mod_channel_id != null) {
			const mod_channel = client.channels.cache.get(mod_channel_id);

			for (let [clip_id, clip] of client.clips) {
				const approve = new ButtonBuilder()
					.setCustomId("approve " + clip_id)
					.setLabel("Approve")
					.setStyle(ButtonStyle.Success);

				const disapprove = new ButtonBuilder()
					.setCustomId("disapprove " + clip_id)
					.setLabel("Disapprove")
					.setStyle(ButtonStyle.Danger);
				const row = new ActionRowBuilder()
					.addComponents(approve, disapprove);

				mod_channel.send({ content: clip, components: [row] }).then(message => {
					client.mod_message.set(clip_id, message.id);
				});
			}
		} else {
			const clips_channel = client.channels.cache.get(clips_channel_id);

			for (let [clip_id, clip] of client.clips)
				clips_channel.send(clip);
		}

	}
};
