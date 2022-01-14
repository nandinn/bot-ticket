const {
  SlashCommandBuilder
} = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bane uma pessoa')
    .addUserOption(option =>
      option.setName('membro')
      .setDescription('a ser banido')
      .setRequired(true))
    .addStringOption(option =>
      option.setName('motivo')
      .setDescription('Motivo do Ban')
      .setRequired(false)),
  async execute(interaction, client) {
    const user = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.options.getUser('membro').id);
    const executer = client.guilds.cache.get(interaction.guildId).members.cache.get(interaction.user.id);

    if (!executer.permissions.has(client.discord.Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({
      content: 'Você não\'tem permissão para executar esse comando ! (`BAN_MEMBERS`)',
      ephemeral: true
    });

    if (user.roles.highest.rawPosition > executer.roles.highest.rawPosition) return interaction.reply({
      content: 'A pessoa que você quer banir está acima de você !',
      ephemeral: true
    });

    if (!user.bannable) return interaction.reply({
      content: 'A pessoa que você quer banir está acima de mim! Então não posso banir.',
      ephemeral: true
    });

    if (interaction.options.getString('motivo')) {
      user.ban({
        reason: interaction.options.getString('motivo'),
        days: 1
      });
      interaction.reply({
        content: `**${user.user.tag}** 
        Foi banido com sucesso !`
      });
    } else {
      user.ban({
        days: 1
      });
      interaction.reply({
        content: `**${user.user.tag}** 
        Foi banido com sucesso !`
      });
    };
  },
};