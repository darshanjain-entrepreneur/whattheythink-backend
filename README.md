<div align="center">

# 💭 WHATTHEYTHINK
### Anonymous Messaging for Groups

[![Manifest V3](https://img.shields.io/badge/Extension-Manifest%20V3-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Server-Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br />

**WHATTHEYTHINK** is a sleek, modern Chrome Extension that allows friend groups to share their honest thoughts anonymously. 
Create a safe space for open feedback or just have fun with your friends!

[Feature Highlights](#-features) • [Installation](#-installation-guide) • [Usage](#-how-to-use) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔒 **Total Anonymity** | Send messages without revealing your identity. Only the recipient sees the message content. |
| 👥 **Group System** | Create private groups or join existing ones using unique invitation codes. |
| 👑 **Admin Controls** | Group creators have powers to manage their community: delete groups, remove members, etc. |
| 🛡️ **Secure Auth** | Robust JWT-based authentication ensures your account and groups are private. |
| 🎨 **Modern UI** | A beautiful, dark-themed interface built with detailed animations and responsive interactions. |

---

## 🚀 Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Google Chrome](https://www.google.com/chrome/) browser
- A [MongoDB](https://www.mongodb.com/atlas/database) connection string

### 1. Backend Setup
The backend handles authentication and message routing.

1.  **Clone the repository** and navigate to the backend folder:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the `backend` directory with the following:
    ```env
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_key
    ```

4.  **Start the Server**:
    ```bash
    npm start
    ```
    *The server runs at `http://localhost:3000` by default.*

### 2. Extension Setup
Load the extension into your Chrome browser.

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** in the top right corner.
3.  Click **Load unpacked**.
4.  Select the **root folder** of this project (where `manifest.json` is located).
5.  The **WHATTHEYTHINK** icon 💭 should appear in your toolbar!

---

## 📖 How to Use

1.  **Register**: Click the extension icon and create an account with a unique username and password.
2.  **Join/Create**:
    *   **Create**: Go to the **Groups** tab and create a new group. Copy the invite code!
    *   **Join**: Enter an invite code shared by a friend to join a group.
3.  **Send**: Navigate to the **Send** tab, pick a group and a member, and type your message.
4.  **Read**: Check your **Inbox** to see what people think!

---

## 🛠 Tech Stack

### Extension (Frontend)
*   **Core**: HTML5, CSS3, Vanilla JavaScript
*   **Platform**: Chrome Extensions Manifest V3
*   **Styling**: Custom CSS with Glassmorphism effects

### Server (Backend)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Auth**: JWT (JSON Web Tokens) & Bcrypt

---

## 👥 Contributors

Founded By - **DARSHAN JAIN**

---

<div align="center">

Made with ❤️ for open communication.

</div>
