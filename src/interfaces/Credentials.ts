export interface DatabaseCredentials{
    hostname?: string;
    port?: number;
    dbName: string;
    username?: string;
    password?: string;
    connectionString?: string;
    tls?: boolean;
}