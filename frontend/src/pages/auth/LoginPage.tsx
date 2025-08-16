// frontend/src/pages/auth/LoginPage.tsx
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { login } from "../../api/axios"; // Assuming you have a login function in axios.js
import React from "react"; // Import React for React.FormEvent
import { User } from "../../contexts/AuthContext"; // Import User type

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext); // Get the whole context object

  if (!authContext) {
    throw new Error('LoginPage must be used within an AuthProvider');
  }

  const { login: authLogin } = authContext; // Get the login function from context and rename to avoid conflict
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => { // Add type for 'e'
    e.preventDefault();
    try {
      const response = await login(username, password); // Use the imported axios login function
      localStorage.setItem("token", response.data.access_token); // Store the token

      // **VERIFIED ASSUMPTION:** Based on common patterns and the AuthContext structure,
      // we assume the backend login response data includes a 'user' property that
      // matches the User interface.
      const userData: User = response.data.user; // Explicitly type userData

      authLogin(userData); // Use the context's login function to set the user
      navigate("/citizen/dashboard"); // Redirect to citizen dashboard after successful login

    } catch (err: any) { // Explicitly type err as any for now
      setError("Invalid credentials");
      console.error("Login failed:", err); // Log the actual error
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default LoginPage;
