

export interface IDatabaseBackupService {
    connectToDatabase(): Promise<boolean | void>;
    backup( outputPath: string): Promise<void>;
    disconnect(): Promise<void>;
}