import { IDatabaseBackupService } from "../interfaces/IDatabaseBackupService.js";
import mysql from "mysql2/promise";
import { Connection } from "mysql2/promise";
import { DatabaseCredentials } from "../interfaces/Credentials.js";
import { promises as fs } from "fs";
import path from "path";

export class MySQLBackupService implements IDatabaseBackupService {
    private client: Connection | null = null;
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
            let client: Connection;
            const { hostname, port, dbName, username, password, tls = false } = this.credentials;
            this.log(`Connecting to ${hostname}:${port} (SSL: ${tls})...`)
            client = await mysql.createConnection({
                host: hostname,
                port: port,
                database: dbName,
                user: username || undefined,
                password: password || undefined,
                ssl: tls ? { rejectUnauthorized: false } : undefined
            });
            this.client = client;
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

    async backup(outputPath:string): Promise<void>{
        if(!this.client){
            throw new Error("Database connection not established. Call connectToDatabase() first.")
        }
        this.log(`Dumping backup to: ${outputPath}`);
        await fs.mkdir(outputPath, { recursive: true });
        const [tablesResult] = await this.client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = ?
            AND table_type = "BASE TABLE"    
        `,
        [this.credentials.dbName]
        ) as any[][];
        if (tablesResult.length === 0){
            this.log("No tables found in the database.");
            return;
        }
        for(const row of tablesResult){
            const tableName = row.table_name;
            const safeName = tableName.replace(/[^a-zA-Z0-9-_]/g, "_");
            const filePath = path.join(outputPath, `${safeName}.json`);
            const [data] = await this.client.query(`SELECT * FROM ${tableName}`) as any[][];
            const json = JSON.stringify(data, null, 2);
            await fs.writeFile(filePath, json);
        }
        this.log(`Dumped backup successfully to ${outputPath}`);
    }

    async disconnect(): Promise<void>{
        if(this.client){
            try {
                await this.client.end();
                this.log("Disconnected from MySQL.");
            } catch (error) {
                console.warn("Error while disconnecting:", (error as Error).message);
            } finally {
                this.client = null;
            }
        }
    }
}