import { promises as fs } from "fs";
import path from "path";
import { askQuestion } from "./askQuestions.js";

export async function validateOutputPath(outputPath: string): Promise<string> {
    if (!outputPath || outputPath.trim() === "") {
        throw new Error("Output path cannot be empty.");
    }
    const resolvedPath = path.resolve(outputPath.trim());
    try {
        // Check if path exists
        const stats = await fs.stat(resolvedPath).catch(() => null);
        if (!stats) {
            // Directory does not exist → ask user
            const answer = await askQuestion(`Directory "${resolvedPath}" does not exist. Would you like to create it? [y/n]: `);

            if (answer.trim().toLowerCase() !== "y") {
                throw new Error("User declined to create the output directory.");
            }
            await fs.mkdir(resolvedPath, { recursive: true });
            console.log(`Directory created: ${resolvedPath}`);
        }
        else if (!stats.isDirectory()) {
            throw new Error(`Path "${resolvedPath}" exists but is not a directory.`);
        }
        else {
            console.log(`Using existing directory: ${resolvedPath}`);
        }
        // Verify we have write permission
        await fs.access(resolvedPath, fs.constants.W_OK);
        return resolvedPath;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Failed to validate output path: ${error.message}`);
            throw error;                    // Re-throw so caller can handle it
        }
        throw new Error("Unknown error while validating output path.");
    }
}