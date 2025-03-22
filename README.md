# Data Pipeline Service

A flexible ETL (Extract, Transform, Load) service built with Node.js and TypeScript that can be invoked from a scheduler.

## Features

- RESTful API endpoint for triggering pipeline executions
- Configurable data sources and destinations
- Custom transformation support
- Logging with Winston
- TypeScript for type safety
- Express.js for API handling

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Start the service:
```bash
npm start
```

For development with hot-reload:
```bash
npm run dev
```

## Usage

The service exposes a REST endpoint at `/execute` that accepts POST requests with pipeline configurations.

Example pipeline configuration:
```json
{
  "id": "pipeline-1",
  "name": "Sample Pipeline",
  "source": {
    "type": "file",
    "config": {
      "path": "/path/to/source.json"
    }
  },
  "destination": {
    "type": "database",
    "config": {
      "connectionString": "your-connection-string"
    }
  }
}
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
PORT=3000
```

## Extending

To add new source or destination types, extend the Pipeline class with appropriate implementations for the `extractData` and `loadData` methods.
