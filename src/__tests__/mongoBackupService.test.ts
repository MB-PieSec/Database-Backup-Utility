import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("mongodb");

vi.mock("fs", () => ({
    createWriteStream: vi.fn(),
    promises: {
        mkdir: vi.fn().mockResolvedValue(undefined)
    }
}));
vi.mock("stream/promises", () => ({
    pipeline: vi.fn().mockResolvedValue(undefined)
}));

import { MongoClient } from "mongodb";
import { MongoBackupService } from "../services/mongoBackupService.js";
import { createWriteStream } from "fs";

describe("MongoBackupService", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("connectToDatabase", () => {
        test("Should return true when connection succeeds", async () => {
            const mockDb = {
                listCollections: vi.fn(),
                collection: vi.fn(),
            };

            const mockClient = {
                connect: vi.fn().mockResolvedValue(undefined),
                db: vi.fn().mockReturnValue(mockDb),
                close: vi.fn(),
            };

            vi.mocked(MongoClient).mockImplementation(() => mockClient as any);

            const service = new MongoBackupService(
                { dbName: "testDB", hostname: "localhost", port: 27017 },
                false
            );
            const result = await service.connectToDatabase();

            expect(result).toBe(true);
        });

        test("Should return false when connection fails", async () => {
            const mockDB = {
                listConnections: vi.fn(),
                collections: vi.fn()
            };

            const mockClient = {
                connect: vi.fn().mockRejectedValue(new Error("connection failed")),
                db: vi.fn().mockReturnValue(mockDB),
                close: vi.fn()
            };

            vi.mocked(MongoClient).mockImplementation(() => mockClient as any);

            const service = new MongoBackupService(
                { dbName: "testDB", hostname: "localhost", port: 27017 },
                false
            );
            
            const result = await service.connectToDatabase();
            expect(result).toBe(false);
        });
        
        test("Should return false when dbName is missing", async () => {
            const mockDb = {
                listCollections: vi.fn(),
                collection: vi.fn(),
            };

            const mockClient = {
                connect: vi.fn().mockResolvedValue(undefined),
                db: vi.fn().mockReturnValue(mockDb),
                close: vi.fn(),
            };

            vi.mocked(MongoClient).mockImplementation(() => mockClient as any);

            const service = new MongoBackupService(
                { dbName: "", hostname: "localhost", port: 27017 },
                false
            );
            const result = await service.connectToDatabase();

            expect(result).toBe(false);
        });
    });

    describe("backup", () => {
        test("Should throw when called without connecting first", async () => {
            const service = new MongoBackupService(
                { dbName: "testDB", hostname: "localhost", port: 27017 },
                false
            );
            await expect(service.backup("/some/path")).rejects
                .toThrow("Database connection not established. Call connectToDatabase() first.")
        });

        test("Should return early when database has no collections", async () => {
            const mockDb = {
                listCollections: vi.fn().mockReturnValue({
                    toArray: vi.fn().mockResolvedValue([])
                }),
                collection: vi.fn()
            };
            
            const mockClient = {
                connect: vi.fn().mockResolvedValue(undefined),
                db: vi.fn().mockReturnValue(mockDb),
                close: vi.fn(),
            };

            vi.mocked(MongoClient).mockImplementation(() => mockClient as any);
            const service = new MongoBackupService(
                { dbName: "testDB", hostname: "localhost", port: 27017 },
                false
            );

            await service.connectToDatabase();
            await service.backup("/some/path");
            
            expect(mockDb.listCollections).toHaveBeenCalled();
        });

        test("Should backup successfully when collections exist", async () => {
            const mockWriteStream = {
                write: vi.fn(),
                end: vi.fn(),
                on: vi.fn().mockImplementation((event, callback) => {
                    if (event === "finish") callback(); // immediately trigger finish
                }),
            };

            vi.mocked(createWriteStream).mockReturnValue(mockWriteStream as any);
            const mockCursor = {
                stream: vi.fn().mockReturnValue({
                    pipe: vi.fn(),
                    on: vi.fn(),
                    [Symbol.asyncIterator]: vi.fn()
                })
            };

            const mockDb = {
                listCollections: vi.fn().mockReturnValue({
                    toArray: vi.fn().mockResolvedValue([{ name: "users" }])
                }),
                collection: vi.fn().mockReturnValue({
                    find: vi.fn().mockReturnValue(mockCursor)
                }),
            };

            const mockClient = {
                connect: vi.fn().mockResolvedValue(undefined),
                db: vi.fn().mockReturnValue(mockDb),
                close: vi.fn(),
            };

            vi.mocked(MongoClient).mockImplementation(() => mockClient as any);

            const service = new MongoBackupService(
                { dbName: "testDB", hostname: "localhost", port: 27017 },
                false
            );

            await service.connectToDatabase();
            await service.backup("/some/path");

            expect(mockDb.collection).toHaveBeenCalledWith("users");
        });
    });
});