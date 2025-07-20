import askQuestion from "../utils/askQuestion.js";
import mongoController from "../controllers/mongoController.js";
import postgresController from "../controllers/postgresController.js";
import mysqlController from "../controllers/mysqlController.js";
import chalk from "chalk";

async function main(){
    try {
        const dbChoice = await askQuestion(chalk.bold(`What database you want to connect to?\n 1.MongoDB\n 2.MySQL\n 3.PostgreSQL\n___________\n input: `));
        switch(dbChoice){
            case "1":
                try {
                    console.log(chalk.yellow("Connecting to MongoDB..."));
                    await mongoController();
                } catch (error) {
                    console.error(chalk.red.bold("Something went wrong in main():", error.message));
                }
                break;
            case "2":
                try {
                    console.log(chalk.yellow("Connecting to MySQL..."));
                    await mysqlController();
                } catch (error) {
                    console.error(chalk.red.bold("Something went wrong in main():", error.message));
                }
                break;
            case "3":
                try {
                    console.log(chalk.yellow("Connecting to PostgreSQL..."));
                    await postgresController();
                } catch (error) {
                    console.error(chalk.red.bold("Something went wrong in main():", error.message));
                }
                break;
            default:
                console.log(chalk.red.bold("Invalid input"));
                break;
        }
    } catch (error) {
        console.error(chalk.red.bold("There was an error accepting user's input"));
    }
}


main();