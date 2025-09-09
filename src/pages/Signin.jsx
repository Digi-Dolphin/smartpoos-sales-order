import { useContext, useState } from "react";
import { Button, Card, Label, TextInput, Checkbox, Alert } from "flowbite-react";
import { Eye, EyeOff, Lock, Mail, AlertCircle, User } from "lucide-react";
import axiosInstance from "../config";
import { url } from "../url";
import AccessContext from "./AccessContext";
import axios from "axios";

export default function LoginScreen({ setAuthenticated }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { setAccess } = useContext(AccessContext);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(`${url}api/token/`, {
        username: formData.username,
        password: formData.password
      });

      localStorage.setItem('access', response.data.access);
      setAccess(response.data.access);
      const userProfile = await axiosInstance.get(`${url}api/get-user-info/`,{
        headers: {
          'Authorization': `Bearer ${response.data.access}`
        }
      });
      localStorage.setItem('branch_id', userProfile.data.user_profile.store.id)
      // console.log(userProfile);
      setAuthenticated(true);
    }
    catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center -mb-8">
          <img src="public/logo.png" alt="" />
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <div className="space-y-6">
            {/* Error Alert */}
            {error && (
              <Alert color="failure" icon={AlertCircle}>
                <span className="font-medium">Error:</span> {error}
              </Alert>
            )}

            {/* Email Field */}
            <div>
              <Label htmlFor="username" value="Username" className="mb-2 block" />
              <div className="relative">
                <TextInput
                  id="username"
                  name="username"
                  type="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  icon={User}
                  required
                  className="w-full"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" value="Password" className="mb-2 block" />
              <div className="relative">
                <TextInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  icon={Lock}
                  required
                  className="w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              onClick={handleSubmit}
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}