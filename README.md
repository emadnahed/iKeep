# iKeep

iKeep is a full-stack MERN application that allows users to create, read, update, and delete notes.

## Project Structure

The project is divided into two main parts:

-   `frontend`: A React application located in the `src` directory.
-   `backend`: A Node.js application located in the `backend` directory.

## Running the application

The application is fully containerized using Docker. To run the application, you need to have Docker and Docker Compose installed.

### Development

To run the application in development mode, use the following command:

```bash
docker-compose up -d
```

The application will be available at `http://localhost:8080`.

The frontend is served on port 3000, and the backend is served on port 5000. The `nginx-lb` service on port 8080 acts as a reverse proxy to route requests to the appropriate service.

### Verification

To verify that the application is running correctly, you can use the `verify.sh` script:

```bash
./verify.sh
```

This script will create a user, log in, add a note, and fetch the notes.

### Stopping the application

To stop the application, use the following command:

```bash
docker-compose down
```