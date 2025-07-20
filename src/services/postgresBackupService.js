import IDatabaseBackupService from "../interfaces/IDatabaseBackupService.js";
import { Client } from "pg";
import path from "path";
import { promises as fs} from "fs";
import chalk from "chalk";

class PostgresBackupService extends IDatabaseBackupService {
    constructor(credentials) {
        super();
        this.credentials = credentials;
        const { hostname, port, dbName,  username, password } = credentials;
        this.config = {
            host: hostname,
            port: Number(port),
            database: dbName,
            user: username,
            password: password
        }

        this.client = new Client(this.config);
    }

    async connectToDatabase(){
        try {
            console.log(chalk.yellow("Connecting to PostgreSQL..."));
            try {
                await this.client.connect();
                console.log(chalk.green(`Successfully connected to PostgreSQL database: ${this.config.database}`));
                return true;
            } catch (error) {
                console.error(chalk.red.italic("Failed to connect to PostgreSQL:", error.message));
                return false;
            }
        } catch (error) {
            console.error(chalk.red.bold("Something went wrong in PostgreBackupService.connectToDatabase()", error.message));
            process.exit(1);
        }
    }

    async backup(outputPath){
        try {
            const { rows } = await this.client.query(`
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
            `)
            const backup = {};

            for (const row of rows) {
                const tableName = row.table_name;
                const result = await this.client.query(`SELECT * FROM ${tableName}`);
                backup[tableName] = result.rows;
            }

            const filePath = path.join(outputPath, `${this.config.database}_backup.json`);
            await fs.writeFile(filePath, JSON.stringify(backup, null, 2));
            console.log(chalk.green(`Backup saved to ${filePath}`));
            process.exit(0);
        } catch (error) {
            console.error(chalk.red.bold("Something went wrong in PostgresBackupService.backup():", error.message));
            process.exit(1);
        } finally {
            await this.client.end();
        }
    }
}


export default PostgresBackupService;