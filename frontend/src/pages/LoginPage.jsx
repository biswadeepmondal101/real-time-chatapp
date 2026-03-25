import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  User,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import AuthImagePattern from "../components/AuthImagePattern";
import { toast } from "react-hot-toast";

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) {
      setLoginError(true);
      return toast.error("Email is required");
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setLoginError(true);
      return toast.error("Invalid email format");
    }

    if (!formData.password.trim()) {
      setLoginError(true);
      return toast.error("Password is required");
    }

    if (formData.password.length < 6) {
      setLoginError(true);
      return toast.error("Invalid password");
    }

    setLoginError(false);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (isValid === true) {
      const success = await login(formData);

      if (!success) {
        setLoginError(true);

        setTimeout(() => {
          setLoginError(false);
        }, 2000);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -80 }}
      transition={{ duration: 0.35 }}
    >
      <div className="min-h-screen grid lg:grid-cols-2">
        <AuthImagePattern
          title="Join our community"
          subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
          error={loginError}
        />
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div
                  className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
                >
                  <MessageSquare className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Welcome Back</h1>
                <p className="text-base-content/60">Sign in to your account</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="form-control">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="size-5 text-base-content/50" />
                  </div>
                  <input
                    type="email"
                    id="loginEmail"
                    placeholder=" "
                    className="peer input input-bordered w-full pl-10 pt-5 pb-2"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setLoginError(false);
                    }}
                  />
                  <label
                    htmlFor="loginEmail"
                    className="absolute left-10 -top-2.5 px-1 text-xs text-base-content/60 bg-base-100 transition-all
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-base-content/40 peer-placeholder-shown:bg-transparent
        peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-base-content/60 peer-focus:bg-base-100"
                  >
                    Email
                  </label>
                </div>
              </div>

              {/* Password */}
              <div className="form-control">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="loginPassword"
                    placeholder=" "
                    className="peer input input-bordered w-full pl-10 pr-10 pt-5 pb-2"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setLoginError(false);
                    }}
                  />
                  <label
                    htmlFor="loginPassword"
                    className="absolute left-10 -top-2.5 px-1 text-xs text-base-content/60 bg-base-100 transition-all
        peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-base-content/40 peer-placeholder-shown:bg-transparent
        peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-base-content/60 peer-focus:bg-base-100"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-base-content/40" />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="text-center">
              <p className="text-base-content/60">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="link link-primary">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;
