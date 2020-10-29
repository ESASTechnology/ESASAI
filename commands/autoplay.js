//BUILD 14
const { MessageEmbed } = require("discord.js");
const { play } = require("../include/play");
const YouTubeAPI = require("simple-youtube-api");
const scdl = require("soundcloud-downloader");

let ap_enable =false;

let YOUTUBE_API_KEY, SOUNDCLOUD_CLIENT_ID, MAX_PLAYLIST_SIZE;
try {
  const config = require("../config.json");
  YOUTUBE_API_KEY = config.YOUTUBE_API_KEY;
  SOUNDCLOUD_CLIENT_ID = config.SOUNDCLOUD_CLIENT_ID;
  MAX_PLAYLIST_SIZE = config.MAX_PLAYLIST_SIZE;
} catch (error) {
  YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
  MAX_PLAYLIST_SIZE = process.env.MAX_PLAYLIST_SIZE;
}
//API Youtube
const youtube = new YouTubeAPI(YOUTUBE_API_KEY);
//Other API for switch if reach limit
//Khmer
const youtubeapi2 = new YouTubeAPI('YOTUBEAPI2');
//Khmer
const youtubeapi3 = new YouTubeAPI('YOTUBEAPI3');

module.exports = {
  name: "autoplay",
  cooldown: 3,
  aliases: ["ap"],
  description: "Auto Play Next Music!",
  async execute(message, args) {

    const { PRUNING } = require("../config.json");
    const { channel } = message.member.voice;

    const serverQueue = message.client.queue.get(message.guild.id);
    
    if (serverQueue && channel !== message.guild.me.voice.channel)
      return message.reply(`You must be in the same channel as ${message.client.user}`).catch(console.error);
    console.log(args);

    //args[0]='chill';
    //Auto Play Function
    //Get Current Playing Song
    const qs = message.client.queue.get(message.guild.id);
    try{
      //const qs = message.client.queue.get(message.guild.id);
      let cp = qs.songs[0];

      args[0]= cp.title;
      console.log('cp ' + cp);
    }catch(error){
      console.log(error);
    return message
        .reply(`Error: You are not palying any Music! Please Play a song and then you can enable auto play!`)
        .catch(console.error);
    }

    //if (!args.length)
    //  return message
    //    .reply(`Usage: ${message.client.prefix}playlist <YouTube Playlist URL | Playlist Name>`)
    //    .catch(console.error);
    if (!channel) return message.reply("You need to join a voice channel first!").catch(console.error);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.reply("Cannot connect to voice channel, missing permissions");
    if (!permissions.has("SPEAK"))
      return message.reply("I cannot speak in this voice channel, make sure I have the proper permissions!");

    //const search = args.join(" ");
    const search = args.join(" ");
    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = pattern.test(args[0]);
    console.log('urlv ' + urlValid);
    console.log('url ' + url);
    console.log('search ' + search);

    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: 100,
      playing: true
    };

    let song = null;
    let playlist = null;
    let videos = [];

    if (urlValid) {
      try {
        console.log('API 1 Starting');
        playlist = await youtube.getPlaylist(url, { part: "snippet" });
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
      } catch (error) {
        try{
          console.log('API 1 Fail, Starting API 2!');
          playlist = await youtubeapi2.getPlaylist(url, { part: "snippet" });
          videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
        }catch{
          try{
            console.log('API 2 Fail, Starting API 3!');
            playlist = await youtubeapi3.getPlaylist(url, { part: "snippet" });
            videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
          }catch(error){
            console.error(error);
            return message.reply("Error, Can't Find Next Song!").catch(console.error);
          }
        }        
      }
    } else if (scdl.isValidUrl(args[0])) {
      if (args[0].includes("/sets/")) {
        message.channel.send("⌛ fetching the playlist...");
        playlist = await scdl.getSetInfo(args[0], SOUNDCLOUD_CLIENT_ID);
        videos = playlist.tracks.map((track) => ({
          title: track.title,
          url: track.permalink_url,
          duration: track.duration / 1000
        }));
      }
    } else {
      try {
        //Search Song Default 
        try{
          console.log('try 2 API 1');
          const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
          console.log('result ' + search);
          //Set Playlist
          playlist = results[0];
          videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
        }catch{
          try{
            console.log('API 1 Fail!');
            console.log('try 2 API 2');
            const results = await youtubeapi2.searchPlaylists(search, 1, { part: "snippet" });
            console.log('result ' + search);
            //Set Playlist
            playlist = results[0];
            videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
          }catch{
            console.log('API 2 Fail!');
            console.log('try 2 API 3');
            const results = await youtubeapi3.searchPlaylists(search, 1, { part: "snippet" });
            console.log('result ' + search);
            //Set Playlist
            playlist = results[0];
            videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10, { part: "snippet" });
          }
        }        
      } catch (error) {
        console.error(error);
          return message.reply("Can't Find Next Play List").catch(console.error);    
      }
    }

    videos.forEach((video) => {
      song = {
        title: video.title,
        url: video.url,
        duration: video.durationSeconds
      };

      if (serverQueue) {
        serverQueue.songs.push(song);
        //if (!PRUNING)
        //  message.channel
        //    .send(`✅ **${song.title}** has been added to the queue by ${message.author}`)
        //    .catch(console.error);
      } else {
        queueConstruct.songs.push(song);
      }
    });

    let playlistEmbed = new MessageEmbed()
      .setTitle(`${playlist.title}`)
      .setURL(playlist.url)
      .setColor("#F8AA2A")
      .setTimestamp();

    if (!PRUNING) {
      playlistEmbed.setDescription(queueConstruct.songs.map((song, index) => `${index + 1}. ${song.title}`));
      if (playlistEmbed.description.length >= 2048)
        playlistEmbed.description =
          playlistEmbed.description.substr(0, 2007) + "\nPlaylist larger than character limit...";
    }

    //message.channel.send(`${message.author} Started a playlist`, playlistEmbed);
    qs.songs.splice('2' - 1, 1);
    console.log('Removed Song');
    message.channel.send(`${message.author} Auto Play: Enabled`);

    if (!serverQueue) message.client.queue.set(message.guild.id, queueConstruct);

    if (!serverQueue) {
      try {
        queueConstruct.connection = await channel.join();
        await queueConstruct.connection.voice.setSelfDeaf(true);
        play(queueConstruct.songs[0], message);
      } catch (error) {
        console.error(error);
        message.client.queue.delete(message.guild.id);
        await channel.leave();
        return message.channel.send(`Could not join the channel: ${error}`).catch(console.error);
      }
    }
  }
};
