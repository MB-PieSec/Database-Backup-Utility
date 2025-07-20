import { MongoClient } from "mongodb";
import path from "path";
import { promises as fs} from "fs";
import IDatabaseBackupService from "../interfaces/IDatabaseBackupService.js";
import chalk from "chalk";

class MongoBackupService extends IDatabaseBackupService{
    constructor(credentials){
        super();
        this.credentials = credentials;
        const {hostname, port, dbName, username, password} = this.credentials;
        this.hostname = hostname || "";
        this.port = port || "";
        this.dbName = dbName || "";
        this.username = username || "";
        this.password = password || "";
    }

    async connectToDatabase(){
        try {
            let uri;
            if (!this.password || !this.username){
                uri = `mongodb://${this.hostname}:${this.port}/${this.dbName}`;
            } else {
                uri = `mongodb://${this.username}:${this.password}@${this.hostname}:${this.port}/${this.dbName}`;
            }
            const client = new MongoClient(uri);
            try {
                await client.connect();
                console.log(chalk.green("Connected to MongoDB..."))
                const adminDb = client.db().admin();
                const { databases } = await adminDb.listDatabases();
                const isAvailable = databases.some(db => db.name === this.dbName);
                if (!isAvailable){
                    console.log(chalk.red.bold("The database with the provided credentials does not exist."));
                    return false;
                } else {
                    console.log(chalk.green(`Connection to ${this.dbName} established successfully.`));
                    this.client = client;
                    this.db = client.db(this.dbName);
                    return true;
                }
            } catch (error) {
                console.error(chalk.red.bold("Something went wrong when trying to connect to MongoDB in connectToDatabase():", error.message));
            }

        } catch (error) {
            console.error(chalk.red.bold("Something went wrong in MongoBackupService.connectToDatabase():", error.message));
        }


    }

    async backup(outputPath){
        try {
            const collections = await this.db.listCollections().toArray();
            for (const collection of collections) {
                const name = collection.name;
                const documents = await this.db.collection(name).find().toArray();
                const filePath = path.join(outputPath, `${name}.json`);
                const jsonContent = JSON.stringify(documents, null, 2);
                await fs.writeFile(filePath, jsonContent);
                console.log(`Backed up collection "${name}" to ${filePath}`);

            }
    
            console.log("All the collections were backed up successfully.")
            process.exit(1);
        } catch (error) {
            console.error("Something went wrong in MongoBackUpService.backup():", error.message);
            process.exit(1);
        }
    }
}




export default MongoBackupService;