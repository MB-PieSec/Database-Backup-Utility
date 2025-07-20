class IDatabaseBackupService {
    constructor(){
        if (this.constructor === IDatabaseBackupService){
            throw new Error("Cannot instantiate interface IDatabaseBackupService directly.")
        }
        if (this.connectToDatabase === undefined){
            throw new Error("Class must implement connectToDatabase().");
        }
        if (this.backup === undefined){
            throw new Error("Class must implement backup(outputPath).");
        }
    }   
}

export default IDatabaseBackupService;