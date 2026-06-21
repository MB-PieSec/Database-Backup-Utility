import { askQuestion, closeQuestion } from "../utils/askQuestions.js";
import { mongoController } from "../controllers/mongoController.js";
import { postgreSQLController } from "../controllers/postgreSQLController.js";
import { mySQLController } from "../controllers/mySQLController.js";
async function chooseDatabase(): Promise<void> {
    try {
        const verboseInput = await askQuestion("Enable verbose mode? [y/n]: ");
        const verbose: boolean = verboseInput.trim().toLowerCase() === "y";
        const dbChoice: string = await askQuestion(`What database you want to connect to? \n1.MongoDB \n2.MySQL \n3.PostgreSQL\ninput: `);
        switch(dbChoice){
            case "1":
                console.log("Connecting to MongoDB...");
                await mongoController(verbose);
                break;
            case "2":
                console.log("Connecting to MySQL...");
                await mySQLController(verbose);
                break;
            case "3":
                console.log("Connecting to PostgreSQL...");
                await postgreSQLController(verbose);
                break;
            default:
                console.error("Invalid choice. Please enter 1, 2 or 3.");            
        }
    } catch (error:any) {
        console.error(error.message);
    } finally{
        closeQuestion();
    }

}

chooseDatabase();