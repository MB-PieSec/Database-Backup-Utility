import fs from "fs";
import path from "path";
import askQuestion from "./askQuestion.js";
import chalk from "chalk";

async function validateOutputPath(outputPath) {
    try {
        if (!outputPath || outputPath.trim() === "") {
            throw new Error(chalk.red.italic("Output path cannot be empty."));
        }

        const resolvedPath = path.resolve(outputPath);

        if (!fs.existsSync(resolvedPath)) {
            const askCreate = await askQuestion(chalk.whiteBright.bold("Directory does not exist. Would you like to create it? [y/n]:\n input: "));
            if (askCreate.trim().toLowerCase() !== "y") {
                throw new Error(chalk.red.italic("User declined to create directory."));
            }

            fs.mkdirSync(resolvedPath, { recursive: true });
            console.log(chalk.yellow(`Directory created: ${resolvedPath}`));
        }

        fs.accessSync(resolvedPath, fs.constants.W_OK);

        return resolvedPath;
    } catch (error) {
        console.error(chalk.red.bold("Something went wrong in validateOutputPath():", error.message));
    }
}

export default validateOutputPath;