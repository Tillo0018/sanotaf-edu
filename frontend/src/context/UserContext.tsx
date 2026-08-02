"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  region: string;
  position: string;
  role: string;
  avatar?: string | null;
}

interface UserContextType {
  user: User | null;
  totalScore: number;
  rank: number;
  completedModules: number;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [rank, setRank] = useState<number>(0);
  const [completedModules, setCompletedModules] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    setLoading(true);
    const token = localStorage.getItem("sanotaf_token");
    if (!token) {
      setUser(null);
      setTotalScore(0);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchApi("/user");
      if (data.status === "success") {
        setUser(data.user);
        setTotalScore(data.total_score || 0);
        setRank(data.rank || 0);
        setCompletedModules(data.completed_modules || 0);
      } else {
        setUser(null);
        setTotalScore(0);
        setRank(0);
        setCompletedModules(0);
        localStorage.removeItem("sanotaf_token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      localStorage.removeItem("sanotaf_token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetchApi("/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("sanotaf_token");
    setUser(null);
    setTotalScore(0);
    setRank(0);
    setCompletedModules(0);
    router.push("/login");
  };


  return (
    <UserContext.Provider value={{ user, totalScore, rank, completedModules, setUser, loading, logout, checkAuth }}>
      {children}
    </UserContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a UserProvider");
  }
  return context;
}
