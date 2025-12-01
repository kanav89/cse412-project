# Personal Finance Tracker

A simple student-built personal finance tracker that lets you create a user, log in, and manage accounts, transactions, budgets, and categories. The UI shows dashboard totals so you can quickly see income, expenses, and budget status in one place.

## Tech stack
- Python + Flask backend
- PostgreSQL database
- HTML/CSS/JavaScript frontend served by Flask

## Requirements
- Python 3.10+
- pip + venv
- PostgreSQL running locally

## Setup
1. **Clone the repo**
   ```bash
   git clone <your fork>
   cd cse412-project-main
   ```
2. **Create virtual environment & install deps**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. **Database**
   ```bash
   createdb project
   psql -d project -f schemaswithdata.sql
   ```
   > If `schemaswithdata.sql` fails on very old Postgres with `transaction_timeout`, delete that line from the file and rerun.
4. **Environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in values only if you want to override the defaults.
5. **Run the app**
   ```bash
   python3 app.py
   ```
   Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your browser (the API expects this origin).

## Usage
- Create a user first, then log in with the same credentials.
- Use Refresh to pull the latest accounts, transactions, budgets, and categories.
- Stay on port 5000 in the browser. Running the HTML from tools like Live Server (port 5500) will cause 405 errors because API calls are relative.

## Troubleshooting
- **Database does not exist**: run `createdb project` or update `DB_NAME` in `.env`.
- **Login/Create user returns 405**: make sure you loaded the page from `http://127.0.0.1:5000/`.
- **No categories**: rerun `psql -d project -f schemaswithdata.sql` to seed the data.
