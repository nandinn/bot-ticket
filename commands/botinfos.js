const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Donne les crédits du bot.'),
  async execute(interaction, client) {
    const embed = new client.discord.MessageEmbed()
      .setColor('6d6ee8')
      .setDescription('Desenvolvido <:heart:901205849404493854> por </NandinN>#0062\n\n[<:github:901207749675851816>](https://github.com/nandinn)  [<:twitch:901207801643303012>](https://www.twitch.tv/nandinsz)  [<:discord:901207777765130300>](null)')
      .setFooter(client.config.footerText, client.user.avatarURL())
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  },
};