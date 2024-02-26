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
    <main className="container">
      <h1 className="my-3">Dashboard</h1>
      <ErrorAlert error={error} />
      <div className="row">
        <div className="col">
          <h4>Reservations for {date}</h4>
          {reservations.map((reservation, index) => (
            <div key={index} className="card my-2">
              <div className="card-body">
                <h5 className="card-title">{reservation.first_name} {reservation.last_name}</h5>
                <p className="card-text">Mobile: {reservation.mobile_number}</p>
                <p className="card-text">Date: {reservation.reservation_date}</p>
                <p className="card-text">Time: {reservation.reservation_time}</p>
                <p className="card-text">Party Size: {reservation.people}</p>
                <p className="card-text">Status: <span className="badge badge-secondary">{reservation.status}</span></p>
                {reservation.status === "booked" && (
                  <>
                    <a href={`/reservations/${reservation.reservation_id}/seat`} className="btn btn-primary mr-2">Seat</a>
                    <a href={`/reservations/${reservation.reservation_id}/edit`} className="btn btn-secondary mr-2">Edit</a>
                    <button className="btn btn-danger" onClick={() => cancelReservationHandler(reservation.reservation_id)}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="col">
          <h4>Tables</h4>
          {tables.map((table, index) => (
            <div key={index} className="card my-2">
              <div className="card-body">
                <h5 className="card-title">{table.table_name}</h5>
                <p className="card-text">Capacity: {table.capacity}</p>
                <p className="card-text">Status: <span className="badge badge-secondary">{table.reservation_id ? "Occupied" : "Free"}</span></p>
                {table.reservation_id && (
                  <button className="btn btn-danger" onClick={() => finishHandler(table.table_id)}>Finish</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="date-navigation btn-group my-3">
        <button onClick={handlePreviousDay} className="btn btn-secondary">Previous</button>
        <button onClick={handleToday} className="btn btn-primary">Today</button>
        <button onClick={handleNextDay} className="btn btn-secondary">Next</button>
      </div>
    </main>
  );
}

export default Dashboard;
