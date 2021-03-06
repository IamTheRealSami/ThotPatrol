/**
 * @file directMessageHandler
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

/**
 * Handles direct messages sent to ThotPatrol
 * @param {Message} message Discord.js message object
 * @returns {void}
 */
module.exports = async message => {
  try {
    if (!message.content) return;

    if (message.content.toLowerCase().startsWith('prefix')) {
      return message.channel.send({
        embed: {
          color: message.client.colors.BLUE,
          title: 'Default Prefixes',
          description: `\`${message.client.configurations.prefix.join('` `')}\``
        }
      }).catch(e => {
        message.client.log.error(e);
      });
    }

    if (message.content.toLowerCase().startsWith('help')) {
      return message.channel.send({
        embed: {
          color: message.client.colors.BLUE,
          title: 'The ThotPatrol Bot',
          url: '',
          description: '',
          fields: [
            {
              name: 'ThotPatrol HQ Invite Link',
              value: ''
            },
            {
              name: 'ThotPatrol Bot Invite Link',
              value: ``
            }
          ],
          thumbnail: {
            url: message.client.user.displayAvatarURL
          },
          footer: {
            text: '</> with ❤ by Looney'
          }
        }
      }).catch(e => {
        message.client.log.error(e);
      });
    }


    // Instant responses
    let instantResponse = await message.client.methods.makeBWAPIRequest('/chat/instant', {
      qs: {
        message: message.content
      }
    });

    if (instantResponse.status === 'success') {
      if (instantResponse.message.permissions.everyone || message.client.credentials.ownerId.includes(message.author.id)) {
        message.channel.startTyping();

        if (instantResponse.message.response instanceof Array) {
          for (let response of instantResponse.message.response) {
            let reply = await message.channel.send(response).catch(() => {});
            if (!reply) break;
          }
        }
        else {
          await message.channel.send(instantResponse.message.response).catch(() => {});
        }

        return message.channel.stopTyping(true);
      }
    }


    let settingsModel = await message.client.database.models.settings.findOne({
      attributes: [ 'relayDirectMessages' ],
      where: {
        botID: message.client.user.id
      }
    });

    if (settingsModel && settingsModel.dataValues.relayDirectMessages) {
      // Find the application owner
      let app = await message.client.fetchApplication();
      let owner = await message.client.fetchUser(app.owner.id);

      // Relay the message
      await owner.send({
        embed: {
          author: {
            name: message.author.tag
          },
          description: message.content
        }
      });
    }
  }
  catch (e) {
    message.client.log.error(e);
  }
};
