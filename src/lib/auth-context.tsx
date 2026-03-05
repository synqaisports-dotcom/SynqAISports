"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

export type UserRole = "superadmin" | "club_admin" | "coach" | "tutor";

interface UserProfile {
  email: string;
  role: UserRole;
  clubId: string;
}

interface AuthContextType {
  user: User | any | null;
  profile: UserProfile | null;
  loading: boolean;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginAsGuest: () => {},
});

const SUPERADMIN_EMAILS = ["munozmartinez.ismael@gmail.com", "synqaisports@gmail.com"];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loginAsGuest = () => {
    console.log("EJECUTANDO_BYPASS_DE_EMERGENCIA...");
    const guestUser = {
      uid: "guest-dev-uid",
      email: "admin@synqsports.pro",
      displayName: "Administrador de Élite (Emergencia)",
    };
    const guestProfile: UserProfile = {
      email: guestUser.email,
      role: "superadmin",
      clubId: "global",
    };
    
    setUser(guestUser);
    setProfile(guestProfile);
    localStorage.setItem("dev_bypass", "true");
    setLoading(false);
  };

  useEffect(() => {
    // Verificar bypass inmediatamente al montar
    const bypass = localStorage.getItem("dev_bypass");
    if (bypass === "true") {
      loginAsGuest();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const isElite = SUPERADMIN_EMAILS.includes(firebaseUser.email || "");
        
        const defaultProfile: UserProfile = {
          email: firebaseUser.email || "",
          role: isElite ? "superadmin" : "coach",
          clubId: isElite ? "global" : "guest_node",
        };

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            setDoc(userDocRef, defaultProfile).catch(() => {});
            setProfile(defaultProfile);
          }
        } catch (error) {
          setProfile(defaultProfile);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
