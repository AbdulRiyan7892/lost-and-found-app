import React, { useState, useEffect } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { FaHome, FaSignOutAlt } from "react-icons/fa";

const API_URL = "https://lost-and-found-app-1.onrender.com";

// Navbar component
function Navbar({ onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <button className="nav-button" onClick={() => navigate("/home")}>
        <FaHome /> Home
      </button>
      <button className="nav-button" onClick={onLogout}>
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
}

function LoginPage({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (data.token) {
      alert("✅ Login successful!");
      setToken(data.token);
      localStorage.setItem("token", data.token);
      navigate("/home");
    } else {
      alert("❌ Invalid credentials !!. New User?? Register first...");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
}

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      alert("✅ Registration successful! You can now log in.");
      navigate("/");
    } else {
      alert("❌ Registration failed. Try a different username.");
    }
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

function Home({ token, onLogout }) {
  return (
    <div className="container">
      <Navbar onLogout={onLogout} />
      <h1>Lost and Found</h1>
      <div className="section-buttons">
        <Link to="/lost" className="section-button lost">Lost Items</Link>
        <Link to="/found" className="section-button found">Found Items</Link>
        <Link to="/report" className="section-button report">Report Item</Link>
      </div>
    </div>
  );
}

function ItemsPage({ token, type, onLogout }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/items`)
      .then((res) => res.json())
      .then(setItems);
  }, []);

  const filtered = items.filter((i) =>
    i.type === type &&
    (i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.location.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id) => {
    const confirm2 = window.confirm("⚠️ This action is irreversible. Confirm delete?");
    if (!confirm2) return;

    const res = await fetch(`${API_URL}/api/items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setItems((prev) => prev.filter((item) => item._id !== id));
      alert("✅ Item successfully deleted.");
    } else {
      alert("❌ Failed to delete item.");
    }
  };

  return (
    <div className="container">
      <Navbar onLogout={onLogout} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{type.toUpperCase()} Items</h2>
        <button
          onClick={() => navigate('/report')}
          style={{
            padding: "8px 12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          ➕ Report Item
        </button>
      </div>

      <input
        placeholder="Search..."
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: "10px", padding: "5px", width: "100%" }}
      />

      <ul>
        {filtered.map((item) => (
          <li key={item._id}>
            <strong>{item.title}</strong><br />
            {item.description}<br />
            📍 {item.location}<br />
            📞 {item.contact}<br />
            👤 Reporter: {item.reporter}<br />
        {item.imageUrl && <img src={item.imageUrl} width="150" alt="uploaded" />}

           <br />
            {token && item.userId === JSON.parse(atob(token.split('.')[1])).userId && (
              <button onClick={() => handleDelete(item._id)}>🗑️ Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportItem({ token, onLogout }) {
  const [form, setForm] = useState({ title: "", description: "", type: "lost", location: "", contact: "" });
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (form.type === "found" && image) fd.append("image", image);

    const res = await fetch(`${API_URL}/api/items`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (res.ok) navigate(`/${form.type}`);
    else alert("❌ Failed to report item.");
  };

  return (
    <div className="container">
      <Navbar onLogout={onLogout} />
      <h2>Report Item</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} required />
        <input name="location" placeholder="Location" onChange={handleChange} required />
        <input name="contact" placeholder="Contact" onChange={handleChange} required />
        <select name="type" onChange={handleChange}>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        {form.type === "found" && <input type="file" name="image" onChange={(e) => setImage(e.target.files[0])} />
}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (!token) localStorage.removeItem("token");
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage setToken={setToken} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={token ? <Home token={token} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/lost" element={token ? <ItemsPage token={token} type="lost" onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/found" element={token ? <ItemsPage token={token} type="found" onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/report" element={token ? <ReportItem token={token} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
