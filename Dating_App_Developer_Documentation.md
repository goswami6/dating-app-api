# Dating Application - Backend API 🚀

**Version:** 1.0  
**Stack:** Node.js, Express.js, MySQL, Sequelize ORM  

A robust and scalable RESTful API built to power a modern dating application. This backend handles user authentication, profile management, a matching engine, and real-time messaging.

---

## 📑 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Project Structure](#project-structure)
7. [API Endpoints](#api-endpoints)
8. [Deployment](#deployment)

---

## 🏗 Architecture Overview
This API follows a layered Model-View-Controller (MVC) architecture, utilizing the Repository and Service patterns to isolate business logic from route handling. Data is persisted in a relational MySQL database using the Sequelize ORM.

## 💻 Tech Stack
* **Runtime:** Node.js (v18+)
* **Framework:** Express.js
* **Database:** MySQL 8.0+
* **ORM:** Sequelize
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Security:** Helmet, CORS, Express Rate Limit

---

## 🛠 Prerequisites
Ensure you have the following installed on your local development machine:
* [Node.js](https://nodejs.org/) (v18 LTS or higher)
* [MySQL Server](https://dev.mysql.com/downloads/) (v8.0+)
* [Git](https://git-scm.com/)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd dating-app-backend