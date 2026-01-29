# 🎓 U-OS – University Operating System

**A Next-Generation Campus Management & Navigation Platform.**

![Status](https://img.shields.io/badge/Status-Prototype-blue) ![License](https://img.shields.io/badge/License-Proprietary-red) ![Tech](https://img.shields.io/badge/Stack-NestJS%20%7C%20React%20Native%20%7C%20PostgreSQL-green)

---

## 📖 Overview

**U-OS** is a unified digital platform designed to manage the complex operations of a multi-campus university. It bridges the gap between physical infrastructure and digital administration, offering:

* **📍 Indoor/Outdoor Navigation**: Real-time campus mapping and pathfinding.
* **🎓 Academic Management**: Course registration, timetable scheduling, and academic records.
* **💰 Financial Access Control**: "No Fee, No Access" automated gatekeeping for physical facilities.
* **👥 Role-Based Portals**: Dedicated interfaces for Students, Lecturers, Admins, Cashiers, and Guests.

---

## 🚀 Quick Start (Windows)

Prerequisites: **Docker Desktop**, **Node.js (v18+)**, and **Git**.

1. **Clone & Enter**:

   ```bash
   git clone <repository_url>
   cd U_OS
   ```

2. **One-Click Setup**:
   Double-click **`setup.bat`** in the root folder.
   * *What this does*: Installs dependencies 📦, Starts Database (Docker) 🐳, Seeds Data 🌱, Launches Backend & Mobile App 🚀.

3. **Launch Mobile App**:
   * Press `w` in the Metro Bundler window to open in **Web Browser**.
   * Or scan the QR code with **Expo Go** on your phone (ensure you are on the same Wi-Fi).

---

## 🧪 Credentials & Testing

We have pre-configured users for every role.
👉 **[View Full Test Credentials](./TEST_CREDENTIALS.md)**

* **Student**: `std_0@university.edu` / `password`
* **Admin**: `admin@university.edu` / `password`
* **Guest**: Use "Continue as Guest" button.

---

## 🏗 Tech Stack

This project is a **Monorepo** managed by NPM Workspaces.

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Mobile App** | **React Native** (Expo SDK 54) | Cross-platform mobile interface. |
| **Backend API** | **NestJS** (Node.js) | Robust, scalable REST API. |
| **Database** | **PostgreSQL** + **PostGIS** | Relational data with geospatial capabilities. |
| **ORM** | **Prisma** | Type-safe database client. |
| **Language** | **TypeScript** | Strict typing across the entire stack. |

---

## 🤝 Contributing

We welcome contributions! Please see our guide below for details on how to set up your dev environment and submit Pull Requests.

👉 **[Read Contribution Guidelines](./CONTRIBUTING.md)**

---

## ⚠️ Troubleshooting

**1. "Network Request Failed" on Mobile?**

* The app tries to auto-detect your computer's IP. Ensure your phone and PC are on the **same Wi-Fi**.
* Check the API URL logs in the Metro Bundler console.

**2. Database Errors?**

* Ensure Docker is running.
* Run `setup.bat --full` to force a database reset and re-seed.

**3. "Port already in use"?**

* Close other running node processes or Docker containers utilizing ports `3000` (API) or `5432` (DB).

---

*Verified & Maintained by the U-OS Development Team.*
