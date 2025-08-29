# MCP Sumo Logic

A Model Context Protocol (MCP) server that integrates with Sumo Logic's API to perform log searches.

## Features

- Search Sumo Logic logs using custom queries
- Configurable time ranges for searches
- Error handling and detailed logging
- Docker support for easy deployment

## Getting Started with Docker

This is the recommended way to run the server.

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd mcp-sumologic
    ```

2.  **Configure Environment Variables:**

    Create a `.env` file in the project root and add your Sumo Logic credentials:

    ```env
    SUMO_ENDPOINT=https://api.us2.sumologic.com/api/v1
    SUMO_ACCESS_ID=your_access_id
    SUMO_ACCESS_KEY=your_access_key
    ```

    The `docker-compose.yml` file is configured to automatically load this file.

3.  **Build and Run the Container:**
    ```bash
    docker-compose up --build
    ```
    The server will start, and you can see the logs in your terminal.

## Usage

The server exposes a `search-sumologic` tool that accepts the following parameters:

- `query` (required): The Sumo Logic search query.
- `from` (optional): Start time in ISO 8601 format.
- `to` (optional): End time in ISO 8601 format.

Example query:

```typescript
const query = '_index=app_pro_fiat_cont | json auto | fields log_identifier';
const results = await search(sumoClient, query, {
  from: '2024-02-23T00:00:00Z',
  to: '2024-02-24T00:00:00Z',
});
```

## Local Development

If you prefer to run the server locally without Docker:

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Set Environment Variables:**
    Export the `SUMO_ENDPOINT`, `SUMO_ACCESS_ID`, and `SUMO_ACCESS_KEY` environment variables in your shell.

3.  **Run in Development Mode:**

    ```bash
    npm run dev
    ```

4.  **Run Tests:**
    ```bash
    npm test
    ```
