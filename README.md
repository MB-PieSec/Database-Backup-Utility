# 📦 Database Backup Utility

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)
[![Issues](https://img.shields.io/github/issues/MB-PieSec/Database-Backup-Utility?style=flat-square)](https://github.com/MB-PieSec/Database-Backup-Utility/issues)


A professional Node.js CLI tool for backing up MongoDB, MySQL, and PostgreSQL databases to JSON files.  
Automate your database exports for migration, archiving, or disaster recovery. 🚀

---

## ✨ Features

- 🔒 Secure, interactive CLI for credentials
- 🗄️ Supports MongoDB, MySQL, PostgreSQL
- 📁 Validates and creates output directories
- 📦 Exports each table/collection as JSON
- 🖥️ Color-coded, user-friendly terminal output

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
npm start
```

Follow the prompts to:

1. Select your database type
2. Enter connection credentials
3. Confirm backup
4. Specify output directory

---

## 🗃️ Supported Databases

- MongoDB
- MySQL
- PostgreSQL

---

## 📂 Output

- Each table/collection is saved as a `.json` file in your chosen directory.
- For PostgreSQL, a single JSON file containing all tables is created.

---

## 🧪 Testing

Run unit tests with:

```bash
npm test
```

---

## 📄 Project Structure

```
src/
  cli/                # CLI entry point
  controllers/        # Database-specific controllers
  interfaces/         # Backup service interface
  services/           # Backup service implementations
  utils/              # Helper functions
  tests/              # Unit tests
```

---

## 🤝 Contributing

Pull requests are welcome!  
Please open issues for bugs or feature requests.

---

## 📜 License

This project is licensed under the ISC License.

---

## 💡 Credits

Made with ❤️ by [MB-PieSec](https://github.com/MB-PieSec)

---

## 📬 Contact

For questions, reach out via [GitHub Issues](https://github.com/MB-PieSec/Database-Backup-Utility/issues)
