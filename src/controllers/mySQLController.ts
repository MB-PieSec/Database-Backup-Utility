import {getCredentials} from "../utils/getCredentials.js";
import {askQuestion} from "../utils/askQuestions.js";
import {validateOutputPath} from "../utils/validateOutputPath.js";
import { MySQLBackupService } from "../services/mySQLBackupService.js";

export async function mySQLController(verbose: boolean): Promise<void> {
    const mySQLService = new MySQLBackupService(await getCredentials("mysql"), verbose);
    try {
        const connect: boolean = await mySQLService.connectToDatabase();
        if (!connect){
            console.log("Backup aborted due to connection failure!");
            return;
        }
        const confirm:string = await askQuestion("Do you want to backup the database? [y/n]: ");
        if (confirm.trim().toLowerCase() !== "y") {
            console.log("Exiting...");
            return;
        }
        const pathInput:string = await askQuestion("Enter the path to store the backup:");
        const outputPath:string = await validateOutputPath(pathInput);
        await mySQLService.backup(outputPath);
    } catch (error) {
        throw error;
    } finally {
        await mySQLService.disconnect();
    }
}