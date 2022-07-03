import { Client, Intents, Message, Permissions } from "discord.js";
import { token } from './auth.json';
import * as Curses from './curses.json';
import * as servers from './db/servers';
import * as users from './db/users';
//var curses = require('./curses.json');
//var curses = require('./curses.json');

/**adding the  message constants below */
const USERMILESTONES = {
    10: Curses['userMessages'].message2,
    25: Curses['userMessages'].message3,
    50: Curses['userMessages'].message4,
    75: Curses['userMessages'].message5,
    100: Curses['userMessages'].message6,
    150: Curses['userMessages'].message7,
    200: Curses['userMessages'].message8,
    300: Curses['userMessages'].message9,
    400: Curses['userMessages'].message10,
    450: Curses['userMessages'].message11,
    500: Curses['userMessages'].message12
  }
  
  const SERVERMILESTONES = {
    1: Curses['serverMessages'].message1,
    10: Curses['serverMessages'].message2,
    100: Curses['serverMessages'].message3,
    250: Curses['serverMessages'].message4,
    500: Curses['serverMessages'].message5,
    750: Curses['serverMessages'].message6,
    1000: Curses['serverMessages'].message7,
    1250: Curses['serverMessages'].message8,
    1500: Curses['serverMessages'].message9,
    1750: Curses['serverMessages'].message10,
    2000: Curses['serverMessages'].message11,
    2250: Curses['serverMessages'].message12,
    2350: Curses['serverMessages'].message13,
    2500: Curses['serverMessages'].message14
  }

const permissions = new Permissions(['MANAGE_CHANNELS', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES']);

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]});

client.once('ready', () => {
    console.log('Bot is ready');
});

client.on('messageCreate', handleMessage);

// Login to Discord with your client's token
client.login(token);

async function handleMessage(msg: Message) {
    
    if (msg.author.id === client.user?.id) {
        return;
    }
    //check if the message is starting with a '?' and is a command
    //console.log(msg);
    if (/^\?\w+/.test(msg.content)) {
        handleCommand(msg);
    } else {
        //eveyrthing in here will be checked for containing curse words
    }
    
}

async function handleCommand(msg: Message) {
    const capMessage = msg.content.toLocaleUpperCase();
    const args = capMessage.substring(1).split(' ');
    const cmd = args[0];

    switch(cmd) {
        case "HELP":
            msg.channel.send(Curses['helpMessage']);
            break;
        //Prints the count of swear words in either a server or a given list of users
        case "COUNT":
            //if we have more than one user mentioned then we check the count for that user
            if (msg.mentions.users.size > 0) {  
                msg.mentions.users.forEach(async user => {
                    const guildUser = msg.guild?.members.resolve(user.id);
                    //TODO: this may need to be tested for potential of crashing (displayName)
                    msg.channel.send(await getCurseCountForUser(msg.guildId, msg.author.id, guildUser!.displayName))
                });
            } else {
                //no users were mentioned so we get the count for the entire server
                msg.channel.send(await getCurseCountForServer(msg?.guildId, msg.guild?.name));
            }
            break;
        //Prints the individual uses of each specific swear word
        case "WORDCOUNT":
            console.log(args);
            if (args.length <= 1 || Curses['curses'] === null || Curses['curses'] === undefined || !Curses['curses'].includes("SHIT")) {
                msg.channel.send(Curses['SwearWordMissingMessage']);
                return;
            }
            if (msg.mentions.users.size > 0) {

            } else {
                //msg.channel.send(await getWordCountForServer(msg.guildId, msg.guild?.name, ));
            }
            break;
        default:
            msg.channel.send("Unkown Command, try using '?help'");
            break;
    }
}

async function getCurseCountForServer(guildId: string | null, guildName: string | undefined) {
    let responseString = `Total number of times ${guildName} has swore\n`;
    const swearCount: number = await servers.serverSwearCount(guildId!);
    return responseString += swearCount > 0 ? `${guildName} is pure and has not cursed` : swearCount;
}

async function getCurseCountForUser(guildId: string | null, userId: string, nickname: string) {
    let responseString = `Total number of times ${nickname} has swore:\n`;
    const swearCount: number = await users.totalUserSwearCount(guildId!, userId);
    return responseString += swearCount > 0 ? `${nickname} is pure and has not cursed yet` : swearCount;
}

async function getWordCountForServer(guildId: string, guildName: string, curseWord: string) {
    let responseString = `Swear word counts for ${guildName}:\n`;
    const swearCount: number = await servers.getServerSepecificSwearCount(guildId!, curseWord);
    return responseString += swearCount > 0 ? `${guildName} has not yet uttered '${curseWord}'` : swearCount;
}

async function getWordCountForUser(guildId: string, userId: string, nickname: string, curseWord: string) {
    let responseString = `Swear word counts for ${nickname}:\n`;
    const swearCount: number = await users.getUserSpecificSwearWordCount(guildId!, userId, curseWord);
    return responseString += swearCount > 0 ? `${nickname} has not yet uttered '${curseWord}'` : swearCount;
}