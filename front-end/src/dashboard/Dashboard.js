import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  listReservations,
  listTables,
  finishTable,
  updateReservationStatus,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { today } from "../utils/date-time";
import "./Dashboard.css"

function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const history = useHistory();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const date = query.get("date") || today();

  useEffect(() => {
    const abortController = new AbortController();
    setError(null);

    async function fetchData() {
      try {
        const loadedReservations = await listReservations(
          { date },
          abortController.signal
        );

        // Filter out reservations with a status of "canceled"
        const activeReservations = loadedReservations.filter(
          (reservation) => reservation.status !== "cancelled"
        );

        setReservations(
          activeReservations.sort((a, b) =>
            a.reservation_time.localeCompare(b.reservation_time)
          )
        );
        const loadedTables = await listTables(abortController.signal);
        setTables(loadedTables);
      } catch (error) {
        setError(error);
      }
    }

    fetchData();

    return () => abortController.abort();
  }, [date]);

  const navigateTo = (newDate) => {
    history.push(`/dashboard?date=${newDate}`);
  };

  const handleNextDay = () => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + 1);
    navigateTo(currentDate.toISOString().slice(0, 10));
  };

  const handlePreviousDay = () => {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() - 1);
    navigateTo(currentDate.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    navigateTo(today());
  };

  const finishHandler = async (tableId) => {
    const confirmation = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    if (confirmation) {
      try {
        await finishTable(tableId);
        const updatedReservations = await listReservations(
          { date },
          new AbortController().signal
        );
        const updatedTables = await listTables(); // Re-fetch tables to ensure we have the latest state
        setTables(updatedTables); // Update state with the latest tables
        setReservations(updatedReservations);
      } catch (error) {
        console.error(error);
        setError(error); // Properly set error state if there's an issue
      }
    }
  };

  const cancelReservationHandler = async (reservationId) => {
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      try {
        await updateReservationStatus(reservationId, "cancelled");

        // Filter out the canceled reservation from the state
        setReservations((currentReservations) =>
          currentReservations.filter(
            (reservation) => reservation.reservation_id !== reservationId
          )
        );
      } catch (error) {
        console.error(error);
        setError(error);
      }
    }
  };

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <ErrorAlert error={error} />
      {reservations.map((reservation, index) => (
        <div key={index} className="reservation-card">
          <p>First Name: {reservation.first_name}</p>
          <p>Last Name: {reservation.last_name}</p>
          <p>Mobile Number: {reservation.mobile_number}</p>
          <p>Date of Reservation: {reservation.reservation_date}</p>
          <p>Time of Reservation: {reservation.reservation_time}</p>
          <p>Number of People: {reservation.people}</p>
          <p>
            Status:{" "}
            <span data-reservation-id-status={reservation.reservation_id}>
              {reservation.status}
            </span>
          </p>
          {reservation.status === "booked" && (
            <>
              <a
                href={`/reservations/${reservation.reservation_id}/seat`}
                className="btn btn-primary"
              >
                Seat
              </a>
              <a
                href={`/reservations/${reservation.reservation_id}/edit`}
                className="btn btn-secondary"
              >
                Edit
              </a>
              <button
                data-reservation-id-cancel={reservation.reservation_id}
                className="btn btn-danger"
                onClick={() => cancelReservationHandler(reservation.reservation_id)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      ))}
      <h2>Tables</h2>
      {tables.map((table, index) => (
        <div key={index} className="table-card">
          <p>Table Name: {table.table_name}</p>
          <p>Capacity: {table.capacity}</p>
          <p data-table-id-status={table.table_id}>
            {table.reservation_id ? "Occupied" : "Free"}
          </p>
          {table.reservation_id && (
            <button
              data-table-id-finish={table.table_id}
              className="btn btn-danger"
              onClick={() => finishHandler(table.table_id)}
            >
              Finish
            </button>
          )}
        </div>
      ))}
      <div className="date-navigation">
        <button onClick={handlePreviousDay} className="btn btn-secondary">
          Previous
        </button>
        <button onClick={handleToday} className="btn btn-primary">
          Today
        </button>
        <button onClick={handleNextDay} className="btn btn-secondary">
          Next
        </button>
      </div>
    </main>
  );
  }

export default Dashboard;