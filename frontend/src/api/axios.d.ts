// frontend/src/api/axios.d.ts
import { AxiosInstance, AxiosResponse } from 'axios';
import { User } from '../contexts/AuthContext'; // Import the exported User type

// Define the shape of the login response data
interface LoginResponse {
  access_token: string;
  user: User; // Add the user property here, matching the exported User type
  // Add other properties from the login response if any
}

// Declare the default export (the configured axios instance)
declare const api: AxiosInstance;

// Declare the named export (the login function)
export const login: (email: string, password: string) => Promise<AxiosResponse<LoginResponse>>;

// Assuming you also have a signup function in axios.js, let's declare it too
// Adjust the response type based on what your backend's signup returns
interface SignupResponse {
  // Assuming signup returns the created user data
  user: User;
  // Or maybe just a success message/status
  message?: string;
}
export const signup: (userData: any) => Promise<AxiosResponse<SignupResponse>>;


// Export the default instance
export default api;
