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
let serverRecords: Record<string, Record<string, number>> = {};

client.once('ready', () => {
    console.log('Bot is ready');
    client.guilds.fetch().then(guilds => {
        guilds.forEach(async guild => {
            //collect each custom swear list for the server and build the overall records
            let serverSwears = await servers.getServerCustomSwearList(guild.id);
            let serverRecord: Record<string, number> = {};
            serverSwears.forEach(swear => {
                serverRecord[swear] = 0;
            });
            serverRecords[guild.id] = serverRecord;
        });
    })
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
    let args = capMessage.substring(1).split(' ');
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
        //Adds a new curse word to the database
        case "ADD":
            break;
        //Prints the individual uses of each specific swear word
        case "WORDCOUNT":
            if (args.length <= 1 || Curses['curses'] === null || Curses['curses'] === undefined) {
                msg.channel.send(Curses.SwearWordMissingMessage);
                return;
            }
            //splice the first element since it's the command
            args.splice(0, 1);
            //splice out any references to users
            args = args.filter(x => !x.match(/<@[0-9]+>/gi));
            console.log(args);
            if (msg.mentions.users.size > 0) {
                msg.mentions.users.forEach(user => {

                });
            } else {
                args.forEach(async curse => {
                    //determine if the curse word exists in our list
                    if (CheckIfCurseWordValid(curse)) {
                        msg.channel.send(await getWordCountForServer(msg?.guildId!, msg.guild?.name!, curse));
                    }
                });
            }

            function CheckIfCurseWordValid(curse: string): boolean {
                if (!Curses.curses.includes(curse))  {
                    msg.channel.send(`${curse} is not a valid curse word`);
                    return false;
                } else {
                    return true;
                }
            }
            break;
        case "TOTAL":
            if (msg.mentions.users.size > 0) {
                //Total swear count for the users mentioned
                msg.mentions.users.forEach(async user => {
                    const guildUser = msg.guild?.members.resolve(user.id);
                    msg.channel.send(await getTotalSwearCountForUser(msg?.guildId!, msg.author.id, guildUser!.displayName));
                });
            } else {
                //Total swear count for the entire server
                msg.channel.send(await getTotalSwearCountForServer(msg?.guildId!, msg.guild?.name!));
            }
            break;
        case "FIRST":
            const sealBreaker: string | null = await servers.getServerSealBreaker(msg?.guildId!);
            if (sealBreaker == null) {
                msg.channel.send('No one has cursed on this server yet');
            } else {
                msg.channel.send(`<@!${sealBreaker}> ${Curses.sealBreakerMessage}`);
            }
            break;
        case "RANK":

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

async function getTotalSwearCountForServer(guildId: string, guildName: string): Promise<string> {
    let responseString = `Swear totals for ${guildName}:\n`;
    const serverSwearTotals: Record<string, number> = await servers.getServerSwearTotal(guildId);
    const sortedSwearArray: Array<{curse: string, count: number}> = sortSwearRecord(serverSwearTotals);
    sortedSwearArray.forEach(x => {
        responseString += `${x.curse}: ${x.count}`;
    });
    return responseString;
}

async function getTotalSwearCountForUser(guildId: string, userId: string, nickname: string) {
    let responseString = `Swear totals for ${nickname}:\n`;
    const userSwearTotals: Record<string, number> = await users.getUserSwearRecord(guildId, userId);
    const sortedSwearArray: Array<{curse: string, count: number}> = sortSwearRecord(userSwearTotals);
    sortedSwearArray.forEach(x => {
        responseString += `${x.curse}: ${x.count}`;
    });
    return responseString;
}

async function getUserWhoFirstSwore(guildId: string) {
    let responseString = ``;
}

function sortSwearRecord(swearRecord: Record<string, number>): Array<{curse: string, count: number}> {
    let sorted: Array<{curse: string, count: number}> = [];
    for (var curse in swearRecord) {
        sorted.push({ curse, count: swearRecord[curse]});
    }
    sorted.sort(function(a, b) {
        return b.count - a.count;
    });
    return sorted;
}