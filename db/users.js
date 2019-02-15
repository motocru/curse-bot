var db = require('./db');
var User = require('./userModel');
var mongo = require('mongodb');

/**adds a user to the databse  */
function save(id, swear, cb) {
  db.collection('users').findOne({'_id': id}, function(err, existingUser) {
    if (err) {console.log(err);}
    if (existingUser == null) {
      db.collection('users').insertOne(new User(id, swear), function(err2, newUser) {
        cb(err2, newUser.ops[0]);
      });
    } else {
      cb(err, existingUser);
    }
  });
}
module.exports.save = save;

/**find a user by a given userId and return it*/
function findByID(id, cb) {
  db.collection('users').findOne({'_id': id}, function(err, foundUser) {
    cb(err, foundUser);
  });
}
module.exports.findByID = findByID;

/**finds a user via their Id and loops over the stored swear object associated with the user
 * then increments the swear counter based upon the amounts of times the user used that
 * specific swear word. 
 */
function addSwear(id, swearObject, cb) {
  findByID(id, function(err, foundUser) {
    if (err) {console.log(err);}
    if (foundUser == null) {console.log(`COULD NOT FIND USER ${id}`);}
    else {
      var newValues = {$set: {'jarObject': swearObject}};
      db.collection('users').updateOne({'_id': id}, newValues, function(err2, updateStatus) {
        if (err2) {console.log(err2);}
        findByID(id, function(err3, updatedUser) {
          if (err3) {console.log(err3);}
          cb(err3, updatedUser);
        });
      });
    }
  });
}
module.exports.addSwear = addSwear;

function userSwears(id, cb) {
  findByID(id, function(err, foundUser) {
    if (err) {console.log(err);}
    cb(err, foundUser.jarObject);
  });
}
module.exports.userSwears = userSwears;

/**returns all swears recorded by every user in the database */
function totalSwears(cb) {
  var totalObject = {};
  db.collection('users').find({}).toArray(function(err, docs) {
    if (err) {console.log(err);}
    for (var i in docs) {
      for (var j in docs[i].jarObject) {
        //console.log(docs[i].jarObject[j]);
        if (totalObject[j]) {totalObject[j]+= docs[i].jarObject[j];}
        else {totalObject[j] = docs[i].jarObject[j];}
      }
    }
    cb(err, totalObject);
  });
}
module.exports.totalSwears = totalSwears;