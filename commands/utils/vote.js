const cmd = require('discord.js-commando');
const discord = require('discord.js');
const path = require('path');

module.exports = class Vote extends cmd.Command {
    constructor(client) {
        super(client, {
            name: 'vote',
            group: 'utils',
            memberName: 'vote',
            description: "選択肢が ✅ / ❌ / 🤔 の投票を作成します。",
            examples: ['!vote "ネコ派の人～～～！" "ネコ派の人は:white_check_mark: 、イヌ派の人は:x: 、それ以外の人は:thinking: を選んでね～" 0 #一般'],
            args: [
                {
                    key: 'question',
                    prompt: '投票のテーマを入力してください。',
                    type: 'string',
                    validate: question => {
                        if (question.length < 31 && question.length > 4) return true;
                        return 'テーマは5~30文字にしてください。';
                    }
                },
                {
                    key: 'detail',
                    prompt: '詳細を入力してください。',
                    type: 'string',
                    validate: desc => {
                        if (desc.length < 201 && desc.length > 0) return true;
                        return '詳細は1~200文字にしてください。';
                    }
                },
                {
                    key: 'time',
                    prompt: '投票を受け付ける時間を入力してください（分）。0を指定すると制限時間無しになります。',
                    type: 'integer',
                    validate: time => {
                        if (time >= 0 && time <= 60) return true;
                        return '時間は0~60分にしてください。';
                    } 
                },
                {
                    key: 'channel',
                    prompt: '投票をしたいチャンネルを入力してください。',
                    type: 'channel'
                }
            ]
        });
    }
    
    run(msg, {question, channel, time, detail}) {
        var emojis = ['✅','❌','🤔'];
        var emb = new discord.RichEmbed()
            .setTitle(question)
            .setDescription(detail)
            .setAuthor(msg.author.username, msg.author.displayAvatarURL)
            .setColor(0x7289DA)
            .setTimestamp();
            
        if (time) {
            emb.setFooter('この投票は、開始から' + time + '分後に締め切られます。');
        } else {
            emb.setFooter('この投票は無期限です。');
        }
            
        //msg.delete();
        channel.send("投票が開始されました！", emb)
            .then(async function (message) {
                var reaction = [];
                for(var i = 0; i < emojis.length; ++i){
                  reaction[i] = await message.react(emojis[i]);
                }
                
                if (time) {
                    setTimeout(() => {
                        message.channel.fetchMessage(message.id)
                            .then(async function (message) {
                                var reactionCounts = [];                               
                                for (var i = 0; i < reaction.length; i++) {
                                    reactionCounts[i] = message.reactions.get(emojis[i]).count-1;
                                }
                                
                                var max = -Infinity, indexMax = [];
                                for(var i = 0; i < reactionCounts.length; ++i){
                                    if(reactionCounts[i] > max){
                                      max = reactionCounts[i];
                                      indexMax = [i];
                                    }
                                    else if(reactionCounts[i] === max) indexMax.push(i);
                                }
                                var resultText = "";
                                if (reactionCounts[indexMax[0]] == 0) {
                                    resultText = "かれこれまぁ" + time + "分くらい、えー待ったんですけども投票者は誰一人来ませんでした。";
                                } else {
                                    for (var i = 0; i < reactionCounts.length; i++) {
                                        resultText += 
                                            emojis[i] + " ( " + reactionCounts[i] + " 票)";
                                        for (var j = 0; j < indexMax.length; j++) {
                                            if(indexMax[j] == i) resultText += ":trophy:";
                                        }
                                        resultText += "\n";
                                    }
                                }
                                emb.addField(":fire:投票結果:fire:", resultText);
                                emb.setFooter("この投票は締め切られました。");
                                emb.setTimestamp();
                                message.edit("", emb);
                            });
                    }, time * 60 * 1000);
                }
            }).catch(console.error);
    }
};
