const { MessageEmbed } = require("discord.js");

const { Client, Collection } = require("discord.js");

module.exports = {
  name: "botjoin",
  aliases: ["bj"],
  description: "List Server that ESASAI bot has joined!",
  execute(message) {
    let commands = message.client.commands.array();
    let client = new Client({ disableMentions: "everyone" });

    //`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`)

    let helpEmbed = new MessageEmbed()
      .setTitle("If you want to have ESASAI on your server, you came to the right place! (▰˘◡˘▰)")
      .setThumbnail("https://static-cdn.jtvnw.net/emoticons/v1/279825/3.0")
      .addField("Invite BOT", "[CLICK HERE TO INVITE](https://discord.com/api/oauth2/authorize?client_id=763035447198351360&permissions=8&scope=bot \"INVITE\")")
      .addField("Client", client.users.cache.size)
      .setFooter("ESASAI Version 2.0")
      .setColor("#F8AA2A");
    helpEmbed.setTimestamp();

    return message.channel.send(helpEmbed).catch(console.error);
  }
};