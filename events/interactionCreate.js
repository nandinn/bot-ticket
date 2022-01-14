let hastebin = require('hastebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "open-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Você Já Criou um ticket!',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.categoriaticket,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Ticket criado, lá você poderá selecionar sua categoria! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('#000000')
          .setAuthor('Ticket', 'https://media.discordapp.net/attachments/894859371643822090/914638076393963540/mail-animation-2.gif')
          .setDescription('Selecione a Categoria do ticket!')
          .setFooter('Sistema de Tickets', 'https://media.discordapp.net/attachments/894859371643822090/914638076393963540/mail-animation-2.gif')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Selecione a categoria do Ticket')
            .addOptions([{
                label: 'Compras',
                value: 'compras',
                emoji: '🛒',
              },
              {
                label: 'Suporte',
                value: 'suporte',
                emoji: '📞',
              },
              {
                label: 'Outros',
                value: 'outros',
                emoji: '🔍',
              },
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('#000000')
                  .setAuthor('Ticket', 'https://media.discordapp.net/attachments/894859371643822090/914638076393963540/mail-animation-2.gif')
                  .setDescription(`<@!${interaction.user.id}> Criou um ticket sobre: ${i.values[0]}`)
                  .setFooter('Sistema de Tickets', 'https://media.discordapp.net/attachments/894859371643822090/914638076393963540/mail-animation-2.gif')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('close-ticket')
                    .setLabel('FECHAR O TICKET')
                    .setEmoji('❌')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'compras') { // CATEGORIA 1 NOME DA OPÇAO
              c.edit({
                parent: client.config.categoria1
              });
            };
            if (i.values[0] == 'suporte') { // CATEGORIA 2 NOME DA OPÇAO
              c.edit({
                parent: client.config.categoria2
              });
            };
            if (i.values[0] == 'outros') { // CATEGORIA 3 NOME DA OPÇAO
              c.edit({
                parent: client.config.categoria3
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Nenhuma categoria selecionada, fechando o ticket...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "close-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirm-close')
          .setLabel('FECHAR O TICKET')
          .setStyle('PRIMARY'),
          new client.discord.MessageButton()
          .setCustomId('no')
          .setLabel('CANCELAR')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Tem certeza que deseja fechar o ticket?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirm-close') {
          interaction.editReply({
            content: `Ticket Fechado por: <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `closed-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('#000000')
                .setAuthor('Ticket', 'https://media.discordapp.net/attachments/894859371643822090/914638076393963540/mail-animation-2.gif')
                .setDescription('```Controle de Tickets```')
                .setFooter('Sistema de Tickets', 'https://media.discordapp.net/attachments/894859371643822090/914638076393963540/mail-animation-2.gif')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('FECHAR O CANAL')
                  .setEmoji('🗑️')
                  .setStyle('PRIMARY'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'no') {
          interaction.editReply({
            content: 'fechamento cancelado!!',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'cancelado... !',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Salvando Mensagens...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('pt-BR')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nothing"
        hastebin.createPaste(a, {
            contentType: 'text/plain',
            server: 'https://hastebin.com'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://media.discordapp.net/attachments/894859371643822090/914638076393963540/mail-animation-2.gif')
              .setDescription(`📰 Logs du ticket \`${chan.id}\` Criado para <@!${chan.topic}> e fechado por: <@!${interaction.user.id}>\n\nLogs: [**Clique aqui para ver os logs**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', 'https://media.discordapp.net/attachments/894859371643822090/914638076393963540/mail-animation-2.gif')
              .setDescription(`📰 Logs de ticket \`${chan.id}\`: [**Clique aqui para ver os logs**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });
            client.users.cache.get(chan.topic).send({
              embeds: [embed2]
            }).catch(() => {console.log('Não consigo\'enviar dm para ele. :(')});
            chan.send('Fechando canal...');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
      });
    };
  },
};
