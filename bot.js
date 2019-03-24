var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var curses = require('./curses.json');
var users = require('./db/users');
var servers = require('./db/servers');

/**adding the  message constants below */
const USERMILESTONES = {
  10: curses.userMessages.message2,
  25: curses.userMessages.message3,
  50: curses.userMessages.message4,
  75: curses.userMessages.message5,
  100: curses.userMessages.message6,
  150: curses.userMessages.message7,
  200: curses.userMessages.message8,
  300: curses.userMessages.message9,
  400: curses.userMessages.message10,
  450: curses.userMessages.message11,
  500: curses.userMessages.message12
}

const SERVERMILESTONES = {
  1: curses.serverMessages.message1,
  10: curses.serverMessages.message2,
  100: curses.serverMessages.message3,
  250: curses.serverMessages.message4,
  500: curses.serverMessages.message5,
  750: curses.serverMessages.message6,
  1000: curses.serverMessages.message7,
  1250: curses.serverMessages.message8,
  1500: curses.serverMessages.message9,
  1750: curses.serverMessages.message10,
  2000: curses.serverMessages.message11,
  2250: curses.serverMessages.message12,
  2350: curses.serverMessages.message13,
  2500: curses.serverMessages.message14
}

/**sorts the entire list of curses on server startup with longest first
 * and shortest last. this stops .match function from pushing up
 * shorter versions of words first
 */
curses.curses.sort(function(a,b) {
  return b.length - a.length ||
    a.localeCompare(b);
});

//configure the logger settings below
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

//initialize the discord bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

bot.on('ready', function(evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(`${bot.username}-(${bot.id})`);
});

/**function called every time a message is sent on servers that have curse-bot */
bot.on('message', function(user, userID, channelID, message, evt) {
  /**the initial if statement will separate normal comments from the CLI arguments
   * based on if the first given character is the '?' character
   */
  if (userID === bot.id) return;
  if (message.substring(0,1) == '?') {
    botCommands(message, evt, channelID, function(response) {
      bot.sendMessage({
        to: channelID,
        message: response
      });
    });
  } else {
    parseMessage(userID, channelID, message, evt.d.guild_id);
  }
});

/**botCommands serves as a way to separtate code that evaluate messages that are 
 * treated as commands for curse-bot from code that parses normal messages
 * for curse words
 */
function botCommands(message, evt, channelID, cb) {
  var args = message.substring(1).split(' ');
  var cmd = args[0].toUpperCase();

  switch(cmd) {
    case "HELP":
      cb(curses.helpMessage);
      break;
    case "COUNT":
      if (evt.d.mentions[0] === undefined) {
        countResponseMessage(null, null, evt.d.guild_id, cb);
      } else {
        for (var i in evt.d.mentions) {
          countResponseMessage(evt.d.mentions[i].id, (evt.d.mentions[i].member.nick !== undefined) ? evt.d.mentions[i].member.nick : evt.d.mentions[i].username, evt.d.guild_id, cb);
        }
      }
      break;  
    case "TOTAL":
      if (evt.d.mentions[0] === undefined) {
        serverAndUserSwearList(null, null, evt.d.guild_id, cb);
      } else {
        for (var i in evt.d.mentions) {
          serverAndUserSwearList(evt.d.mentions[i].id, (evt.d.mentions[i].member.nick !== undefined) ? evt.d.mentions[i].member.nick : evt.d.mentions[i].username, evt.d.guild_id, cb);
        }
      }
      break;
    case "FIRST":
      servers.returnSealBreaker(evt.d.guild_id, function(err, user) {
        if (user === null) {
          cb('No on this server has cursed yet');
        } else {
          cb(`<@!${user.id}> ${curses.sealBreakerMessage}`)
        }
      });
      break;  
    case "TEST":
      //console.log(evt);
      //console.log(channelID);
      bot.sendMessage({
        to: channelID,
        message: `<@!${evt.d.guild_id}>`
      });
      break;
    default :
      cb("Unkown Command, try using '?help'");
      break;
  }
}

/**this function is needed as the 'else' in the initial if-else statement 
 * for better code readability on the initial message. if message has any
 * curse-words involved it sends our array of curse words to the next function, 
 * otherwise it returns
 */
function parseMessage(userID, channelID, message, guild) {
  message = message.toUpperCase();
  message = message.replace(/[.,\/#!$'"%?\^&\*;:{}=\-_`~()\[\]]/g,' ');
  words = message.match(new RegExp(`\\b(${curses.curses.join("|")})\\b`,"gi"));
  if (words !== null) {
    incrementSwearsAndSendMessage(words, userID, channelID, guild);
  } else {
    return;
  }
}

/**function needed as the previous solution was to have a large if statement
 * with no else involved. now if a message has curse words it is sent here
 */
function incrementSwearsAndSendMessage(words, userID, channelID, guild) {
  /**new version */
  servers.saveServer(guild, userID, {}, function(err, user) {
    if (err) {console.log(err);}
    var addedObject = {};
    if (JSON.stringify(user.jarObject) === '{}') {
      bot.sendMessage({
        to: channelID,
        message: `<@!${userID}> ${curses.userMessages.message1}`
      });
    }
    for (var i in words) {
      if (user.jarObject[words[i]]) {
        user.jarObject[words[i]]++;
        if (addedObject[words[i]]) {
          addedObject[words[i]]++;
        } else {
          addedObject[words[i]] = 1;
        }
      } else {
        user.jarObject[words[i]] = 1;
        addedObject[words[i]] = 1;
      }
    }

    servers.updateUserSwears(guild, userID, user.jarObject, function(err2, updatedUser) {
      messageEvaluator(updatedUser, addedObject, function(printMessage1) {
        servers.totalServerSwears(guild, function(err2, total) {
          serverEvaluator(total, addedObject, function(printMessage2) {
            bot.sendMessage({
              to: channelID,
              message: printMessage1+printMessage2
            });
          });
        });
      });
    });
  });
}

/**this function is called when the bot is given the '?total' command. The function is
 * used to build up user and server totals on a per-swear basis
 */
function serverAndUserSwearList(user, nickname, guild, cb) {
  var returnString = (user === null) ? `Server total swear count\n` : `${nickname} total swear count\n`;
  if (user === null) {
    servers.totalServerSwears(guild, function(err, curses) {
      if (curses === null) cb(returnString+'This server has not cursed yet');
      else {
        sortCurseList(curses, function(sorted) {
          curseTotalStringBuilder(sorted, returnString, function(completed) {
            cb(completed);
          });
        });
      }
    });
  } else {
    users.getUserServerSwearList(guild, user, function(err, curseObject) {
      if (err) {console.log(err);}
      if (curseObject == null) {
        cb(returnString.concat(`${nickname} ${curses.curseFreeMessage}`));
      } else {
        sortCurseList(curseObject, function(sorted) {
          curseTotalStringBuilder(sorted, returnString, function(completed) {
            cb(completed);
          });
        });
      }
    });
  }
}

function sortCurseList(curses, cb) {
  var sorted = [];
  for (var curse in curses) {
    sorted.push([curse, curses[curse]]);
  }
  sorted.sort(function(a, b) {
    return b[1] - a[1];
  });
  cb(sorted);
}

/**builds a string by looping over every given item in a curse object for both a 
 * total server count and total user count to reduce redundant code rather than 
 * having the same thing twice for server and user
*/
function curseTotalStringBuilder(curseArray, responseString, cb) {
  for (var i in curseArray) {
    responseString = responseString.concat(`${curseArray[i][0].toLowerCase()}: ${curseArray[i][1]}\n`);
  }
  cb(responseString);
}

/**returns the total number of times the server or a single user has
 * used any curse words
 */
function countResponseMessage(user, nickname, guild, cb) {
  var responseString = (user === null) ? `Total times this server has swore:\n` : `Total times ${nickname} has swore:\n`;
  if (user === null) {
    servers.serverSwearCount(guild, function(err, count) {
      if (count === 0) cb(responseString+'No one has cursed on this server yet');
      else cb(responseString+count);
    });
  } else {
    users.swearCountByServer(guild, user, function(err, count) {
      if (count === 0) cb(responseString+`${nickname} has not cursed on this server yet`);
      else cb(responseString+count);
    });
  }
}

/** This function is needed to build a result string to send in a callback
 * function to print for every milestone that was hit for single users
*/
function messageEvaluator(user, addedObject, cb) {
  var returnString = '';
  for (var i in addedObject) {
    messageDecider(user, i, user.jarObject[i]-addedObject[i], USERMILESTONES, function(result) {
      returnString = returnString.concat(result);
    });
  }
  cb(returnString);
}

/** This function is needed to build a result string to send in a callback 
 * function to print for every milestone hit for the entire server
*/
function serverEvaluator(total, addedObject, cb) {
  var returnString = '';
  for (var i in addedObject) {
    messageDecider(total, i, total[i]-addedObject[i], SERVERMILESTONES, function(result) {
      returnString = returnString.concat(result);
    });
  }
  cb(returnString);
}

/**this function loops over the given milstones variable and determines if the difference
 * crosses a threshold for a message then returns the message or nothing if there isn't one.
 */
function messageDecider(user, curse, difference, MILESTONES, cb) {
  if (user.id === undefined) {
    addressorText = 'This server';
    curseNum = user[curse];
  } else {
    addressorText = `<@!${user.id}>`;
    curseNum = user.jarObject[curse]
  }

  for (const mile in MILESTONES) {
    if (difference < mile && curseNum >= mile) {
      cb(`${addressorText} has used ${curse.toLowerCase()} over ${mile} times, ${MILESTONES[mile]}\n`);
    }
  }
  cb('');
}