/**
 * @file weather command
 * @author Sankarsan Kampa (a.k.a k3rn31p4nic)
 * @license GPL-3.0
 */

const weather = xrequire('weather-js');

exports.exec = async (ThotPatrol, message, args) => {
  if (!args.length) {
    return ThotPatrol.emit('commandUsage', message, this.help);
  }

  await weather.find({ search: args.join(' '), degreeType: 'C' }, async (err, result) => {
    if (err) {
      return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'weatherNotFound'), message.channel);
    }

    if (!result || !result.length) {
      return ThotPatrol.emit('error', '', ThotPatrol.i18n.error(message.guild.language, 'connection'), message.channel);
    }

    result = result[0];

    await message.channel.send({
      embed: {
        color: ThotPatrol.colors.BLUE,
        title: 'Current Weather',
        fields: [
          {
            name: 'Location',
            value: result.location.name,
            inline: true
          },
          {
            name: 'Coordinates',
            value: `${result.location.lat}, ${result.location.long}`,
            inline: true
          },
          {
            name: 'Time Zone',
            value: `UTC${result.location.timezone >= 0 ? `+${result.location.timezone}` : result.location.timezone}`,
            inline: true
          },
          {
            name: 'Condition',
            value: result.current.skytext,
            inline: true
          },
          {
            name: 'Temperature',
            value: `${result.current.temperature} \u00B0${result.location.degreetype}`,
            inline: true
          },
          {
            name: 'Feels Like',
            value: `${result.current.feelslike} \u00B0${result.location.degreetype}`,
            inline: true
          },
          {
            name: 'Low',
            value: `${result.forecast[1].low} \u00B0${result.location.degreetype}`,
            inline: true
          },
          {
            name: 'High',
            value: `${result.forecast[1].high} \u00B0${result.location.degreetype}`,
            inline: true
          },
          {
            name: 'Windspeed',
            value: result.current.winddisplay,
            inline: true
          },
          {
            name: 'Humidity',
            value: `${result.current.humidity}%`,
            inline: true
          },
          {
            name: 'Precipitation',
            value: `${result.forecast[1].precip} cm`,
            inline: true
          },
          {
            name: 'Observation Time',
            value: result.current.observationtime,
            inline: true
          }
        ],
        thumbnail: {
          url: `https://resources.ThotPatrolbot.org/images/weather/${result.current.skycode}.png`
        },
        footer: {
          text: 'Powered by MSN Weather'
        }
      }
    });
  });
};

exports.config = {
  aliases: [ 'we' ],
  enabled: true
};

exports.help = {
  name: 'weather',
  description: 'Shows weather information of the specified location.',
  botPermission: '',
  userTextPermission: '',
  userVoicePermission: '',
  usage: 'weather <city [, country_code]|zipcode>',
  example: [ 'weather London, UK', 'weather 94109' ]
};
