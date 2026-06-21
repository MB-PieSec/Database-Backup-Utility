import { IDatabaseBackupService } from "../interfaces/IDatabaseBackupService.js";
import { DatabaseCredentials } from "../interfaces/Credentials.js";
import { Client } from "pg";
import { promises as fs } from "fs";
import path from "path";

export class PostgreSQLBackupService implements IDatabaseBackupService {
    private client: Client | null = null;
    readonly credentials: DatabaseCredentials;
    private verbose: boolean;

    constructor(credentials: DatabaseCredentials, verbose: boolean = true) {
        this.credentials = credentials;
        this.verbose = verbose;
    }

    private log(message: string): void {
        if (this.verbose) console.log(message);
    }

    async connectToDatabase(): Promise<boolean>{
        try {
            let client: Client;
            if(this.credentials.connectionString){
                this.log("Connecting using full connection string...");
                client = new Client(this.credentials.connectionString);
            } else {
                const { hostname, port, dbName, username, password, tls = false } = this.credentials;
                this.log(`Connecting to ${hostname}:${port} (SSL: ${tls})...`)
                client = new Client({
                    host: hostname,
                    port: port,
                    database: dbName,
                    user: username || undefined,
                    password: password || undefined,
                    ssl: tls
                })
            }
            this.client = client
            await this.client.connect();

            const targetDbName = this.credentials.dbName;
            if (!targetDbName){
                throw new Error("Database name is missing.");
            }
            this.log(`Successfully connected to database: ${targetDbName}`);
            return true;
        } catch (error) {
            console.error(`Failed to connect: ${(error as Error).message}`);
            return false;
        }
    }

    async backup(outputPath: string): Promise<void>{
        if(!this.client){
            throw new Error("Database connection not established. Call connectToDatabase() first.")
        }
        this.log(`Dumping backup to: ${outputPath}`)
        await fs.mkdir(outputPath, { recursive: true });
        const tablesResult = await this.client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'    
        `);
        if (tablesResult.rows.length === 0){
            this.log("No tables found in the database.");
            return;
        }
        for(const row of tablesResult.rows){
            const tableName = row.table_name;
            const safeName = tableName.replace(/[^a-zA-Z0-9-_]/g, "_");
            const filePath = path.join(outputPath, `${safeName}.json`);
            const data = await this.client.query(`SELECT * FROM ${tableName}`);
            const json = JSON.stringify(data.rows, null, 2);
            await fs.writeFile(filePath, json);
        }
        this.log(`Dumped backup successfully to ${outputPath}`);
    }

    async disconnect(): Promise<void> {
        if(this.client){
            try {
                await this.client.end();
                this.log("Disconnected from PostgreSQL.");
            } catch (error) {
                console.warn("Error while disconnecting:", (error as Error).message);
            } finally {
                this.client = null;
            }
        }
    }
}