import { MongoClient, Db } from 'mongodb';
export let db: Db | undefined;

 MongoClient.connect('mongodb://localhost:27017', (err, database) => {
    if (err !== undefined && err !== null) {
        console.error(err);
    } else {
        console.log('database connection made');
        db = database?.db('servers');
        /*below is a code to delete the users table so i can just un-comment this
        rather than type it out everytime*/
        //db.collection('servers').drop(function(err, delOk) {
        //     if (err) throw err;
        //     if (delOk) console.log('users database dropped');
        //});
    }
});