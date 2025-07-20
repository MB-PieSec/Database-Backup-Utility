import { describe, test, expect, vi, beforeEach } from "vitest";
import getCredentials from "../utils/getCredentials.js";

vi.mock("../utils/askQuestion.js", () => ({
    default: vi.fn()
}));

import askQuestion from "../utils/askQuestion.js";

describe("getCredentials", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    test("Should return credentials when valid input is given", async () => {
        askQuestion
            .mockResolvedValueOnce("localhost") // hostname
            .mockResolvedValueOnce("27017") // port
            .mockResolvedValueOnce("testDB") //dbName
            .mockResolvedValueOnce("admin") //username
            .mockResolvedValueOnce("pass123") //password


        const result = await getCredentials();

        expect(result).toEqual({
            hostname: "localhost",
            port: "27017",
            dbName: "testDB",
            username: "admin",
            password: "pass123"
    });
    });

    test("Should throw an error when hostname is missing", async () => {
        askQuestion
            .mockResolvedValueOnce("")  //hostname

        await expect(getCredentials()).resolves.toBeUndefined()
    });

    test("Should throw an error when port in missing", async () => {
        askQuestion
            .mockResolvedValueOnce("hostname") //hostname
            .mockResolvedValueOnce("") //port

        await expect(getCredentials()).resolves.toBeUndefined();
    });

    test("Should throw and error when port is out of range", async () => {
        askQuestion
            .mockResolvedValueOnce("hostname") //hostname
            .mockResolvedValueOnce("999999")

        await expect(getCredentials()).resolves.toBeUndefined();
    })


    test("Should handle empty optional fields (password/username)", async () => {
        askQuestion
            .mockResolvedValueOnce("localhost") // hostname
            .mockResolvedValueOnce("27017") // port
            .mockResolvedValueOnce("myDB") //dbName
            .mockResolvedValueOnce("") //username (empty)
            .mockResolvedValueOnce("") //password (empty)

        const result = await getCredentials();

        expect(result).toEqual({
            hostname: "localhost",
            port: "27017",
            dbName: "myDB",
            username: undefined,
            password: undefined
        })
    })

})
