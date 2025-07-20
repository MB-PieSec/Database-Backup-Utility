import IDatabaseBackupService from "../interfaces/IDatabaseBackupService.js";
import path from "path";
import { promises as fs} from "fs";
import mysql from "mysql2/promise";
import chalk from "chalk";

class MySQLBackupService extends IDatabaseBackupService {
    constructor(credentials){
        super();
        this.credentials = credentials;
        const { hostname, port, dbName, username, password } = this.credentials;
        this.config = {
            host: hostname,
            database: dbName,
            user: username,
            password: password,
            port: Number(port)
        }
    }

    async connectToDatabase(){
        try {
            console.log(chalk.yellow("Connecting to MySQL..."));
            const uri = `mysql://${this.config.user}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
            try {
                this.connection = await mysql.createConnection(uri);
                await this.connection.connect();
                console.log(chalk.green(`Successfully connected to MySQL database: ${this.config.database}`));
                return true;
            } catch (error) {
                console.error(chalk.red.italic("Failed to connect to MySQL:", error.message));
                return false;
            }
        } catch (error) {
            console.error(chalk.red.bold("Something went wrong in MySQLBackupService.connectToDatabase()", error.message));
            process.exit(1);
        }
    }

    async backup(outputPath){
        try {
            const [ tables ] = await this.connection.query('SHOW TABLES');
            if (tables.length === 0) {
                console.log(chalk.yellow("No tables found in the database."));
                return;
            }
            const tableKey = Object.keys(tables[0])[0];
            
        for (const table of tables) {
            const tableName = table[tableKey];
            console.log(chalk.yellow(`Backing up table: ${tableName}`));

            const [rows] = await this.connection.query(`SELECT * FROM \`${tableName}\``);

            const filePath = path.join(outputPath, `${tableName}.json`);
            await fs.writeFile(filePath, JSON.stringify(rows, null, 2), 'utf8');

            console.log(chalk.green(`Saved ${tableName}.json`));
        }

        console.log(chalk.green("MySQL backup complete."));
        } catch (error) {
            console.error(chalk.red.italic("Error during MySQL backup:", error.message));
        } finally {
            if (this.connection){
                await this.connection.end();
                console.log(chalk.yellow("MySQL connection closed."));
                process.exit(0);
            }
        }
    }
}


export default MySQLBackupService;