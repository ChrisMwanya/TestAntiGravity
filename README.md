# Finance Manager - AdonisJS Application

A comprehensive finance management application built with AdonisJS, SQLite, Edge templating, and TailwindCSS.

## Features

- 💰 **Transaction Management**: Track income and expenses with detailed categorization
- 📊 **Dashboard**: Visual overview of your financial status
- 💵 **Budget Tracking**: Set and monitor budgets by category
- 📈 **Investment Portfolio**: Track investments and calculate returns
- 🏦 **Account Management**: Manage multiple financial accounts
- 🔐 **Authentication**: Secure user registration and login

## Tech Stack

- **Backend**: AdonisJS 6
- **Database**: SQLite (development)
- **Templating**: Edge.js with modern slot-based layouts
- **Styling**: TailwindCSS
- **Authentication**: AdonisJS Auth with session-based authentication

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate app key
node ace generate:key

# Run migrations
node ace migration:run

# Seed categories
node ace db:seed

# Start development server
npm run dev
```

## Project Structure

```
├── app/
│   ├── controllers/     # HTTP controllers
│   ├── models/          # Lucid ORM models
│   └── middleware/      # Custom middleware
├── database/
│   ├── migrations/      # Database migrations
│   └── seeders/         # Database seeders
├── resources/
│   └── views/
│       ├── components/
│       │   └── layout/  # Layout components (app, auth)
│       └── pages/       # Page views
├── start/
│   ├── routes.ts        # Application routes
│   └── kernel.ts        # Middleware configuration
└── config/              # Configuration files
```

## Modern Edge.js Layouts

This project uses the modern Edge.js component-based layout system with slots:

- `@layout.app` - Main layout with navigation for authenticated pages
- `@layout.auth` - Minimal layout for login/register pages

## Development

```bash
# Run development server
npm run dev

# Run migrations
node ace migration:run

# Rollback migrations
node ace migration:rollback

# Seed database
node ace db:seed
```

## License

MIT
