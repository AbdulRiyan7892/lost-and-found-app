// App.js
import React, { useState, useEffect } from "react";
import './App.css';
import {
  BrowserRouter as Router,
  Routes, 
  Route, 
  Navigate,
  Link, 
  useNavigate
} from "react-router-dom";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { MdCall } from "react-icons/md";

const API_URL = "https://lost-and-found-app-1.onrender.com";

// Navbar component
function Navbar({ onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <button className="nav-button" onClick={() => navigate("/home")}> <FaHome /> Home </button>
      <button className="nav-button" onClick={onLogout}> <FaSignOutAlt /> Logout </button>
    </div>
  );
}

function LoginPage({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true); // Start loading
    try {
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
    } catch (error) {
      alert("❌ Error while logging in. Please try again.");
      console.error(error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="container">
      <h2>Malnad College Of Engineering Hassan</h2>
  
    <h2>Welcome to Lost & Found Portal</h2>
      <p style={{ color: '#555', marginBottom: '1.5rem' }}>
        Please login to continue.. and help to keep our campus organized!
      </p>

      {loading ? (
        <div className="loading">🔄 Logging in, please wait...</div>
      ) : (
        <>
          <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </>
      )}
    </div>
  );
}

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
  if (!/^\d{10}$/.test(contact)) {
    alert("❌ Please enter a valid 10-digit contact number.");
    return;
  }

  const res = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
   body: JSON.stringify({ username, password, contact: `+91${contact}` }),

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
    
      <input
  placeholder="Contact Number (10-digit)"
  value={contact}
  onChange={(e) => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
  required
/>

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
      </div>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/report" className="section-button report" style={{ display: 'inline-block', padding: '1rem 2rem' }}>Report Lost-Found Items</Link>
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
          onClick={() => navigate('/report', { state: { type } })}
          style={{
            padding: "10px 14px",
            backgroundColor: "#1e88e5",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          ➕ Report {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      </div>

      <input
        placeholder="Search..."
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: "10px", padding: "10px", width: "100%" }}
      />

      <ul>
        {filtered.map((item) => (
          <li key={item._id}>
            <strong>{item.title}</strong><br />
            {item.description}<br />
            Location: {item.location}<br />
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
    href={`https://wa.me/${item.contact.replace(/[^0-9]/g, '')}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: '#25D366', textDecoration: 'none' }}
  >
    WhatsApp
  </a>
</span>
<br />

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
  const location = useLocation();
  const defaultType = location.state?.type || "lost";
  const [form, setForm] = useState({ title: "", description: "", type: defaultType, location: "", contact: "" });
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Fetch profile to prefill contact
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setForm((prev) => ({ ...prev, contact: data.contact || "" }));
      } catch (err) {
        console.error("❌ Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!/^\d{10}$/.test(form.contact)) {
    alert("❌ Please enter a valid 10-digit contact number.");
    return;
  }

  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => fd.append(k, v));
  if (form.type === "found" && image) fd.append("image", image);

  const res = await fetch(`${API_URL}/api/items`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  if (res.ok) navigate(`/${form.type}`);
  else alert("❌ Failed to report item. Supported format jpg, jpeg, png");
};


  return (
    <div className="container">
      <Navbar onLogout={onLogout} />
      <h2>Report Item</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" onChange={handleChange} required />
        <textarea name="description" placeholder="Description" onChange={handleChange} required />
        <input name="location" placeholder="Location" onChange={handleChange} required />
        <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} required />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        {form.type === "found" && (
          <input type="file" name="image" onChange={(e) => setImage(e.target.files[0])} />
        )}
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
