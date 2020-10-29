const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["inv"],
  description: "Invite Link",
  execute(message) {
    let commands = message.client.commands.array();

    let helpEmbed = new MessageEmbed()
      .setTitle("If you want to have ESASAI on your server, you came to the right place! (▰˘◡˘▰)")
      .setThumbnail("https://static-cdn.jtvnw.net/emoticons/v1/279825/3.0")
      .addField("Invite BOT", "[CLICK HERE TO INVITE](https://discord.com/api/oauth2/authorize?client_id=763035447198351360&permissions=8&scope=bot \"INVITE\")")
      .addField("DONATE", "[PAYPAL](https://tinyurl.com/y6f9hsch \"DONATE\")")
      .setFooter("ESASAI Version 2.0")
      .setColor("#F8AA2A");
    helpEmbed.setTimestamp();

    return message.channel.send(helpEmbed).catch(console.error);
  }
};