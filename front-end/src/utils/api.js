/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-date";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

export async function createReservation(reservationData) {
  const url = new URL("/reservations", API_BASE_URL);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: reservationData }),
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    // Handle error, e.g., by returning a rejected promise
  }
}

export async function createTable(tableData) {
  const url = new URL("/tables", API_BASE_URL);
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({ data: tableData }),
  };

  return await fetchJson(url, options);
}

export async function listTables(signal) {
  const url = new URL("/tables", API_BASE_URL);
  return await fetchJson(url, { headers, signal }, []);
}

export async function seatReservation(tableId, reservationId) {
  const url = new URL(`/tables/${tableId}/seat`, API_BASE_URL);
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { reservation_id: reservationId } }),
  };

  return await fetchJson(url, options);
}

export async function finishTable(tableId) {
  const url = new URL(`/tables/${tableId}/seat`, API_BASE_URL);
  const options = {
    method: "DELETE",
    headers,
  };

  return await fetchJson(url, options);
}

export async function listReservationsByPhoneNumber(mobileNumber) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  url.searchParams.append("mobile_number", mobileNumber);

  return await fetchJson(url, { headers }, [])
    .then((reservations) => reservations.map(formatReservationDate))
    .then((reservations) => reservations.map(formatReservationTime));
}

export async function updateReservation(updatedReservationData, signal) {
  const { reservation_id } = updatedReservationData;
  const url = new URL(`/reservations/${reservation_id}`, API_BASE_URL);
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: updatedReservationData }),
    signal,
  };

  return await fetchJson(url, options);
}

export async function updateReservationStatus(reservationId, newStatus) {
  const url = new URL(`/reservations/${reservationId}/status`, API_BASE_URL);
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: { status: newStatus } }),
  };

  return await fetchJson(url, options);
}

export async function readReservation(reservationId, signal) {
  const url = new URL(`/reservations/${reservationId}`, API_BASE_URL);
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate) // Assuming you have a function to format the reservation date
    .then(formatReservationTime); // Assuming you have a function to format the reservation time
}
