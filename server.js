const http = require('http');
const querystring = require('querystring');
const crypto = require('crypto');
const discord = require('discord.js');
const client = new discord.Client();

const mainChannelId = "725595164105768983";
const debugChannelId = "725962668829048864";
const password = "potatoisgodpotatoisgodpotatoisgod";

http.createServer(function(req, res){
  if (req.method == 'POST'){
    var data = "";
    req.on('data', function(chunk){
      data += chunk;
    });
    req.on('end', function(){
      if(!data){
        console.log("No post data");
        res.end();
        return;
      }
      var dataObject = querystring.parse(data);
      console.log("post:" + dataObject.type);
      if(dataObject.type == "wake"){
        console.log("Woke up in post");
        res.end();
        return;
      }
      if(dataObject.hash === undefined || dataObject.nonce === undefined){
        console.log("undefined hash");
        res.end();
        return;
      }else{
        let serverHash = crypto.createHash('sha256').update(password + Math.floor(dataObject.nonce)).digest('hex');
        if(String(dataObject.hash) != serverHash){
          console.log("invalid hash");
          res.end();
          return;
        }else{
          console.log("nonce:" + Math.floor(dataObject.nonce));
          console.log("hash ok");
        }
      }
      if(dataObject.type == "announce"){
        let msgChannelId = debugChannelId;
        if(dataObject.debug !== undefined && dataObject.debug == "false"){
          msgChannelId = mainChannelId;
        }
        let emb = {embed: JSON.parse(dataObject.content)};
        sendMsg(msgChannelId, "", emb);
      }
      if(dataObject.type == "newTakerunVideo"){
        let msgChannelId = debugChannelId;
        if(dataObject.debug !== undefined && dataObject.debug == "false"){
          msgChannelId = mainChannelId;
        }
        let msgMention = "<@270557414510690305>";
        let videoId = dataObject.url.replace("https://youtu.be/", "");
        let emb = {embed: {
          author: {
            name: "takerun3367",
            url: "https://www.youtube.com/channel/UCyM2Qcy6iD43d8BgiPj3ClQ",
            icon_url: "https://yt3.ggpht.com/a/AATXAJzj95tFkxDHHJ2FMMzMkO0AOI0Tk-Zb4Ld0mw=s100-c-k-c0xffffffff-no-rj-mo"
          },
          title: dataObject.title,
          url: dataObject.url,
          description: dataObject.description,
          color: 7506394,
          timestamp: new Date(),
          thumbnail: {
            url: "http://img.youtube.com/vi/" + videoId + "/mqdefault.jpg"
          }
        }};
        sendMsg(msgChannelId, msgMention + " の新着動画！", emb);
      }
      res.end();
    });
  }
  else if (req.method == 'GET'){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Discord Bot is active now\n');
  }
}).listen(3000);

client.on('ready', message =>{
  console.log('Bot準備完了～');
  client.user.setPresence({ game: { name: 'げーむ' } });
});

client.on('message', message =>{
  if (message.author.id == client.user.id || message.author.bot){
    return;
  }

  //ぴえんの例
  if (message.content.match(/🥺/)){
    let react = '🥺';
    message.react(react)
      .then(message => console.log("リアクション: 🥺"))
      .catch(console.error);
  }

  if (message.content === "にゃ～ん"){
    let reply_text = "にゃ～ん";
    message.reply(reply_text)
      .then(message => console.log("Sent message: " + reply_text))
      .catch(console.error);
    return;
  }

  if (message.content.match(/^！おみくじ/) ||
      (message.isMemberMentioned(client.user) && message.content.match(/おみくじ/))){
    let arr = ["大吉", "吉", "凶", "ぽてと", "にゃ～ん", "しゅうまい君"];
    let weight = [5, 30, 10, 15, 20, 20];
    lotteryByWeight(message.channel.id, arr, weight);
  }else if (message.isMemberMentioned(client.user)){
    sendReply(message, "呼びましたか？");
  }
});

client.on('voiceStateUpdate', (oldGuildMember, newGuildMember) =>{
  if(oldGuildMember.voiceChannelID === undefined && newGuildMember.voiceChannelID !== undefined){
    if(client.channels.get(newGuildMember.voiceChannelID).members.size == 1){
      if (newGuildMember.voiceChannelID == "725595164105768984") {
        newGuildMember.voiceChannel.createInvite({"maxAge":"0"})
          .then(invite => sendMsg(
            mainChannelId, "<@" + newGuildMember.user.id +"> が通話を開始しました！\n" + invite.url
          ));
      }
    }
  }
});

if (process.env.DISCORD_BOT_TOKEN == undefined){
  console.log('DISCORD_BOT_TOKENが設定されていません。');
  process.exit(0);
}

client.login( process.env.DISCORD_BOT_TOKEN );

function lottery(channelId, arr){
  let random = Math.floor(Math.random() * arr.length);
  sendMsg(channelId, arr[random]);
}

function lotteryByWeight(channelId, arr, weight){
  let totalWeight = 0;
  for (var i = 0; i < weight.length; i++){
    totalWeight += weight[i];
  }
  let random = Math.floor( Math.random() * totalWeight);
  for (var i = 0; i < weight.length; i++){
    if (random < weight[i]){
      sendMsg(channelId, arr[i]);
      return;
    }else{
      random -= weight[i];
    }
  }
  console.log("lottery error");
}

function sendReply(message, text){
  message.reply(text)
    .then(console.log("リプライ送信: " + text))
    .catch(console.error);
}

function sendMsg(channelId, text, option={}){
  client.channels.get(channelId).send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}
