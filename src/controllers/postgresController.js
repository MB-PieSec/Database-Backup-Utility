import askQuestion from "../utils/askQuestion.js"
import PostgresBackupService from "../services/postgresBackupService.js";
import validateOutputPath from "../utils/validateOutputPath.js";
import getCredentials from "../utils/getCredentials.js";
import chalk from "chalk";

async function postgresController(){
    try {
        const credentials = await getCredentials();
        if (!credentials.password || !credentials.username){
            throw new Error(chalk.red.italic("Username and password must be specified in order to connect to PostgreSQL."));
        } 
        console.log(chalk.yellow(`Your connection string: postgresql://${credentials.username}:${credentials.password}@${credentials.hostname}:${credentials.port}/${credentials.dbName}`));
    
        const postgresService = new PostgresBackupService(credentials);
        const connected = await postgresService.connectToDatabase();
        if(!connected){
            console.error(chalk.red.italic("Backup aborted due to connection failure!"));
            return;
        }
        const confirm = await askQuestion(chalk.whiteBright.bold("Do you want to backup the database? [y/n]\ninput: "));
        if (confirm.toLowerCase().trim() !== "y"){
            console.log(chalk.yellow("Exiting..."));
            return;
        }

        const pathInput = await askQuestion(chalk.whiteBright.bold("Enter the path to store the backup: \ninput: "));
        const outputPath = await validateOutputPath(pathInput);
        await postgresService.backup(outputPath);
    } catch (error) {
        console.error(chalk.red.bold("Something went wrong in postgresController():", error.message));
    }
    
}

export default postgresController;