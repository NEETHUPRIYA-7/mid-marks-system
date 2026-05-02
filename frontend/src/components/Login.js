import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import logo from "./logo.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const api = axios.create({
    baseURL: "http://localhost:3000",
    headers: { "Content-Type": "application/json" },
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password || !role) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await api.post("/api/auth/login", {
        email: email.trim(),
        password: password.trim(),
        role: role // send role for server verification
      });

      console.log("LOGIN USER:", res.data.user);

      const backendRole = res.data.user.role;

     if (backendRole?.toLowerCase() !== role.toLowerCase()) {
  alert("Role mismatch! Please select correct role");
  return;
}
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", backendRole);
      localStorage.setItem("name", res.data.user.name);
      localStorage.setItem(
        "dept",
        Array.isArray(res.data.user.department)
          ? res.data.user.department[0]
          : res.data.user.department
      );

      const roleLower = backendRole.toLowerCase();

if (roleLower === "admin") navigate("/admin");
else if (roleLower === "hod") navigate("/hod");
else if (roleLower === "faculty") navigate("/faculty");
else if (roleLower === "student") navigate("/student");
    } catch (err) {
      console.log("FULL ERROR:", err);
      alert("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  return (
  <div className="login-page">
    <div className="login-box">

      <div className="logo">
        <img src={logo} alt="logo" />
      </div>

      <h2>STUDENT MID MARKS</h2>
      <h3>MANAGEMENT SYSTEM</h3>

      <form onSubmit={handleLogin}>
        <div className="input-box">
          <input
            type="text"
            placeholder="User ID"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-box password-box">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁"}
          </span>
        </div>

        <div className="input-box">
          <select onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            <option value="admin">ADMIN</option>
            <option value="faculty">FACULTY</option>
            <option value="hod">HOD</option>
            <option value="student">STUDENT</option>
          </select>
        </div>

        <div className="roles">
          <button type="button" className="admin">ADMIN</button>
          <button type="button" className="teacher">FACULTY</button>
          <button type="button" className="hod">HOD</button>
          <button type="button" className="student">STUDENT</button>
        </div>

        <div className="options">
          
        </div>

        <button className="login-btn">LOGIN</button>
      </form>

    </div>
  </div>
);
}

export default Login;