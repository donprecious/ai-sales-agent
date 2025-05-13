# Full Stack Sales Rep AI Application

This project is a full-stack application designed to simulate and assist sales representatives. It features a NestJS backend, a React (Vite) frontend, and MongoDB for data storage. The entire application is containerized using Docker for ease of development and deployment.

## Project Structure

-   `backend/`: Contains the NestJS backend application.
-   `frontend/`: Contains the React (Vite) frontend application.
-   `docker-compose.yml`: Defines the services, networks, and volumes for Docker Compose.
-   `backend/Dockerfile`: Docker build instructions for the backend service.
-   `frontend/Dockerfile`: Docker build instructions for the frontend service.

## Prerequisites

Before you begin, ensure you have the following installed:

-   [Docker](https://www.docker.com/get-started)
-   [Docker Compose](https://docs.docker.com/compose/install/) (Usually included with Docker Desktop)
-   A code editor (e.g., [VS Code](https://code.visualstudio.com/))
-   Git (for cloning, if applicable)

## Setup Guide

1.  **Clone the Repository (if you haven't already):**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Create Environment Files:**

    *   **Backend:**
        Navigate to the `backend` directory. If an `.env.example` file exists, copy it to `.env`. Otherwise, create a new file named `.env` in the `backend` directory (`./backend/.env`).
        Populate it with necessary environment variables, such as:
        ```env
        PORT=3000
        DATABASE_URL="mongodb://mongo:27017/sales_rep_db" # Example, adjust as needed
        # Add other backend-specific variables like API keys, JWT secrets, etc.
        ABLY_API_KEY=your_ably_api_key # If used by backend
        OPENAI_API_KEY=your_openai_api_key # If used by backend
        ```

    *   **Frontend:**
        Navigate to the `frontend` directory. If an `.env.example` file exists, copy it to `.env`. Otherwise, create a new file named `.env` in the `frontend` directory (`./frontend/.env`).
        Populate it with necessary environment variables. Crucially, set the backend API URL:
        ```env
        VITE_BACKEND_API_URL=http://localhost:3000
        VITE_ABLY_API_KEY=your_ably_api_key # Ensure this matches the key Ably expects
        # Add other frontend-specific variables
        ```
        **Note:** `VITE_BACKEND_API_URL` should point to the address where the backend will be accessible from your host machine's browser (which is `http://localhost:3000` if you use the default port mapping in `docker-compose.yml`).

3.  **Build and Run with Docker Compose:**

    From the project root directory (where `docker-compose.yml` is located), run the following command:
    ```bash
    docker-compose up --build
    ```
    *   The `--build` flag ensures that Docker images are built (or rebuilt if changes are detected in Dockerfiles or application code).
    *   This command will start the backend, frontend, and MongoDB services.

4.  **Accessing the Application:**

    *   **Frontend:** Open your web browser and navigate to `http://localhost:5173` (or the port you mapped in `docker-compose.yml`).
    *   **Backend API:** The backend API will be available at `http://localhost:3000` (or the port you mapped). You can test endpoints using tools like Postman or curl.
    *   **MongoDB:** The MongoDB instance is accessible on port `27017` from your host machine if you need to connect directly using a MongoDB client (e.g., MongoDB Compass). The connection string from within the Docker network (e.g., for the backend service) would be `mongodb://mongo:27017`.

## Development

-   **Live Reloading:** Both the backend (NestJS with `npm run start:dev`) and frontend (Vite dev server) are configured for live reloading. Changes made to the source code in `./backend` or `./frontend` will automatically trigger a rebuild/reload within their respective containers.
-   **Viewing Logs:** You can view the logs for all services by running `docker-compose logs -f` or for a specific service (e.g., backend) with `docker-compose logs -f backend`.
-   **Stopping Services:** To stop the running services, press `Ctrl+C` in the terminal where `docker-compose up` is running. To stop and remove containers, run `docker-compose down`. If you want to remove volumes as well (e.g., the `mongo-data` volume), use `docker-compose down -v`.

## Services Overview

*   **`backend`**: The NestJS application server.
    *   Build context: `./backend`
    *   Exposed port (host): `3000`
    *   Development command: `npm run start:dev`
*   **`frontend`**: The React (Vite) development server.
    *   Build context: `./frontend`
    *   Exposed port (host): `5173`
    *   Development command: `npm run dev -- --host`
*   **`mongo`**: The MongoDB database instance.
    *   Image: `mongo:latest`
    *   Exposed port (host): `27017`
    *   Data persistence: Named volume `mongo-data`

## Troubleshooting

*   **Port Conflicts:** If you encounter errors about ports already being in use, check if other applications are using ports `3000`, `5173`, or `27017`. You can either stop those applications or change the host port mappings in the `docker-compose.yml` file (e.g., change `"3000:3000"` to `"3001:3000"`).
*   **`.env` files not found/incorrect:** Double-check that your `.env` files are in the correct locations (`./backend/.env` and `./frontend/.env`) and that the variables are correctly named and formatted.
*   **Docker daemon not running:** Ensure your Docker Desktop application is running.