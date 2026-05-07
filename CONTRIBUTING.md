# Contributing to The Nest

First off, thank you for considering contributing to The Nest! We aim to build a robust, secure, and intuitive athletic training documentation system.

## How to Contribute

### 1. Reporting Bugs
- Use the **Bug Report** issue template.
- Provide clear steps to reproduce the issue.
- Include details about your environment (OS, browser, Node version).

### 2. Suggesting Enhancements
- Use the **Feature Request** issue template.
- Clearly describe the problem the feature solves and provide a suggested implementation if possible.

### 3. Pull Requests
1. Fork the repository and create your branch from `main`.
2. Name your branch descriptively (e.g., `feature/voice-to-soap` or `bugfix/athlete-list-crash`).
3. Ensure your code passes all existing tests.
4. Update the documentation (Wiki) if you are changing system architecture or adding major features.
5. Reference the issue your PR fixes in the description (e.g., `Fixes #14`).

## Development Setup
Please refer to our `RUNNING.md` guide in the repository Wiki for instructions on how to set up the project locally.

## Coding Standards
- **Frontend:** Follow React/React Native best practices. Use functional components and hooks.
- **Backend:** Ensure all API endpoints are fully typed using FastAPI and Python type hints.
- **Database:** Ensure any new migrations do not break existing data.
