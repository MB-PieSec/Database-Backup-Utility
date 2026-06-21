# 📦 Database Backup Utility

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Issues](https://img.shields.io/github/issues/MB-PieSec/Database-Backup-Utility?style=flat-square)](https://github.com/MB-PieSec/Database-Backup-Utility/issues)

A modular Node.js CLI tool for backing up MongoDB, MySQL, and PostgreSQL databases to JSON files.
Automate your database exports for migration, archiving, or disaster recovery. 🚀

---

## ✨ Features

- 🔒 Secure, interactive CLI for credentials
- 🗄️ Supports MongoDB, MySQL, PostgreSQL
- 📁 Validates and creates output directories
- 📦 Exports each table/collection as a separate JSON file
- 🌊 Streaming backups for MongoDB — memory-efficient for large datasets
- 🔌 Adapter pattern architecture — add new databases without touching core logic
- 🧪 Unit tested with Vitest
- 🖥️ Verbose mode toggle for detailed or silent output

---

## 🛠️ Installation

```bash
git clone https://github.com/MB-PieSec/Database-Backup-Utility.git
cd Database-Backup-Utility
npm install
```

---

## 🚀 Usage

```bash
npm run start
```

The CLI will guide you through the following steps:

1. Enable or disable verbose mode
2. Select your database type (MongoDB, MySQL, PostgreSQL)
3. Enter connection details — manual or connection string (MongoDB & PostgreSQL)
4. Confirm backup and specify output directory

---

## 📂 Output

Each collection or table is saved as a separate `.json` file in your chosen directory:

```
backups/
  users.json
  products.json
  orders.json
```

---

## 🏗️ Architecture

The project is built around the `IDatabaseBackupService` interface, which all database adapters implement:

```typescript
interface IDatabaseBackupService {
    connectToDatabase(): Promise<boolean | void>;
    backup(outputPath: string): Promise<void>;
    disconnect(): Promise<void>;
}
```

Adding support for a new database requires only creating a new service class that implements this interface — no changes to the core CLI or controller logic.

### 🌊 MongoDB Streaming

MongoDB backups use Node.js Streams and `pipeline` to handle large collections with minimal memory overhead — documents are serialized and written to disk one at a time rather than loading the entire collection into memory.

---

## 📄 Project Structure

```
src/
  cli/
    index.ts                    — entry point, database selection
  controllers/
    mongoController.ts
    postgreSQLController.ts
    mySQLController.ts
  services/
    mongoBackupService.ts
    postgreSQLBackupService.ts
    mySQLBackupService.ts
  interfaces/
    IDatabaseBackupService.ts
    Credentials.ts
  utils/
    askQuestions.ts
    getCredentials.ts
    validateOutputPath.ts
  __tests__/
    getCredentials.test.ts
    mongoBackupService.test.ts
```

---

## 🧪 Testing

Tests are written with Vitest and cover:

- `getCredentials` — all three database types, manual and connection string paths, validation errors
- `MongoBackupService` — connection success/failure, backup happy path, edge cases

```bash
npm test
```

---

## 🤝 Contributing

Pull requests are welcome!
Please open issues for bugs or feature requests.

---

## 📜 License

This project is licensed under the MIT License.

---

## 💡 Credits

Made with ❤️ by [MB-PieSec](https://github.com/MB-PieSec)

---

## 📬 Contact

For questions, reach out via [GitHub Issues](https://github.com/MB-PieSec/Database-Backup-Utility/issues)
