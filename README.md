# Equipment Monitor Backend

Node.js/TypeScript backend for industrial equipment monitoring.

## Tech Stack

Node.js · TypeScript · Express · PostgreSQL(Sequelize) · MongoDB(Mongoose) · RabbitMQ · Docker

## Architecture

- **PostgreSQL**: Equipment metadata and maintenance schedules (relational data)
- **MongoDB**: Time-series sensor readings with compound index for query performance
- **RabbitMQ**: Async message queue between sensor and alert service

## Run Locally

### Start all databases

docker-compose up -d

### Install dependencies and start server

npm install
npm run dev

## API Endpoints

- GET/POST /equipment — Equipment management
- PATCH /equipment/:id/status — Update equipment status
- GET /sensor/:id/latest — Latest sensor reading
- GET /sensor/:id/history — Historical sensor data
- GET /sensor/:id/stats — Aggregated statistics
- GET /sensor/alerts — Recent alerts
- GET /sensor/risk-assessment — Predictive risk scores
- GET/POST /maintenance — Maintenance schedules
- PATCH /maintenance/:id/status — Update maintenance status
