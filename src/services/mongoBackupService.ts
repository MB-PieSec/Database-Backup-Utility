import { MongoClient, Db } from "mongodb";
import path from "path";
import { promises as fs } from "fs";
import { IDatabaseBackupService } from "../interfaces/IDatabaseBackupService.js";
import { DatabaseCredentials } from "../interfaces/Credentials.js";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Transform } from "stream";

export class MongoBackupService implements IDatabaseBackupService {
    private client: MongoClient | null = null;
    private db: Db | null = null;
    readonly credentials: DatabaseCredentials;
    private verbose: boolean;

    constructor(credentials: DatabaseCredentials, verbose: boolean = true) {
        this.credentials = credentials;
        this.verbose = verbose;
    }

    private log(message: string): void {
        if (this.verbose) console.log(message);
    }

    async connectToDatabase(): Promise<boolean> {
        try {
            let client: MongoClient;
            if(this.credentials.connectionString){
                this.log("Connecting using full connection string...");
                client = new MongoClient(this.credentials.connectionString);
            } else {
                const { hostname, port, dbName, username, password, tls = false } = this.credentials;

                let uri: string;
                if (username && password) {
                    uri = `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostname}:${port}/${dbName}`;
                } else {
                    uri = `mongodb://${hostname}:${port}/${dbName}`;
                }
                this.log(`Connecting to ${hostname}:${port} (TLS: ${tls})...`);
                client = new MongoClient(uri , {
                    tls : tls
                });
            }
            this.client = client;
            await this.client.connect();

            const targetDbName:string = this.credentials.dbName;

            if (!targetDbName) {
                throw new Error("Database name is missing.");
            }

            this.db = this.client.db(targetDbName);

            this.log(`Successfully connected to database: ${targetDbName}`);
            return true;

        } catch (error) {
            console.error(`Failed to connect: ${(error as Error).message}`);
            return false;
        }
    }

    async backup(outputPath: string): Promise<void> {
        if (!this.db) {
            throw new Error("Database connection not established. Call connectToDatabase() first.");
        }

        try {
            this.log(`Starting streaming backup to: ${outputPath}`);

            await fs.mkdir(outputPath, { recursive: true });

            const collections = await this.db.listCollections().toArray();

            if (collections.length === 0) {
                this.log("No collections found in the database.");
                return;
            }

            for (const collectionInfo of collections) {
                const name = collectionInfo.name;
                const safeName = name.replace(/[^a-zA-Z0-9-_]/g, "_");
                const filePath = path.join(outputPath, `${safeName}.json`);

                this.log(`Streaming collection: ${name} ...`);

                const cursor = this.db.collection(name).find({});

                const writeStream = createWriteStream(filePath);

                writeStream.write("[\n");

                let isFirst = true;

                const jsonTransform = new Transform({
                    objectMode: true,
                    transform(doc: any, encoding: BufferEncoding, callback: (error?: Error | null, data?: any) => void) {
                        try {
                            const jsonLine = JSON.stringify(doc, null, 2);
                            const prefix = isFirst ? "" : ",\n";
                            isFirst = false;
                            callback(null, prefix + jsonLine);
                        } catch (err) {
                            callback(err as Error);
                        }
                    },
                });

                await pipeline(
                    cursor.stream(),
                    jsonTransform,
                    writeStream,
                    { end: false }
                );

                writeStream.write("\n]");
                writeStream.end();
                await new Promise<void>((resolve, reject) => {
                    writeStream.on("finish", resolve);
                    writeStream.on("error", reject);
                });

                this.log(`Successfully streamed collection "${name}" → ${safeName}.json`);
            }

            this.log(`Streaming backup completed successfully! ${collections.length} collections exported.`);

        } catch (error) {
            console.error("Backup failed:", (error as Error).message);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            try {
                await this.client.close();
                this.log("Disconnected from MongoDB.");
            } catch (error) {
                console.warn("Error while disconnecting:", (error as Error).message);
            } finally {
                this.client = null;
                this.db = null;
            }
        }
    }
}