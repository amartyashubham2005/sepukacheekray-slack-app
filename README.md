# sepukacheekray-slack-app

## Overview

This document explains how to set up, build, and run the Slack app backend powered by Express framework on your local or production environment. Follow these steps to ensure proper configuration and execution of the application.

---

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (10 or higher)

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

---

## Environment Setup

1. **Create a `.env` file:**

   - The app uses environment variables stored in a `.env` file for configuration.
   - A template file named `.env.template` is already included in the repository. Copy this file to create your `.env` file:
     ```bash
     cp .env.template .env
     ```

   - Open the newly created `.env` file and fill in the missing values as needed:
     ```env
     NODE_ENV=development
     PORT=3000
     SLACK_CLIENT_ID=your-slack-client-id
     SLACK_CLIENT_SECRET=your-slack-client-secret
     SLACK_SIGNING_SECRET=your-slack-signing-secret
     SLACK_BOT_TOKEN=your-slack-bot-token
     DOCSBOT_WS_URL=your-docsbot-ws-url
     ```

   - **Note:** The `.env` file is ignored by Git to ensure sensitive information is not committed to the repository.

---

## Running the Application

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Start the app:**
   ```bash
   npm run start
   ```

3. The server will run on the port specified in the `.env` file (`PORT`). If `PORT` is set to `3000`, the app will be available at:
   ```
   http://localhost:3000
   ```

---

## Health Check Endpoint

To verify the application is running correctly, you can make a GET request to the `/checks` endpoint.

1. Open your browser or use a tool like `curl` or Postman to send a GET request:
   ```
   http://localhost:3000/checks
   ```

2. If the application is running fine, the response will be:
   - **HTTP Status Code:** `200`
   - **Text Response:** `Backend is up and running!!`

---

## Available npm Scripts

- **`npm install`**: Installs the project dependencies.
- **`npm run build`**: Builds the application for production.
- **`npm run start`**: Starts the application in production mode.

---

## Notes

- Ensure that all required environment variables are properly filled in the `.env` file before running the app.
- For development or debugging purposes, you can use tools like `nodemon` to automatically reload the server when changes are made.