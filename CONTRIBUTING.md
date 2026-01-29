# 🤝 Contributing to U-OS

Thank you for your interest in contributing to the **University Operating System (U-OS)**! We welcome contributions from developers, designers, and testers.

---

## 🛠 Project Architecture

This project is a **Monorepo** managed by NPM Workspaces.

* **`apps/backend`**: NestJS (Node.js) API.
* **`apps/mobile`**: React Native (Expo) Application.
* **`packages/database`**: Prisma Schema & Seeding Logic.
* **`packages/types`**: Shared TypeScript definitions.

---

## 🚀 Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/U_OS.git
   cd U_OS
   ```

3. **Setup** the environment (Windows):

   ```bash
   .\setup.bat
   ```

   *(This script installs dependencies, sets up the database, and seeds initial data.)*

---

## 💻 Development Workflow

### 1. Create a Branch

Always create a new branch for your feature or fix.

```bash
git checkout -b feature/amazing-new-feature
# or
git checkout -b fix/login-bug
```

### 2. Make Changes

* **Backend**: Run `npm run start:dev -w apps/backend`
* **Mobile**: Run `npm run start -w apps/mobile`
* **Database**: If you change the `schema.prisma`, run `npm run migrate:dev -w packages/database`.

### 3. Commit Guidelines

We follow conventional commits:

* `feat: add course registration`
* `fix: resolve login 401 error`
* `docs: update readme`
* `style: improve dashboard ui`

### 4. Push & Pull Request

Push your branch to your fork and open a Pull Request (PR) against the `main` branch of the original repository.

---

## 🧪 Testing

Before submitting a PR, please ensure:

* The app compiles without errors.
* You have verified your changes using the [Test Credentials](./TEST_CREDENTIALS.md).
* New features include relevant tests (if applicable).

---

## 📝 License

This project is proprietary. Please check with the repository owner for licensing details.
