import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import "./NewTableForm.css";

function NewTableForm() {
  const initialFormState = { table_name: "", capacity: "" };
  const [formData, setFormData] = useState({ ...initialFormState });
  const history = useHistory();

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]:
        target.name === "capacity" ? Number(target.value) : target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    createTable(formData, abortController.signal)
      .then(() => history.push("/dashboard"))
      .catch(console.error);

    return () => abortController.abort();
  };

  const handleCancel = () => {
    history.goBack();
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-3">
      <div className="form-group">
        <label htmlFor="table_name">Table Name</label>
        <input
          type="text"
          className="form-control"
          id="table_name"
          name="table_name"
          value={formData.table_name}
          onChange={handleChange}
          minLength="2"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="capacity">Capacity</label>
        <input
          type="number"
          className="form-control"
          id="capacity"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          min="1"
          required
        />
      </div>
      <div className="form-group text-center">
        <button type="submit" className="btn btn-primary mr-2">Submit</button>
        <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
      </div>
    </form>
  );
  }

export default NewTableForm;
