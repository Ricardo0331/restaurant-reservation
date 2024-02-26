import React, { useState } from "react";
import {
  listReservationsByPhoneNumber,
  updateReservationStatus,
} from "../utils/api"; // Ensure this function is implemented in api.js
import "./SearchReservations.css";

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
    <div className="container mt-3">
      <form onSubmit={handleSubmit} className="form-inline mb-3">
        <input
          type="tel"
          className="form-control mr-2 flex-grow-1"
          name="mobile_number"
          placeholder="Enter a customer's phone number"
          onChange={handleInputChange}
          value={phoneNumber}
        />
        <button type="submit" className="btn btn-primary">
          Find
        </button>
      </form>

      {searchError && (
        <div className="alert alert-danger" role="alert">
          {searchError.message}
        </div>
      )}

      {searchSubmitted && reservations.length === 0 && (
        <p>No reservations found.</p>
      )}

      <div className="reservation-results">
        {reservations.map((reservation, index) => (
          <div key={index} className="card mb-2">
            <div className="card-body">
              <h5 className="card-title">
                {reservation.first_name} {reservation.last_name}
              </h5>
              <p className="card-text">
                Mobile Number: {reservation.mobile_number}
              </p>
              <p className="card-text">
                Date of Reservation: {reservation.reservation_date}
              </p>
              <p className="card-text">
                Time of Reservation: {reservation.reservation_time}
              </p>
              <p className="card-text">
                Number of People: {reservation.people}
              </p>
              <p className="card-text">
                Status:{" "}
                <span className="badge badge-secondary">
                  {reservation.status}
                </span>
              </p>
              {reservation.status === "booked" && (
                <>
                  <a
                    href={`/reservations/${reservation.reservation_id}/edit`}
                    className="btn btn-secondary mr-2"
                  >
                    Edit
                  </a>
                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      cancelReservationHandler(reservation.reservation_id)
                    }
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchReservations;
