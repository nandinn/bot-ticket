const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Expulsa uma pessoa.')
    .addUserOption(option =>
      option.setName('membro')
      .setDescription('Membro a ser Kickado')
      .setRequired(true))
    .addStringOption(option =>
        option.setName('motivo')
        .setDescription('Motivo do Kick')
        .setRequired(false)),
  async execute(interaction, client) {
    const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('membro').id);
    const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);

    if (!executer.permissions.has(client.discord.Permissions.FLAGS.KICK_MEMBERS)) return interaction.reply({
      content: 'Você não\'tem permissão para executar esse comando ! (`KICK_MEMBERS`)',
      ephemeral: true
    });

    if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
      content: 'A pessoa que você quer expulsar está acima de você !',
      ephemeral: true
    });

    if (!user.kickable) return interaction.reply({
      content: 'A pessoa que você quer expulsar está acima de mim! Então não posso expulsar.',
      ephemeral: true
    });

    if (interaction.options.getString('motivo')) {
      user.kick(interaction.options.getString('motivo'))
      interaction.reply({
        content: `**${user.user.tag}** Foi expulso com sucesso !`
      });
    } else {
      user.kick()
      interaction.reply({
        content: `**${user.user.tag}** Foi expulso com sucesso !`
      });
    };
  },
};