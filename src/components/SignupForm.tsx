"use client";

import { isLoggedIn, signup } from "../utils/userManager";
import React, { useEffect, useState } from "react";

const VALID_STREAMS = ["Science", "Commerce", "Arts"];

export default function SignupForm() {
  const [name, setName] = useState("");
  const [stream, setStream] = useState("Science");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userIsLoggedIn, setUserIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    setUserIsLoggedIn(isLoggedIn());
  }, []);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Use the userManager signup function
    const result = signup(name, stream);

    if (result.success) {
      setName("");
      setError("");
      setUserIsLoggedIn(true);
      window.location.reload(); // Reload to show greeting
    } else {
      setError(result.error || "Signup failed");
      setLoading(false);
    }
  };

  // Only show signup form if user is not logged in
  if (userIsLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 shadow-2xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-3xl justify-center mb-2">
            Welcome to SSCPrep! 📚
          </h1>
          <p className="text-center text-base-content/70 mb-6">
            Your one-stop destination for comprehensive SSC exam preparation.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Your Name</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="input input-bordered w-full focus:input-primary"
                required
              />
            </div>

            {/* Stream Selection */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">
                  Select Your Stream
                </span>
              </label>
              <div className="space-y-3">
                {VALID_STREAMS.map((s) => (
                  <label
                    key={s}
                    className="label cursor-pointer justify-start gap-3 hover:bg-base-200 p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="stream"
                      value={s}
                      checked={stream === s}
                      onChange={(e) => setStream(e.target.value)}
                      className="radio radio-primary"
                    />
                    <div className="flex-1">
                      <span className="label-text font-medium">{s}</span>
                      <span className="label-text-alt text-xs">
                        {s === "Science" && "(Physics, Chemistry, Biology)"}
                        {s === "Commerce" &&
                          "(Accounting, Business Studies, Economics)"}
                        {s === "Arts" &&
                          "(History, Geography, Political Science)"}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-error">
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? "Getting Started..." : "Get Started"}
            </button>
          </form>

          <p className="text-center text-xs text-base-content/50 mt-4">
            Your data is stored locally on this device
          </p>
        </div>
      </div>
    </div>
  );
}
