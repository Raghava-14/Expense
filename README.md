```
# Expense Tracker Installation Guide

This guide provides detailed steps to set up the Expense Tracker application locally.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js
- npm (Node Package Manager)
- PostgreSQL

## 1. Clone the Repository

Clone the project repository to your local machine using the following command:

```bash
git clone <repository-url>
```

## 2. Install Dependencies

Navigate to both the `client` and `server` directories to install the required dependencies.

### Server Dependencies

```bash
cd server
npm install
```

### Client Dependencies

```bash
cd ../client
npm install
```

## 3. Database Setup

Install PostgreSQL and create a database named `my_expense_tracker`. Use the following environment variables to configure your database connection in your `.env` file located in the `server` directory:

```
DB_HOST=localhost
DB_USER=raghav
DB_PASSWORD=your_password
DB_DATABASE=my_expense_tracker
JWT_SECRET=your_secret_key_here
```

### Running Migrations

Navigate back to the server directory to run migrations:

```bash
npx sequelize db:migrate
```

### Running Seeders

Populate your database with initial data using the seeder files:

```bash
npx sequelize db:seed:all
```

## 4. Running the Application

### Start the Backend Server

In the server directory, start the Node.js server:

```bash
node app.js
```

### Start the Frontend Application

In a new terminal window, navigate to the client directory and start the React application:

```bash
npm start
```

This should open `http://localhost:3001` in your default web browser automatically. If not, manually open this URL in your browser.

## 5. Verifying the Installation

Ensure that the application loads correctly and allows you to register a new user, log in, and interact with the application functionalities such as adding and tracking expenses.

## 6. Troubleshooting

If you encounter any issues:
- Verify all dependencies are installed without errors.
- Ensure the PostgreSQL database is operational and the `.env` file is configured correctly.
- Confirm that the server and client are running on their respective ports.
- Check that all initial data from the seeders loads correctly.

## 7. Additional Resources

For further information on Node.js and React, you can visit:
- [Node.js Official Documentation](https://nodejs.org/en/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)

## 8. Contact Information

For additional support, contact the project maintainers at [your-email@example.com].
```
