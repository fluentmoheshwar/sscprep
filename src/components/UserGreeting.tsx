"use client";

import {
  getCurrentUser,
  getGreeting,
  isLoggedIn,
  logout,
} from "../utils/userManager";
import { useEffect, useState } from "react";

export default function UserGreeting() {
  const [user, setUser] = useState<{
    name: string;
    stream: "Science" | "Commerce" | "Arts";
  } | null>(null);
  const [greeting, setGreeting] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Get user data and greeting
    const currentUser = getCurrentUser();
    if (currentUser && isLoggedIn()) {
      setUser(currentUser);
      setGreeting(getGreeting());
    }
    setIsLoaded(true);
  }, []);

  const handleLogout = () => {
    logout();
    // Reload page to show signup form
    window.location.reload();
  };

  if (!isLoaded || !user) {
    return null;
  }

  const streamBadgeClass: Record<string, string> = {
    Science: "badge badge-primary",
    Commerce: "badge badge-success",
    Arts: "badge badge-secondary",
  };

  return (
    <div className="bg-base-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Greeting Card */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="card-title text-3xl mb-2">{greeting}</h1>
                <p className="text-base-content/70">
                  Ready to ace your SSC exams? Let's dive in!
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-error btn-sm"
              >
                Logout
              </button>
            </div>

            {/* User Info */}
            <div className="divider my-2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-base-content/60 uppercase tracking-wide">
                  Your Name
                </p>
                <p className="text-xl font-bold">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/60 uppercase tracking-wide mb-2">
                  Selected Stream
                </p>
                <div className={streamBadgeClass[user.stream]}>
                  {user.stream}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
