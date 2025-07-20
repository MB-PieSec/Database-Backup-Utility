import askQuestion from "../utils/askQuestion.js"
import MongoBackupService from "../services/mongoBackupService.js";
import validateOutputPath from "../utils/validateOutputPath.js";
import getCredentials from "../utils/getCredentials.js";
import chalk from "chalk";

async function mongoController(){
    try {
        const credentials = await getCredentials();
        if (credentials.username && credentials.password){
            console.log(chalk.yellow(`Your connection string: mongodb://${credentials.username}:${credentials.password}@${credentials.hostname}:${credentials.port}/${credentials.dbName}`));
        } else {
            console.log(chalk.yellow(`Your connection string: mongodb://${credentials.hostname}:${credentials.port}/${credentials.dbName} `));
        }

        const mongoService = new MongoBackupService(credentials);
        
        const connected = await mongoService.connectToDatabase();
        if(!connected){
            console.error(chalk.red.italic("Backup aborted due to connection failure!"));
            process.exit(1);
        }

        const confirm = await askQuestion(chalk.whiteBright.bold("Do you want to backup the database? [y/n]\ninput: "));
        if (confirm.toLowerCase().trim() !== "y"){
            console.log(chalk.yellow("Exiting..."));
            return;
        }

        const pathInput = await askQuestion(chalk.whiteBright.bold("Enter the path to store the backup: \ninput: "));
        const outputPath = await validateOutputPath(pathInput);
        await mongoService.backup(outputPath);
    } catch (error) {
        console.error(chalk.red.bold("Something went wrong in mongoController():", error.message));
    }

}

export default mongoController;