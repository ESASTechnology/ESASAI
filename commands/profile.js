const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "profile",
  aliases: ["pro"],
  description: "Larger Profile",
  execute(message) {
    let taggedUser = message.mentions.users.first()
    if(taggedUser){
      let helpEmbed = new MessageEmbed()
        //.setAuthor(taggedUser.tag, taggedUser.displayAvatarURL(1024))
        .setTitle("Requested from " + message.author.tag)
        .setImage(taggedUser.displayAvatarURL({ dynamic: true, size: 2048}))
        .setFooter("ESASAI Version 2.0")
        .setColor("#F8AA2A");
      helpEmbed.setTimestamp();
      return message.channel.send(helpEmbed).catch(console.error);
    }
  }
};