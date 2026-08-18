# Contributing to Fleet Management System

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- **Backend**: Node.js 20+, PostgreSQL 15+
- **Frontend**: Node.js 20+
- **Mobile**: Flutter 3 SDK, Android Studio

### Development Setup

1. Clone the repository
2. Copy `Backend/.env.example` to `Backend/.env` and configure your database credentials
3. Install backend dependencies: `cd Backend && npm install`
4. Run migrations: `npm run migrate`
5. Seed the database: `npm run seed`
6. Start the backend: `npm run start:dev`

For the frontend:
```bash
cd frontend
npm install
npm run dev
```

## Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests as needed
5. Ensure all checks pass
6. Commit with a clear message describing your changes
7. Push to your fork and open a Pull Request

## Code Style

- Follow the existing code conventions in each project
- Use TypeScript strict mode for backend and frontend
- Write meaningful commit messages
- Keep changes focused — one feature or fix per PR

## Pull Request Guidelines

- Provide a clear description of what the PR does
- Reference any related issues
- Include screenshots for UI changes
- Ensure the build succeeds before submitting

## Reporting Issues

- Use the GitHub Issues tracker
- Include steps to reproduce the issue
- Include your environment details (OS, Node version, etc.)

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
