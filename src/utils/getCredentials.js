import askQuestion from "./askQuestion.js";
import chalk from "chalk";

async function getCredentials() {
    try{
        const hostname = await askQuestion(chalk.whiteBright.bold("Enter the hostname:" + 
            chalk.gray(" (e.g localhost or 127.0.0.1)\n")));
        if (!hostname){
            throw new Error(chalk.red.italic("Hostname was not provided!"));
        }   
        const PORT = await askQuestion(chalk.whiteBright.bold("Enter the port:" +
            chalk.gray(" (defaults: {MongoDB: 27017} {PostgreSQL: 5432} {MySQL: 3306} )\n")
        ));
        const portNum = Number(PORT);
        if (!PORT || isNaN(portNum) || portNum < 1 || portNum > 65535){
            throw new Error(chalk.red.italic("Port was not provided or out of bounds."));
        }
        const dbName = await askQuestion(chalk.whiteBright.bold("Enter database name:\n"));
        if (!dbName){
            throw new Error(chalk.red.italic("dbName was not provided."))
        }
        const username = await askQuestion(chalk.whiteBright.bold("Enter username:")+
                                        chalk.gray(" (Optional: Only for MongoDB)\n"));
        const password = await askQuestion(chalk.whiteBright.bold("Enter password:")+
                                        chalk.gray(" (Optional: Only for MongoDB )\n"));
    
        const credentials = {
            hostname: hostname,
            port: PORT,
            dbName: dbName,
            username: username || undefined,
            password: password || undefined
        }
        return credentials;
        
    } catch(error){
        console.error(chalk.red.bold("An error occurred in credentials(): ", error.message));
        process.exit(1);
    }
}

export default getCredentials;
