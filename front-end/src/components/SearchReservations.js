import React, { useState } from "react";
import {
  listReservationsByPhoneNumber,
  updateReservationStatus,
} from "../utils/api"; // Ensure this function is implemented in api.js

function SearchReservations() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false); // New state to track if a search has been submitted

  const handleInputChange = (event) => {
    setPhoneNumber(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSearchError(null);
    setSearchSubmitted(true); // Set searchSubmitted to true when the form is submitted

    // Add a check to ensure phoneNumber is not empty
    if (!phoneNumber.trim()) {
      setSearchError({ message: "Please enter a phone number to search." });
      return;
    }

    try {
      const foundReservations = await listReservationsByPhoneNumber(
        phoneNumber
      );
      setReservations(foundReservations);
    } catch (error) {
      console.error(error);
      setSearchError(error);
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

        // Re-fetch reservations by phone number to refresh the search results
        const foundReservations = await listReservationsByPhoneNumber(
          phoneNumber
        );
        setReservations(foundReservations);
      } catch (error) {
        console.error(error);
        setSearchError(error);
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          name="mobile_number"
          placeholder="Enter a customer's phone number"
          onChange={handleInputChange}
          value={phoneNumber}
        />
        <button type="submit">Find</button>
      </form>

      {searchError && <div>Error: {searchError.message}</div>}

      {searchSubmitted && reservations.length === 0 && (
        <p>No reservations found.</p>
      )}

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
            <a
              href={`/reservations/${reservation.reservation_id}/edit`}
              className="btn btn-secondary"
            >
              Edit
            </a>
          )}
          <button
            data-reservation-id-cancel={reservation.reservation_id}
            className="btn btn-danger"
            onClick={() => cancelReservationHandler(reservation.reservation_id)}
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}

export default SearchReservations;