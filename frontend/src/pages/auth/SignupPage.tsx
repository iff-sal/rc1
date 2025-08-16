import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../src/contexts/AuthContext'; // Keep useAuth if you need user/loading state
import { signup } from '../../api/axios'; // Import the signup API function

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    national_id_number: '',
    phone_number: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Keep useAuth call, but remove destructuring if user/loading aren't used
  // If you don't need user or loading state from AuthContext in this component,
  // you can simply call useAuth() to ensure the context is available.
  useAuth(); // Removed destructuring for unused variables
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear validation error for this field on change
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
    // Clear password confirmation error if password changes
    if (e.target.name === 'password' && errors.confirm_password) {
       setErrors({ ...errors, confirm_password: null });
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.first_name) newErrors.first_name = 'First Name is required';
    if (!formData.last_name) newErrors.last_name = 'Last Name is required';
    if (!formData.national_id_number) newErrors.national_id_number = 'National ID Number is required';
    if (!formData.phone_number) newErrors.phone_number = 'Mobile Number is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!formData.password) {
        newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);
    if (validate()) {
      setLoading(true);
      try {
        // Call the imported signup API function
        await signup(formData); // Removed unused 'response' variable

        // Optional: Auto-login user after successful signup if needed (uncomment if needed)
        // If you uncomment this, you will need to destructure 'login' from useAuth()
        // if (response.data && response.data.user && response.data.access_token) {
        //    localStorage.setItem("token", response.data.access_token);
        //    // Assuming authContext.login expects a user object
        //    const authContext = useAuth(); // Get context again if not destructured above
        //    authContext.login(response.data.user);
        //    navigate("/citizen/dashboard");
        // } else {
            // Redirect to login page after successful signup
            navigate('/login');
        // }

      } catch (err: any) {
        console.error('Signup failed:', err);
        setSignupError(err.response?.data?.message || 'Signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          {signupError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{signupError}</span>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
              First Name
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.first_name ? 'border-red-500' : ''}`}
              id="first_name"
              type="text"
              placeholder="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
            />
            {errors.first_name && <p className="text-red-500 text-xs italic">{errors.first_name}</p>}
          </div>
           <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
              Last Name
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.last_name ? 'border-red-500' : ''}`}
              id="last_name"
              type="text"
              placeholder="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
            />
            {errors.last_name && <p className="text-red-500 text-xs italic">{errors.last_name}</p>}
          </div>
           <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="national_id_number">
              National ID Number
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.national_id_number ? 'border-red-500' : ''}`}
              id="national_id_number"
              type="text"
              placeholder="National ID Number"
              name="national_id_number"
              value={formData.national_id_number}
              onChange={handleChange}
            />
            {errors.national_id_number && <p className="text-red-500 text-xs italic">{errors.national_id_number}</p>}
          </div>
           <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone_number">
              Mobile Number
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.phone_number ? 'border-red-500' : ''}`}
              id="phone_number"
              type="text"
              placeholder="Mobile Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
            />
            {errors.phone_number && <p className="text-red-500 text-xs italic">{errors.phone_number}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
              id="email"
              type="email"
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
             {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
              id="password"
              type="password"
              placeholder="******************"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm_password">
              Confirm Password
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${errors.confirm_password ? 'border-red-500' : ''}`}
              id="confirm_password"
              type="password"
              placeholder="******************"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
            />
             {errors.confirm_password && <p className="text-red-500 text-xs italic">{errors.confirm_password}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-primary hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-600 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
