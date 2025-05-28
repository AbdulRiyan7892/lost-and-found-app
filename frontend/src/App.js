// App.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdCall } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

const API_BASE = "http://localhost:5000"; // Replace with your backend URL if deployed

function App() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "lost",
    location: "",
    contact: "",
    image: null,
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await axios.get(`${API_BASE}/api/items`);
    setItems(res.data);
  };

  const handleAuth = async () => {
    const route = isLogin ? "login" : "register";
    try {
      const res = await axios.post(`${API_BASE}/api/${route}`, {
        username,
        password,
        contact: formData.contact,
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      }
      alert(`${route === "login" ? "Logged in" : "Registered"} successfully`);
    } catch (err) {
      alert("Auth failed");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const form = new FormData();
    for (let key in formData) {
      form.append(key, formData[key]);
    }

    try {
      await axios.post(`${API_BASE}/api/items`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Item submitted");
      setFormData({
        title: "",
        description: "",
        type: "lost",
        location: "",
        contact: "",
        image: null,
      });
      fetchItems();
    } catch {
      alert("Upload failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchItems();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>🎒 Lost & Found</h1>

      {/* Auth */}
      <div>
        <h3>{isLogin ? "Login" : "Register"}</h3>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        {!isLogin && (
          <input
            placeholder="Contact (10 digits)"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />
        )}<br />
        <button onClick={handleAuth}>
          {isLogin ? "Login" : "Register"}
        </button>
        <p>
          {isLogin ? "No account?" : "Have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>

      {/* Submit Item */}
      {token && (
        <form onSubmit={handleUpload}>
          <h3>Report Lost/Found Item</h3>
          <input
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          /><br />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          /><br />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select><br />
          <input
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          /><br />
          <input
            placeholder="Contact (10 digits)"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          /><br />
          <input
            type="file"
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
          /><br />
          <button type="submit">Submit</button>
        </form>
      )}

      {/* Items List */}
      <h2>All Items</h2>
      <ul>
        {items.map((item) => (
          <li key={item._id} style={{ marginBottom: 20 }}>
            <strong>{item.title}</strong><br />
            {item.description}<br />
            📍 {item.location}<br />
            <span>
              <MdCall style={{ verticalAlign: 'middle' }} />{" "}
              <a href={`tel:${item.contact}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                {item.contact}
              </a>
            </span>
            <br />
            <span>
              <FaWhatsapp style={{ verticalAlign: 'middle' }} />{" "}
              <a
                href={`https://wa.me/${item.contact.replace("+", "").replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#25D366', textDecoration: 'none' }}
              >
                WhatsApp
              </a>
            </span>
            <br />
            👤 Reporter: {item.reporter}<br />
            {item.imageUrl && <img src={item.imageUrl} width="150" alt="uploaded" />}<br />
            {token &&
              item.userId === JSON.parse(atob(token.split('.')[1])).userId && (
                <button onClick={() => handleDelete(item._id)}>🗑️ Delete</button>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
