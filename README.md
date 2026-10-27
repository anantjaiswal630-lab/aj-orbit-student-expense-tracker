# AJ-ORBIT Student Expense Tracker

A responsive, cyberpunk-inspired student finance tracker built with **HTML, CSS, and vanilla JavaScript**. Track pocket money, expenses, savings progress, and spending categories — without paid APIs or a backend.

## Features

- Record money received and expenses
- Set a savings target and view progress
- Summary of balance, received money, spending, and savings rate
- Search and filter transactions
- Spending breakdown by category
- Export transactions as CSV
- Data stored locally in your browser with `localStorage`
- Responsive red/neon dark interface with reduced-motion support
- No frameworks, API keys, database, or build step required

## Run locally

1. Download or clone this repository.
2. Open the folder in VS Code.
3. Open `index.html` in your browser, or use the **Live Server** extension in VS Code.
4. Add a transaction to test the app.

> Data is stored in the browser profile on the device where you use the app. Browser storage can be cleared, and data does not automatically sync between devices. Export CSV backups regularly. Do not store bank credentials or highly sensitive financial information here.

## Project structure

```text
aj-orbit-student-expense-tracker/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    └── (optional logo and screenshots)
```

## Deploy with GitHub Pages

1. Create a public GitHub repository, for example `aj-orbit-student-expense-tracker`.
2. Upload `index.html`, `style.css`, `script.js`, `README.md`, and the optional `assets` folder.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and the `/ (root)` folder, then save.
6. Wait for deployment. GitHub will display the website URL in the Pages settings.

## Privacy notes

This is a local-first learning project, not a bank or financial service. Transactions remain in browser `localStorage`; anyone who can use the same browser profile may be able to view them. GitHub Pages serves the app publicly, but it does not publish the contents of your browser storage. Avoid entering sensitive information on shared devices.

## Future improvements

- Monthly budget limits
- Editable transactions
- Optional category filters and date ranges
- Import a previously exported CSV
- Optional installable PWA support

## Built with

HTML · CSS · JavaScript · Browser localStorage · CSV export

---

**AJ-ORBIT** — Build smart. Spend mindfully.
