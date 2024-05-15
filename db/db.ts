import { MongoClient, Db, ServerApiVersion } from 'mongodb';
export let db: Db | undefined;

const client = new MongoClient('mongodb://localhost:27017', {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});

async function run() {
    try {
        await client.connect();

        db = client.db('servers');
        db.command({ ping: 1 });
        console.log('ping successful');
    } finally {
        //ensure our closure of the client connection
        client.close();
    }
}
run().catch(console.dir);


//  MongoClient.connect('mongodb://localhost:27017', (err, database) => {
//     if (err !== undefined && err !== null) {
//         console.error(err);
//     } else {
//         console.log('database connection made');
//         db = database?.db('servers');
//         /*below is a code to delete the tables so i can just un-comment this
//         rather than type it out everytime*/
//         //db?.dropDatabase();
//     }
// });