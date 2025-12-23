# Email Service Worklune

A TypeScript-based email service application with server and message queue integration.

## Project Structure

```
src/
├── OtpService.ts          # Main email service entry point
├── server.ts                # Express/HTTP server setup
├── service/
│   ├── email.service.ts     # Email sending logic
│   └── mq.service.ts        # Message queue service
└── utils/
    ├── email.ejs            # Email template
    └── sleep.ts             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Configuration

Update configuration files as needed:
- `tsconfig.json` - TypeScript compiler options
- `package.json` - Dependencies and scripts

## Features

- Email sending service
- Message queue integration
- EJS email templates
- TypeScript support
 
