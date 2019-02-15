/**setting up the database to keep track of everyone for this */
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var db;

mongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true}, function(err, database) {
  assert.equal(null, err);
  console.log('database connection made');

  db = database.db('users');
  /*below is a code to delete the users table so i can just un-comment this
    rather than type it out everytime*/
    //db.collection('users').drop(function(err, delOk) {
    //     if (err) throw err;
    //     if (delOk) console.log('users database dropped');
    //});
});

module.exports = {collection : (name) => db.collection(name)}