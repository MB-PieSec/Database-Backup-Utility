import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("../utils/askQuestions.js", () => ({
    askQuestion: vi.fn(),
    closeQuestion: vi.fn()
}));

import { getCredentials } from "../utils/getCredentials.js";
import { askQuestion } from "../utils/askQuestions.js";

describe("getCredentials", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // ─── MySQL Manual Tests ───────────────────────────────────
    describe("MySQL", () => {
        test("Should return manual credentials for mysql", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("3306")       // port
                .mockResolvedValueOnce("testDB")     // dbName
                .mockResolvedValueOnce("root")       // username
                .mockResolvedValueOnce("pass123")    // password
                .mockResolvedValueOnce("n");         // tls
    
            const result = await getCredentials("mysql");
    
            expect(result).toEqual({
                hostname: "localhost",
                port: 3306,
                dbName: "testDB",
                username: "root",
                password: "pass123",
                tls: false
            });
        });
    
        test("Should throw when hostname is empty (MySQL)", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("")           // hostname — empty, but still need rest
                .mockResolvedValueOnce("3306")       // port
                .mockResolvedValueOnce("testDB")     // dbName
                .mockResolvedValueOnce("")           // username
                .mockResolvedValueOnce("")           // password
                .mockResolvedValueOnce("n");         // tls
    
            await expect(getCredentials("mysql")).rejects.toThrow("Hostname is required");
        });
    
        test("Should throw when port is negative (MySQL)", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("-1")         // port
                .mockResolvedValueOnce("testDB")     // dbName
                .mockResolvedValueOnce("root")       // username
                .mockResolvedValueOnce("pass123")    // password
                .mockResolvedValueOnce("n");         // tls // port fails
    
            await expect(getCredentials("mysql")).rejects.toThrow("Port must be a valid positive number");
        });
    
        test("Should throw when dbName is empty (MySQL)", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("4132")       // port
                .mockResolvedValueOnce("")           // dbName
                .mockResolvedValueOnce("root")       // username
                .mockResolvedValueOnce("pass123")    // password
                .mockResolvedValueOnce("n");         // tls // port fails
    
            await expect(getCredentials("mysql")).rejects.toThrow("Database name is required")
        });
    
        test("Should return undefined for optional fields when username and password are empty (MySQL)", async () =>{
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("4132")       // port
                .mockResolvedValueOnce("test")       // dbName
                .mockResolvedValueOnce("")           // username
                .mockResolvedValueOnce("")           // password
                .mockResolvedValueOnce("n")          // tls // port fails
    
            const result = await getCredentials("mysql");
            expect(result.username).toBeUndefined();
            expect(result.password).toBeUndefined();
        
        });
    });
    // ─── MongoDB Tests ───────────────────────────────────
    describe("MongoDB", () => {
        test("Should return manual credentials for MongoDB", async () => {
                vi.mocked(askQuestion)
                    .mockResolvedValueOnce("1")
                    .mockResolvedValueOnce("localhost")  // hostname
                    .mockResolvedValueOnce("3306")       // port
                    .mockResolvedValueOnce("testDB")     // dbName
                    .mockResolvedValueOnce("root")       // username
                    .mockResolvedValueOnce("pass123")    // password
                    .mockResolvedValueOnce("n");         // tls
    
                const result = await getCredentials("mongodb");
    
                expect(result).toEqual({
                    hostname: "localhost",
                    port: 3306,
                    dbName: "testDB",
                    username: "root",
                    password: "pass123",
                    tls: false
                });
            });
    
        test("Should throw when hostname is empty (MongoDB)", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("1")
                .mockResolvedValueOnce("")           // hostname — empty, but still need rest
                .mockResolvedValueOnce("3306")       // port
                .mockResolvedValueOnce("testDB")     // dbName
                .mockResolvedValueOnce("")           // username
                .mockResolvedValueOnce("")           // password
                .mockResolvedValueOnce("n");         // tls
    
            await expect(getCredentials("mongodb")).rejects.toThrow("Hostname is required");
        });
    
        test("Should throw when port is negative (MongoDB)", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("1")
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("-1")         // port
                .mockResolvedValueOnce("testDB")     // dbName
                .mockResolvedValueOnce("root")       // username
                .mockResolvedValueOnce("pass123")    // password
                .mockResolvedValueOnce("n");         // tls // port fails
    
            await expect(getCredentials("mongodb")).rejects.toThrow("Port must be a valid positive number");
        });
    
        test("Should throw when dbName is empty (MongoDB)", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("1")
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("4132")       // port
                .mockResolvedValueOnce("")           // dbName
                .mockResolvedValueOnce("root")       // username
                .mockResolvedValueOnce("pass123")    // password
                .mockResolvedValueOnce("n");         // tls // port fails
    
            await expect(getCredentials("mongodb")).rejects.toThrow("Database name is required")
        });
    
        test("Should return undefined for optional fields when username and password are empty (MongoDB)", async () =>{
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("1")
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("4132")       // port
                .mockResolvedValueOnce("test")       // dbName
                .mockResolvedValueOnce("")           // username
                .mockResolvedValueOnce("")           // password
                .mockResolvedValueOnce("n")          // tls // port fails
    
            const result = await getCredentials("mongodb");
            expect(result.username).toBeUndefined();
            expect(result.password).toBeUndefined();
        
        });
    
        test("Should return connection string for mongodb", async () =>{
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("2") 
                .mockResolvedValueOnce("mongodb://localhost:27017/testDB") 
                .mockResolvedValueOnce("testDB") 
    
            const result = await getCredentials("mongodb");
            expect(result).toEqual({
                connectionString: "mongodb://localhost:27017/testDB",
                dbName: "testDB"
            });
        });
    
        test("Should throw when MongoDB connection string is invalid(doesn't start with mongodb:// or mongodb+srv://)",
            async () => {
                vi.mocked(askQuestion)
                    .mockResolvedValueOnce("2")
                    .mockResolvedValueOnce("localhost:27017/testDB")
                    .mockResolvedValueOnce("testDB")
    
                await expect(getCredentials("mongodb")).rejects
                    .toThrow('Invalid connection string. It must start with "mongodb://" or "mongodb+srv://"');
    
            }
        );
    
        test("Should throw when MongoDB connection string is empty", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("2")
                .mockResolvedValueOnce("")
                .mockResolvedValueOnce("TestDB")
    
            await expect(getCredentials("mongodb")).rejects.toThrow("Connection string cannot be empty.")
        });

    })
    // ─── PostgreSQL Tests ───────────────────────────────────
    describe("PostgreSQL", () => {
        test("Should return manual credentials for PostgreSQL", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("1")
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("3306")       // port
                .mockResolvedValueOnce("testDB")     // dbName
                .mockResolvedValueOnce("root")       // username
                .mockResolvedValueOnce("pass123")    // password
                .mockResolvedValueOnce("n");         // tls
    
            const result = await getCredentials("postgresql");
    
            expect(result).toEqual({
                hostname: "localhost",
                port: 3306,
                dbName: "testDB",
                username: "root",
                password: "pass123",
                tls: false
            });
        });
    
        test("Should throw when hostname is empty (PostgreSQL)", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("1")
                .mockResolvedValueOnce("")           // hostname
                .mockResolvedValueOnce("3306")       // port
                .mockResolvedValueOnce("testDB")     // dbName
                .mockResolvedValueOnce("")           // username
                .mockResolvedValueOnce("")           // password
                .mockResolvedValueOnce("n");         // tls
    
            await expect(getCredentials("postgresql")).rejects.toThrow("Hostname is required");
        });
    
        test("Should throw when port is negative (PostgreSQL)", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("1")
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("-1")         // port
                .mockResolvedValueOnce("testDB")     // dbName
                .mockResolvedValueOnce("root")       // username
                .mockResolvedValueOnce("pass123")    // password
                .mockResolvedValueOnce("n");         // tls // port fails
    
            await expect(getCredentials("postgresql")).rejects.toThrow("Port must be a valid positive number");
        });
    
        test("Should throw when dbName is empty (PostgreSQL)", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("1")
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("4132")       // port
                .mockResolvedValueOnce("")           // dbName
                .mockResolvedValueOnce("root")       // username
                .mockResolvedValueOnce("pass123")    // password
                .mockResolvedValueOnce("n");         // tls // port fails
    
            await expect(getCredentials("postgresql")).rejects.toThrow("Database name is required")
        });
    
        test("Should return undefined for optional fields when username and password are empty (PostgreSQL)", async () =>{
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("1")
                .mockResolvedValueOnce("localhost")  // hostname
                .mockResolvedValueOnce("4132")       // port
                .mockResolvedValueOnce("test")       // dbName
                .mockResolvedValueOnce("")           // username
                .mockResolvedValueOnce("")           // password
                .mockResolvedValueOnce("n")          // tls // port fails
    
            const result = await getCredentials("postgresql");
            expect(result.username).toBeUndefined();
            expect(result.password).toBeUndefined();
        
        });
        test("Should return connection string for PostgreSQL", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("2")
                .mockResolvedValueOnce("postgresql://localhost:5432/testDB")
                .mockResolvedValueOnce("testDB")
    
            const result = await getCredentials("postgresql")
            expect(result).toEqual({
                connectionString: "postgresql://localhost:5432/testDB",
                dbName: "testDB"
            })
        });
    
        test("Should throw when PostgreSQL connection string is invalid", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("2")
                .mockResolvedValueOnce("localhost:5432/testDB")
                .mockResolvedValueOnce("testDB")
            
            await expect(getCredentials("postgresql")).rejects
                .toThrow('Invalid connection string. It must start with "postgresql://"')
        });
    
        test("Should throw when PostgreSQL connection string is empty", async () => {
            vi.mocked(askQuestion)
                .mockResolvedValueOnce("2")
                .mockResolvedValueOnce("")
                .mockResolvedValueOnce("TestDB")
    
            await expect(getCredentials("postgresql")).rejects.toThrow("Connection string cannot be empty.")
        });
    });


});    
