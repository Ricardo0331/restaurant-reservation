# Restaurant Reservation System

[Live Application](https://restaurant-reservation-frontend-16os.onrender.com)

## API Documentation

The backend API supports the following endpoints:

- **Reservations**:
  - `GET /reservations`: List all reservations
  - `POST /reservations`: Create a new reservation
  - `GET /reservations/:reservationId`: Get a specific reservation
  - `PUT /reservations/:reservationId`: Update a specific reservation
  - `PUT /reservations/:reservationId/status`: Update the status of a specific reservation

- **Tables**:
  - `GET /tables`: List all tables
  - `POST /tables`: Create a new table
  - `PUT /tables/:tableId/seat`: Seat a reservation at a table
  - `DELETE /tables/:tableId/seat`: Finish an occupied table


## Application Screenshots

![Dashboard View](https://postimg.cc/QKhXV6Ms)
*Dashboard with daily reservations overview.*

![Reservation Form](https://postimg.cc/Sj3BZ14K)
*Form for creating a new reservation.*

## Summary

The Restaurant Reservation System is designed for fine dining restaurants to manage reservations efficiently. Restaurant personnel use the system to create and manage reservations when customers call. The system provides an intuitive interface for managing reservation details, table assignments, and reservation statuses, ensuring a smooth operational flow within the restaurant.

## Technology Used

- **Frontend**:
  - **HTML**: Structure of web pages.
  - **CSS**: Styling of the user interface, including the layout and design elements.
  - **JavaScript**: Interactive functionalities for dynamic user experiences.
  - **React**: A JavaScript library for building user interfaces, facilitating the development of single-page applications with interactive UIs.
  - **React Router**: Declarative routing for React applications, enabling navigation between different components.

- **Backend**:
  - **Node.js**: JavaScript runtime for building fast and scalable network applications.
  - **Express.js**: Web application framework for Node.js, designed for building web applications and APIs.
  - **PostgreSQL**: Robust and feature-rich open source relational database system.
  
- **Other Tools**:
  - **Knex.js**: SQL query builder for JavaScript, supporting PostgreSQL, MySQL, and SQLite3.
  - **Jest**: JavaScript testing framework for unit and integration tests.
  - **Dotenv**: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.

## Installation Instructions

1. Clone the repository: git clone https://github.com/Ricardo0331/restaurant-reservation.git
2. Navigate into the project directory: cd restaurant-reservation
3. Install backend dependencies: cd back-end *** npm install
4. Install frontend dependencies: cd ../front-end *** npm install
5. Set up your `.env` files in both the `back-end` and `front-end` directories.
6. Start the application: npm run start:dev

Your application should now be running on `localhost:3000` (frontend) and `localhost:5001` (backend).




