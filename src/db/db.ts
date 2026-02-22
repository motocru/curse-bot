import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

export let db: Db | undefined;

let client: MongoClient;

async function connectWithRetry(retries = 5, delay = 5000) {
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
        console.error('❌ MONGODB_URI environment variable is not set!');
        process.exit(1);
    }

    client = new MongoClient(connectionString, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        }
    });

    while (retries > 0) {
        try {
            console.log(`Attempting to connect to MongoDB... (${retries} retries left)`);
            await client.connect();

            db = client.db('servers');
            // Ping to confirm the connection is actually usable
            await db.command({ ping: 1 });

            console.log('✅ Successfully connected to MongoDB');
            return; // Exit the loop on success
        } catch (err) {
            retries--;
            console.error(`❌ Connection failed. Retrying in ${delay / 1000}s...`);
            if (retries === 0) {
                console.error('Could not connect to MongoDB. Exiting.');
                process.exit(1);
            }
            // Wait for the specified delay before trying again
            await new Promise(res => setTimeout(res, delay));
        }
    }
}

export const dbPromise = connectWithRetry();