import React, { useState } from "react";
import axios from "axios";

function ItemForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "lost",
    location: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/api/items", form).then(() => {
      alert("Item submitted!");
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Report Item</h2>
      <input name="title" placeholder="Title" onChange={handleChange} required />
      <input name="description" placeholder="Description" onChange={handleChange} required />
      <input name="location" placeholder="Location" onChange={handleChange} required />
      <select name="type" onChange={handleChange}>
        <option value="lost">Lost</option>
        <option value="found">Found</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  );
}

export default ItemForm;
