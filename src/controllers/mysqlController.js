import askQuestion from "../utils/askQuestion.js"
import MySQLBackupService from "../services/mysqlBackupService.js";
import validateOutputPath from "../utils/validateOutputPath.js";
import getCredentials from "../utils/getCredentials.js";
import chalk from "chalk";

async function mysqlController(){
    try {
        const credentials = await getCredentials();
        if (!credentials.password || !credentials.username){
            throw new Error(chalk.red.italic("Username and password must be specified in order to connect to MySQL."));
        } 
        console.log(chalk.yellow(`Your connection string: mysql://${credentials.username}:${credentials.password}@${credentials.hostname}:${credentials.port}/${credentials.dbName}`));
    
        const mysqlService = new MySQLBackupService(credentials);
        const connected = await mysqlService.connectToDatabase();
        if(!connected){
            console.error(chalk.red.italic("Backup aborted due to connection failure!"));
            process.exit(1);
        }
        const confirm = await askQuestion(chalk.whiteBright.bold("Do you want to backup the database? [y/n]\ninput: "));
        if (confirm.toLowerCase().trim() !== "y"){
            console.log(chalk.yellow("Exiting..."));
            process.exit(1);
        }

        const pathInput = await askQuestion(chalk.whiteBright.bold("Enter the path to store the backup: \ninput: "));
        const outputPath = await validateOutputPath(pathInput);
        await mysqlService.backup(outputPath);
    } catch (error) {
        console.error(chalk.red.bold("Something went wrong in mysqlController():", error.message));
    }  
}


export default mysqlController;