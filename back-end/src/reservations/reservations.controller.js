const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function create(req, res, next) {
  const { status } = req.body.data;
  if (status && status !== "booked") {
    return next({
      status: 400,
      message: `Status '${status}' is not allowed upon creation.`,
    });
  }

  try {
    const data = await service.create(req.body.data);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
}

async function list(req, res) {
  const { date } = req.query;
  const { mobile_number } = req.query;

  let data;
  if (date) {
    data = await service.listDate(date);
  } else if (mobile_number) {
    data = await service.search(mobile_number);
  } else {
    data = await service.list();
  }
  res.json({ data });
}

async function read(req, res) {
  const { reservation_id } = req.params;
  const reservation = await service.read(reservation_id);

  if (reservation) {
    return res.json({ data: reservation });
  } else {
    return res
      .status(404)
      .json({ error: `Reservation not found: ${reservation_id}` });
  }
}

function isTuesday(date) {
  return date.getDay() === 2; // Day of week, where 0 is Sunday and 2 is Tuesday
}

function isInThePast(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Remove time part
  return date < today;
}

// Validation function for reservation data
function hasRequiredFields(req, res, next) {
  const { data = {} } = req.body;
  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  for (let field of requiredFields) {
    if (!data[field]) {
      return next({
        status: 400,
        message: `Field required: ${field}`,
      });
    }
  }

  //  validation for reservation_date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.reservation_date)) {
    return next({
      status: 400,
      message: `Invalid date format: reservation_date`,
    });
  }

  //  validation for reservation_time
  if (!/^\d{2}:\d{2}$/.test(data.reservation_time)) {
    return next({
      status: 400,
      message: `Invalid time format: reservation_time`,
    });
  }

  // Example validation for people
  if (typeof data.people !== "number" || data.people < 1) {
    return next({
      status: 400,
      message: `Invalid number of people: people`,
    });
  }

  function isDateInFuture(dateString) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Consider only the date part
    const reservationDate = new Date(dateString + "T00:00:00Z"); // Set to UTC midnight

    return reservationDate >= today;
  }

  function isNotTuesday(dateString) {
    const reservationDate = new Date(dateString + "T00:00:00Z"); // Set to UTC midnight
    return reservationDate.getUTCDay() !== 2; // 2 represents Tuesday
  }

  next();
}

function validateReservationDate(req, res, next) {
  const { reservation_date } = req.body.data;
  const reservationDate = new Date(reservation_date + "T00:00:00"); // Ensuring the date is treated as local

  const errors = [];
  if (isTuesday(reservationDate)) {
    errors.push("The restaurant is closed on Tuesdays.");
  }

  if (isInThePast(reservationDate)) {
    errors.push("Reservations must be made for a future date.");
  }

  if (errors.length) {
    return next({ status: 400, message: errors.join(" ") });
  }

  next();
}

function isValidTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const reservationTime = new Date();
  reservationTime.setHours(hours, minutes, 0, 0);

  const openingTime = new Date();
  openingTime.setHours(10, 30, 0, 0); // 10:30 AM

  const closingTime = new Date();
  closingTime.setHours(21, 30, 0, 0); // 9:30 PM

  return reservationTime >= openingTime && reservationTime <= closingTime;
}

function isReservationDateTimeInFuture(dateString, timeString) {
  const reservationDateTime = new Date(`${dateString}T${timeString}`);
  return reservationDateTime > new Date();
}

function validateReservationDateTime(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;

  const errors = [];

  if (!isValidTime(reservation_time)) {
    errors.push("Reservation time must be between 10:30 AM and 9:30 PM.");
  }

  if (!isReservationDateTimeInFuture(reservation_date, reservation_time)) {
    errors.push("Reservation must be set for a future date and time.");
  }

  if (errors.length) {
    return next({ status: 400, message: errors.join(" ") });
  }

  next();
}

async function updateReservationStatus(req, res, next) {
  const { reservation_id } = req.params;
  const { status } = req.body.data;

  // Read the current reservation details
  const reservation = await service.read(reservation_id);
  if (!reservation) {
    return next({
      status: 404,
      message: `Reservation ${reservation_id} cannot be found.`,
    });
  }

  // Include 'cancelled' in the list of valid statuses
  const validStatuses = ["booked", "seated", "finished", "cancelled"];
  if (!validStatuses.includes(status)) {
    return next({ status: 400, message: `Status '${status}' is not valid.` });
  }

  // Prevent updating a finished reservation
  if (reservation.status === "finished") {
    return next({
      status: 400,
      message: "A finished reservation cannot be updated.",
    });
  }

  // Additional check to prevent a reservation from being updated to 'booked' or 'seated' if it's already 'cancelled'
  if (
    reservation.status === "cancelled" &&
    (status === "booked" || status === "seated")
  ) {
    return next({
      status: 400,
      message: "A cancelled reservation cannot be updated to booked or seated.",
    });
  }

  // Update the reservation status in the database
  const updatedReservation = await service.updateStatus(reservation_id, status);
  res.status(200).json({ data: updatedReservation });
}

async function search(req, res, next) {
  const { mobile_number } = req.query;
  const results = await service.search(mobile_number);
  res.json({ data: results });
}

async function update(req, res, next) {
  const { reservation_id } = req.params;
  const updatedReservationData = req.body.data;

  // Input validation: check for required fields and their validity
  const errors = validateReservationData(updatedReservationData);
  if (errors.length) {
    return next({ status: 400, message: errors.join(", ") });
  }

  try {
    // Check if the reservation exists
    const existingReservation = await service.read(reservation_id);
    if (!existingReservation) {
      return next({
        status: 404,
        message: `Reservation ${reservation_id} cannot be found.`,
      });
    }

    // Update the reservation
    const data = await service.update(reservation_id, updatedReservationData);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
}

// Utility function to validate reservation data
function validateReservationData(data) {
  const errors = [];
  const requiredFields = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];
  const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
  const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM format, 24-hour clock

  if (data.reservation_date && !datePattern.test(data.reservation_date)) {
    errors.push("reservation_date is not a valid date");
  }

  if (data.reservation_time && !timePattern.test(data.reservation_time)) {
    errors.push("reservation_time is not a valid time");
  }
  requiredFields.forEach((field) => {
    if (!data[field]) {
      errors.push(`Field required: ${field}`);
    }
  });

  if (data.people !== undefined) {
    if (typeof data.people !== "number" || isNaN(data.people)) {
      errors.push("people must be a number");
    } else if (data.people < 1) {
      errors.push("people must be at least 1");
    }
  }

  // Add more specific validation for fields like reservation_date, reservation_time, and people as needed

  return errors;
}

module.exports = {
  create: [
    hasRequiredFields,
    validateReservationDate,
    validateReservationDateTime,
    create,
  ],
  list,
  read: asyncErrorBoundary(read),
  updateReservationStatus: asyncErrorBoundary(updateReservationStatus),
  search,
  update,
  validateReservationData,
};
