var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var curses = require('./curses.json');
var users = require('./db/users');
//var swearjar = {};
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

bot.on('message', function(user, userID, channelID, message, evt) {
  /**the initial if will separate normal comments from the CLI arguments
   * based on if the first given character is the '?' character
   */
  if (message.substring(0,1) == '?') {
    var args = message.substring(1).split(' ');
    var cmd = args[0].toUpperCase();
    //console.log(evt.d.mentions[0].member.nick);
    switch(cmd) {
      case 'HELP':
        bot.sendMessage({
          to: channelID,
          message: 'bot works'
        });
        break;
      case 'TOTAL':
        if (evt.d.mentions[0] == undefined) {
          swearTotaler(null, null, function(completed) {
            bot.sendMessage({
              to: channelID,
              message: completed
            });
          });
        } else {
          for (var i in evt.d.mentions) {
            swearTotaler(evt.d.mentions[i].id, (evt.d.mentions[i].member.nick != undefined) ? evt.d.mentions[i].member.nick : evt.d.mentions[i].username, function(completed) {
              bot.sendMessage({
                to: channelID,
                message: completed
              });
            });
          }
        }
        break;
      default: 
        bot.sendMessage({
          to:channelID,
          message: 'Unknown command'
        });
        break;
    }
  } else if (userID !== bot.id){
    /**this part of the bot actually adds the curse words so far I think I should be able to 
     * store the ones that are exact matches, but variations like those ending in -ed and -ing
     * may have to come later
     */
    //console.log('we hit this');

    users.save(userID, {}, function(err, returnedUser) {
      if (err) {console.log(err);}
      //var addedObject = Object.assign({}, returnedUser.jarObject);
      var addedObject = {};
      //console.log(JSON.stringify(addedObject));
      message = message.toUpperCase();
      var args = message.split(' ');
      for (var i in args) {
        if (curses.curses.includes(args[i]) || curses.curses.includes(args[i].replace(/(ING|ER*S*Y*|S)$/gm,''))) {
          if (returnedUser.jarObject[args[i]] && addedObject[args[i]]) {
            returnedUser.jarObject[args[i]]++;
            addedObject[args[i]]++;
          } else if (returnedUser.jarObject[args[i]]) {
            returnedUser.jarObject[args[i]]++;
            addedObject[args[i]] = 1;
          } 
          else {
            returnedUser.jarObject[args[i]] = 1;
            addedObject[args[i]] = 1;
          }
        }
      }
      //console.log(JSON.stringify(addedObject) == '{}');
      if (!JSON.stringify(addedObject) != '{}') {
        users.addSwear(userID, returnedUser.jarObject, function(err2, updatedUser) {
          messageEvaluator(updatedUser, addedObject, channelID);
          users.totalSwears(function(err, total) {
            serverEvaluator(total, addedObject, channelID);
          });
        });
      }
    });
  }
});

function swearTotaler(user, nickname, cb) {
  var returnString = (user == null) ? `Server total swear count\n` : `${nickname} total swear count\n`;
  if (user == null) {
    users.totalSwears(function(err, swearObject) {
      stringBuilder(swearObject, returnString, function(completed) {
        cb(completed);
      })
    });
  } else {
    users.userSwears(user, function(err, curseObject) {
      if (curseObject == null) {
        cb(returnString.concat(`${nickname} has not yet cursed on this server\nthey are pure of heart and free from sin`));
      } else {
        stringBuilder(curseObject, returnString, function(completed) {
          cb(completed);
        });
      }
    });
  }
}

function stringBuilder(curseObject, responseString, cb) {
  for (var i in curseObject) {
    responseString = responseString.concat(`${i.toLowerCase()}: ${curseObject[i]}\n`);
  }
  cb(responseString);
}

function messageEvaluator(user, addedObject, channelID) {
  //console.log(JSON.stringify(addedObject));
  //console.log(JSON.stringify(user.jarObject));
  for (var i in addedObject) {
    bot.sendMessage({
      to: channelID,
      message: messageDecider(user, i, addedObject)
    });
  }
}

function serverEvaluator(total, addedObject, channelID) {
  for (var i in addedObject) {
    bot.sendMessage({
      to: channelID,
      message: serverDecider(i, total[i]-addedObject[i], total[i])
    });
  }
}

/**this function will decide what message to send out. this chooses by seeing if the user
 * crossed a threshold with the amount of times they cursed in the last scentence compared
 * with the total number they have saved up. this method is also re-used when pinging the 
 * server-wide messages... I think... I'm hoping to re-use this in that manner, but we will 
 * see when I get to that bridge
 */
function messageDecider(user, curse, cursesChanged) {

  if (user.jarObject[curse] == cursesChanged[curse]) {
    return `<@!${user._id}> has just used ${curse.toLowerCase()} for the 
    first time, ${curses.userMessages.message1}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 10 && user.jarObject[curse] >= 10) {
    return `<@!${user._id}> has used ${curse.toLowerCase()} over 10 times, ${curses.userMessages.message2}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 50 && user.jarObject[curse] >= 50) {
    return `<@!${user._id}> has used ${curse.toLowerCase()} over 50 times, ${curses.userMessages.message3}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 100 && user.jarObject[curse] >= 100) {
    return `<@!${user._id}> has used ${curse.toLowerCase()} over 100 times, ${curses.userMessages.message4}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 200 && user.jarObject[curse] >= 200) {
    return `<@!${user._id}> has used ${curse.toLowerCase()} over 200 times, ${curses.userMessages.message5}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 250 && user.jarObject[curse] >= 250) {
    return `<@!${user_id}> has used ${curse.toLowerCase()} over 250 times, ${curses.userMessages.message6}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 350 && user.jarObject[curse] >= 350) {
    return `<@!${user._id}> has used ${curse.toLowerCase()} over 350 times, ${curses.userMessages.message7}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 500 && user.jarObject[curse] >= 500) {
    return `<@!${user._id}> has used ${curse.toLowerCase()} over 500 times, ${curses.userMessages.message8}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 600 && user.jarObject[curse] >= 600) {
    return `<@!${user._id}> has used ${curse.toLowerCase()} over 600 times, ${curses.userMessages.message9}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 700 && user.jarObject[curse] >= 700) {
    return `<@!${user._id}> has used ${curse.toLowerCase()} over 700 times, ${curses.userMessages.message10}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 800 && user.jarObject[curse] >= 800) {
    return `<@!${user._id}> has used ${curse.toLowerCase()} over 800 times, ${curses.userMessages.message11}`;
  } else if ((user.jarObject[curse]-cursesChanged[curse]) < 1000 && user.jarObject[curse] >= 1000) {
    return `<@!${user._id}> has used ${curse.toLowerCase()} over 1000 times. ${curses.userMessages.message12}`;
  } else {return '';}
}

function serverDecider(swear, difference, total) {
  if (difference < 10 && total >= 10) {
    return `This server has used ${swear.toLowerCase()}, over 10 times, ${curses.serverMessages.message1}`;
  } else if (difference < 100 && total >= 100) {
    return `This server has used ${swear.toLowerCase()}, over 100 times, ${curses.serverMessages.message2}`;
  } else if (difference < 250 && total >= 250) {
    return `This server has used ${swear.toLowerCase()}, over 250 times, ${curses.serverMessages.message3}`;
  } else if (difference < 500 && total >= 500) {
    return `This server has used ${swear.toLowerCase()}, over 500 times, ${curses.serverMessages.message4}`;
  } else if (difference < 1000 && total >= 1000) {
    return `This server has used ${swear.toLowerCase()}, over 1,000 times, ${curses.serverMessages.message5}`;
  } else if (difference < 1250 && total >= 1250) {
    return `This server has used ${swear.toLowerCase()}, over 1,250 times, ${curses.serverMessages.message6}`;
  } else if (difference < 1500 && total >= 1500) {
    return `This server has used ${swear.toLowerCase()}, over 1,500 times, ${curses.serverMessages.message7}`;
  } else if (difference < 2000 && total >= 2000) {
    return `This server has used ${swear.toLowerCase()}, over 2,000 times, ${curses.serverMessages.message8}`;
  } else if (difference < 5000 && total >= 5000) {
    return `This server has used ${swear.toLowerCase()}, over 5,000 times, ${curses.serverMessages.message9}`;
  } else if (difference < 7500 && total >= 7500) {
    return `This server has used ${swear.toLowerCase()}, over 7,500 times, ${curses.serverMessages.message10}`;
  } else if (difference < 9500 && total >= 9500) {
    return `This server has used ${swear.toLowerCase()}, over 9,500 times, ${curses.serverMessages.message11}`;
  } else if (difference < 9750 && total >= 9750) {
    return `This server has used ${swear.toLowerCase()}, over 9,750 times, ${curses.serverMessages.message12}`;
  } else if (difference < 9850 && total >= 9850) {
    return `This server has used ${swear.toLowerCase()}, over 9,850 times, ${curses.serverMessages.message13}`;
  } else if (difference< 10000 && total >= 10000) {
    return `This server has used ${swear.toLowerCase()}, over 10,000 times, ${curses.serverMessages.message14}`;
  } else {
    return '';
  }
}