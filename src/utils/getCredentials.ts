import {askQuestion} from "./askQuestions.js";
import {DatabaseCredentials} from "../interfaces/Credentials.js";

export async function getCredentials(dbType: "mongodb" | "mysql" | "postgresql"): Promise<DatabaseCredentials> {
    if(dbType === "mysql"){
        return await getManualCredentials();
    }
    console.log("How would you like to connect?");
    const choice = await askQuestion("1. Enter details manually\n2. Paste full connection string\nEnter choice (1 or 2):");
    if (choice.trim() === "2"){
        return await getConnectionString(dbType);
    }
    return await getManualCredentials();
}


async function getManualCredentials(): Promise<DatabaseCredentials>{
    try {
        const hostname: string = await askQuestion("Enter hostname:");
        const portStr: string = await askQuestion("Enter port:");
        const dbName: string = await askQuestion("Enter database name:");
        const username: string = await askQuestion("Enter username (optional):");
        const password: string = await askQuestion("Enter password (optional):");
        const tlsInput:string = await askQuestion("Use TLS/SSL? (y/n, default: n):");
        const tls: boolean = tlsInput.trim().toLowerCase() === "y";
        const portNum:number = parseInt(portStr.trim(), 10);
        const credentials: DatabaseCredentials = {
            hostname: hostname.trim(),
            port: portNum,
            dbName: dbName.trim(),
            username: username.trim() || undefined,
            password: password.trim() || undefined,
            tls,
        }
        if (!credentials.hostname?.trim()) {
            throw new Error("Hostname is required (e.g. localhost or your server address).");
        }
        if (!credentials.dbName?.trim()) {
            throw new Error("Database name is required.");
        }
        if (credentials.port !== undefined && (isNaN(credentials.port) || credentials.port <= 0)) {
            throw new Error("Port must be a valid positive number.");
        }

        return credentials;
    } catch (error:any) {
        throw new Error(error.message);
    }
}

async function getConnectionString(dbType: "mongodb" | "mysql" | "postgresql"): Promise<DatabaseCredentials>{
    switch(dbType){
        case "mongodb": {
            let connectionString: string = await askQuestion("Paste your full MongoDB connection string:");
            console.log("CONNECTION STRING VALUE:", connectionString);
            connectionString = connectionString.trim();
            if (!connectionString) {
                throw new Error("Connection string cannot be empty.");
            }
            if (!connectionString.startsWith("mongodb://") && !connectionString.startsWith("mongodb+srv://")) {
                throw new Error('Invalid connection string. It must start with "mongodb://" or "mongodb+srv://"');
            }
            const dbName:string = (await askQuestion("Which database do you want to backup?:")).trim();
            if (!dbName) {
                throw new Error("Database name is required.");
            }
            console.log(`Connection string accepted. Target database: ${dbName}`);
            return {
                connectionString: connectionString,
                dbName: dbName,
            };
        }
        case "mysql":
            throw new Error("Connection strings are not supported for MySQL.");
        case "postgresql": {
            let connectionString: string = await askQuestion("Paste your full PostgreSQL connection string:");
            connectionString = connectionString.trim();
            if (!connectionString) {
                throw new Error("Connection string cannot be empty.");
            }
            if (!connectionString.startsWith("postgresql://") && !connectionString.startsWith("postgres://")){
                throw new Error('Invalid connection string. It must start with "postgresql://"');
            }
            const dbName:string = (await askQuestion("Enter database to backup:")).trim();
            if(!dbName){
                throw new Error("Database name is required.");
            }
            console.log(`Connection string accepted. Target database ${dbName}`);
            return {
                connectionString: connectionString,
                dbName: dbName
            }
        }
        default: 
            throw new Error("Connection strings are not supported for this database.")
    }
}
