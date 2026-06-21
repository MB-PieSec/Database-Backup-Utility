import {getCredentials} from "../utils/getCredentials.js";
import {MongoBackupService} from "../services/mongoBackupService.js";
import {askQuestion} from "../utils/askQuestions.js";
import {validateOutputPath} from "../utils/validateOutputPath.js";

export async function mongoController(verbose: boolean): Promise<void>{
    const mongoService = new MongoBackupService(await getCredentials("mongodb"), verbose);
    try{
        const connect:boolean = await mongoService.connectToDatabase();
        if (!connect) {
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
        await mongoService.backup(outputPath);
    } catch (error) {
        throw error;
    } finally {
        await mongoService.disconnect();
    }
}