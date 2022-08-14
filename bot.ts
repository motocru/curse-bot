import { Client, Intents, Message } from "discord.js";
import { token } from './auth.json';
import * as Curses from './curses.json';
import * as servers from './db/servers';
import * as users from './db/users';

/**adding the  message constants below */
const USERMILESTONES: Record<number, string> = {
    10: Curses.userMessages.message2,
    25: Curses.userMessages.message3,
    50: Curses.userMessages.message4,
    75: Curses.userMessages.message5,
    100: Curses.userMessages.message6,
    150: Curses.userMessages.message7,
    200: Curses.userMessages.message8,
    300: Curses.userMessages.message9,
    400: Curses.userMessages.message10,
    450: Curses.userMessages.message11,
    500: Curses.userMessages.message12
  }
  
  const SERVERMILESTONES: Record<number, string> = {
    1: Curses.serverMessages.message1,
    10: Curses.serverMessages.message2,
    100: Curses.serverMessages.message3,
    250: Curses.serverMessages.message4,
    500: Curses.serverMessages.message5,
    750: Curses.serverMessages.message6,
    1000: Curses.serverMessages.message7,
    1250: Curses.serverMessages.message8,
    1500: Curses.serverMessages.message9,
    1750: Curses.serverMessages.message10,
    2000: Curses.serverMessages.message11,
    2250: Curses.serverMessages.message12,
    2350: Curses.serverMessages.message13,
    2500: Curses.serverMessages.message14
  }

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]});
let serverRecords: Record<string, Record<string, boolean>> = {};
let baseCurseRecord: Record<string, boolean> = {};

client.once('ready', () => {
    console.log('Bot is ready');
    Curses.curses.forEach(curse => {
        baseCurseRecord[curse] = true;
    });
    client.guilds.fetch().then(guilds => {
        guilds.forEach(async guild => {
            //collect each custom swear list for the server and build the overall records
            let serverSwears = await servers.getServerCustomSwearList(guild.id);
            let serverRecord: Record<string, boolean> = {};
            serverSwears.forEach(swear => {
                serverRecord[swear] = true;
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
    //check if the message is starting with a '?' making it a command
    if (/^\?\w+/.test(msg.content)) {
        handleCommand(msg);
    } else {
        //eveyrthing in here will be checked for containing curse words and messages to the bot
        if (msg.mentions.has(client.user!.id)) handleBotPing(msg);
        await parseMessage(msg);
    }
    
}

async function handleCommand(msg: Message) {
    const capMessage = msg.content.toLocaleUpperCase();
    let args = capMessage.substring(1).split(' ');
    const cmd = args[0];

    switch(cmd) {
        case "HELP":
            msg.channel.send(Curses.helpMessage);
            break;
        //Prints the count of swear words in either a server or a given list of users
        case "COUNT":
            //if we have more than one user mentioned then we check the count for that user
            if (msg.mentions.users.size > 0) {  
                msg.mentions.users.forEach(async user => {
                    const guildUser = msg.guild?.members.resolve(user.id);
                    msg.channel.send(await getCurseCountForUser(msg.guildId, user.id, guildUser!.displayName))
                });
            } else {
                //no users were mentioned so we get the count for the entire server
                msg.channel.send(await getCurseCountForServer(msg?.guildId, msg.guild?.name));
            }
            break;
        //Adds a new curse word to the database
        case "ADD":
            if (args.length <= 1 || Curses.curses === null || Curses.curses === undefined) {
                msg.channel.send(Curses.SwearWordMissingMessage);
                return;
            }
            args.splice(0, 1);
            //check there's arguments and return message if not
            if (args.length < 0) {
                msg.channel.send(Curses.SwearWordMissingMessage);
            }
            //get all words in between quotes
            args = args.filter(x => !x.match(/<@[0-9]+>/gi));
            args = args.map(x => x.replace(/[.,\/#!$'%?\^&\*;:{}=\-_`~()\[\]]/g,' '));
            let quoteArgs = args.join(" ").match(/"([A-z]+|\s+)*[A-z]([A-z]+|\s+)*"/gi);

            if (quoteArgs == null || quoteArgs?.length < 1) {
                msg.channel.send('To add swear words to your server you must wrap the word or phrase you want to be added in quotation marks (")\n Ex. "shartballz" '); //TODO: add this message to the curses file
            }
            const words = quoteArgs?.map(x => x.substring(1, x.length-1).trim()); //removing the quotes and unneeded whitespace
            //remove any words that already exist in the server
            const finalwords = filterNewCursesToAdd(words ?? [], msg.guildId!);
            await servers.addToServerCustomSwearList(msg.guildId!, finalwords);
            msg.channel.send(`${finalwords?.length} new curse words added to ${msg.guild?.name}`);
            break;
        //Prints the individual uses of each specific swear word
        case "WORDCOUNT":
            if (args.length <= 1 || Curses.curses === null || Curses.curses === undefined) {
                msg.channel.send(Curses.SwearWordMissingMessage);
                return;
            }
            //splice the first element since it's the command
            args.splice(0, 1);
            //splice out any references to users
            args = args.filter(x => !x.match(/<@[0-9]+>/gi));
            if (args.length == 0) {
                msg.channel.send(Curses.SwearWordMissingMessage);
            }
            //console.log(args);
            if (msg.mentions.users.size > 0) {
                args.forEach(curse => {
                    //determine if the curse word exists in base or server list
                    if (CheckIfCurseWordValid(curse, msg?.guildId!)) {
                        msg.mentions.users.forEach(async user => {
                            const guildUser = msg.guild?.members.resolve(user.id);
                            msg.channel.send(await getWordCountForUser(msg?.guildId!, user.id, guildUser!.displayName, curse));
                        });
                    }
                });
                
            } else {
                args.forEach(async curse => {
                    //determine if the curse word exists in base or server list
                    if (CheckIfCurseWordValid(curse, msg?.guildId!)) {
                        msg.channel.send(await getWordCountForServer(msg?.guildId!, msg.guild?.name!, curse));
                    }
                });
            }

            function CheckIfCurseWordValid(curse: string, guildId: string): boolean {
                //this may need to be tested as to what it looks like
                if (!baseCurseRecord[curse]) {
                    var serverRecord = serverRecords[guildId];
                    if (!serverRecord[curse]) {
                        msg.channel.send(`${curse} is not a valid curse word`);
                        return false;
                    } else {
                        return true;
                    }
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
                    msg.channel.send(await getTotalSwearCountForUser(msg?.guildId!, user.id, guildUser!.displayName));
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
            if (args.length < 1 || Curses.curses === null || Curses.curses === undefined) {
                msg.channel.send(Curses.SwearWordMissingMessage);
                return;
            }
            //splice the first element since it's the command
            args.splice(0, 1);
            //splice out any references to users
            args = args.filter(x => !x.match(/<@[0-9]+>/gi));
            //Rank based on the given words
            if (args.length > 0) {
                args.forEach(async curse => {
                    msg.channel.send(await getRankForCurseWord(msg?.guildId!, msg.guild?.name!, curse));
                });
            } else {
                //rank based on overall number of curse words
                msg.channel.send(await getRankForServer(msg?.guildId!, msg.guild?.name!));
            }
            break;
        default:
            msg.channel.send("Unkown Command, try using '?help'");
            break;
    }
}

function handleBotPing(msg: Message) {
    msg.channel.send(Curses.botResponses[Math.floor(Math.random() * Math.floor(Curses.botResponses.length))]);
}

async function parseMessage(msg: Message) {
    let message = msg.content.toLocaleUpperCase();
    let parsedCurses: string[] = [];
    message = message.replace(/[.,\/#!$'"%?\^&\*;:{}=\-_`~()\[\]]/g,' ');
    message = message.replace(/<@[0-9]+>/gi, '');
    const baseWords = message.match(new RegExp(`\\b(${Curses.curses.join("|")})\\b`, "gi"));
    const serverCurseList = await servers.getServerCustomSwearList(msg.guildId!);
    const serverWords = message.match(new RegExp(`\\b(${serverCurseList.join("|")})\\b`, "gi"));
    //TODO: is there a better way to combine these so we don't create empty strings in this list?
    if (baseWords !== null) {
        parsedCurses = [...parsedCurses, ...baseWords];
    }
    if (serverWords !== null) {
        parsedCurses = [...parsedCurses, ...serverWords];
    }
    parsedCurses = parsedCurses.filter(x => x !== '');
    if (parsedCurses.length > 0) await incrementSwearsAndSendMessage(parsedCurses, msg);
}

async function incrementSwearsAndSendMessage(curses: string[], msg: Message) {
    const priorUserSwearRecord = await users.getUserSwearRecord(msg.guildId!, msg.author.id);
    const priorServerSwearRecord = await servers.getServerSwearTotal(msg.guildId!);
    if (Object.keys(priorServerSwearRecord).length === 0) {
        //save the user as the first person to swear on the server
        await servers.setServerSealBreaker(msg.guildId!, msg.author.id);
    }
    if (Object.keys(priorUserSwearRecord).length === 0) {
        //send a message for a user cursing for the first time
        msg.channel.send(`<@${msg.author.id}> ${Curses.userMessages.message1}`);
    }
    const newUserSwearRecord = await users.addUserSwear(msg.guildId!, msg.author.id, curses);
    const newServerSwearRecord = await servers.getServerSwearTotal(msg.guildId!);
    curses = curses.filter(function(elem, index, self) {
        return index === self.indexOf(elem);
    });
    const userMessage = await userMessageEvaluator(curses, msg.author.id, priorUserSwearRecord, newUserSwearRecord);
    const serverMessage = await serverMessageEvaluator(curses, msg.guild?.name!, priorServerSwearRecord, newServerSwearRecord);
    if ((userMessage+serverMessage).length > 0) {
        msg.channel.send(userMessage+serverMessage);
    }
}

async function userMessageEvaluator(curses: string[], userId: string, priorRecord: Record<string, number>, currentRecord: Record<string, number>) {
    let responseString = ``;
    const addressorText = `<@${userId}>`;
    for (let i = 0; i < curses.length; i++) {
        const priorCount = priorRecord[curses[i]] ?? 0;
        const currentCount = currentRecord[curses[i]];
        for (const k in USERMILESTONES) {
            const mile = +k;
            if (priorCount < mile && currentCount >= mile) {
                responseString += `${addressorText} has used ${curses[i].toLowerCase()} over ${mile} times, ${USERMILESTONES[k]}\n`;
            }
        }
    }
    return responseString;
}

async function serverMessageEvaluator(curses: string[], serverName: string, priorRecord: Record<string, number>, currentRecord: Record<string, number>) {
    let responseString = ``;
    const addressorText = `${serverName}`;
    for (let i = 0; i < curses.length; i++) {
        const priorCount = priorRecord[curses[i]] ?? 0;
        const currentCount = currentRecord[curses[i]];
        for (const k in SERVERMILESTONES) {
            const mile = +k;
            if (priorCount < mile && currentCount >= mile) {
                if (mile === 1) {
                    responseString += `${addressorText} has used ${curses[i].toLowerCase()} for the first time, ${SERVERMILESTONES[k]}\n`;
                } else {
                    responseString += `${addressorText} has used ${curses[i].toLowerCase()} over ${mile} times, ${SERVERMILESTONES[k]}\n`;
                }
                
            }
        }
    }
    return responseString;
}

async function getCurseCountForServer(guildId: string | null, guildName: string | undefined) {
    let responseString = `Total number of times ${guildName} has swore\n`;
    const swearCount: number = await servers.serverSwearCount(guildId!);
    return responseString += swearCount > 0 ? swearCount : `${guildName} is pure and has not cursed`;
}

async function getCurseCountForUser(guildId: string | null, userId: string, nickname: string) {
    let responseString = `Total number of times ${nickname} has swore:\n`;
    const swearCount: number = await users.totalUserSwearCount(guildId!, userId);
    return responseString += swearCount > 0 ?  swearCount : `${nickname} is pure and has not cursed yet`;
}

async function getWordCountForServer(guildId: string, guildName: string, curseWord: string) {
    let responseString = `Swear word counts for ${guildName}:\n`;
    const swearCount: number = await servers.getServerSepecificSwearCount(guildId!, curseWord);
    return responseString += swearCount > 0 ?  swearCount : `${guildName} has not yet uttered '${curseWord}'`;
}

async function getWordCountForUser(guildId: string, userId: string, nickname: string, curseWord: string) {
    let responseString = `number of times ${curseWord} used by ${nickname}:\n`;
    const swearCount: number = await users.getUserSpecificSwearWordCount(guildId!, userId, curseWord);
    return responseString += swearCount > 0 ?  swearCount : `${nickname} has not yet uttered '${curseWord}'`;
}

async function getTotalSwearCountForServer(guildId: string, guildName: string): Promise<string> {
    let responseString = `Swear totals for ${guildName}:\n`;
    const serverSwearTotals: Record<string, number> = await servers.getServerSwearTotal(guildId);
    const sortedSwearArray: Array<{key: string, count: number}> = sortRecord(serverSwearTotals);
    sortedSwearArray.forEach(x => {
        responseString += `${x.key}: ${x.count}\n`;
    });
    return responseString;
}

async function getTotalSwearCountForUser(guildId: string, userId: string, nickname: string) {
    let responseString = `Swear totals for ${nickname}:\n`;
    const userSwearTotals: Record<string, number> = await users.getUserSwearRecord(guildId, userId);
    const sortedSwearArray: Array<{key: string, count: number}> = sortRecord(userSwearTotals);
    sortedSwearArray.forEach(x => {
        responseString += `${x.key}: ${x.count}\n`;
    });
    return responseString;
}

async function getRankForServer(guildId: string, guildName: string): Promise<string> {
    let responseString = `Rankings for ${guildName}:\n`;
    const serverRankings: Record<string, number> = await servers.getServerSwearUseRankings(guildId);
    const sortedRankings: Array<{key: string, count: number}> = sortRecord(serverRankings);
    if (sortedRankings.length > 0) {
        sortedRankings.forEach(x => {
            responseString += `<@${x.key}>: ${x.count} swears\n`;
        });
    } else {
        responseString += `No one in ${guildName} has cursed yet`;
    }
    return responseString;
}

async function getRankForCurseWord(guildId: string, guildName: string, curse: string): Promise<string> {
    let responseString = `Rankings for ${curse} on ${guildName}:\n`;
    const serverRankings: Record<string, number> = await servers.getServerSpecificSwearRankings(guildId, curse);
    const sortedRankings: Array<{key: string, count: number}> = sortRecord(serverRankings);
    if (sortedRankings.length > 0) {
        sortedRankings.forEach(x => {
            responseString += `<@${x.key}>: ${x.count} swears\n`;
        });
    } else {
        responseString += `No one in ${guildName} has used ${curse} yet`;
    }
    return responseString;
}

function sortRecord(swearRecord: Record<string, number>): Array<{key: string, count: number}> {
    let sorted: Array<{key: string, count: number}> = [];
    for (var curse in swearRecord) {
        sorted.push({ key: curse, count: swearRecord[curse]});
    }
    sorted.sort(function(a, b) {
        return b.count - a.count;
    });
    return sorted;
}

function filterNewCursesToAdd(newCurses: string[], guildId: string): string[] {
    const filteredCurses = [];
    for (let i = 0; i < newCurses.length; i++) {
        if (!baseCurseRecord[newCurses[i]] && !serverRecords[guildId][newCurses[i]]) {
            serverRecords[guildId][newCurses[i]] = true;
            filteredCurses.push(newCurses[i]);
        }
    }
    return filteredCurses;
}