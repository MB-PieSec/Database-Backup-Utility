import {getCredentials} from "../utils/getCredentials.js";
import {askQuestion} from "../utils/askQuestions.js";
import {validateOutputPath} from "../utils/validateOutputPath.js";
import { PostgreSQLBackupService } from "../services/postgreSQLBackupService.js";

export async function postgreSQLController(verbose: boolean): Promise<void> {
    const postgreService = new PostgreSQLBackupService(await getCredentials("postgresql"), verbose);
    try {
        const connect: boolean = await postgreService.connectToDatabase();
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
        await postgreService.backup(outputPath);
    } catch (error) {
        throw error;
    } finally {
        await postgreService.disconnect();
    }
}