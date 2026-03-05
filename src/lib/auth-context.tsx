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
  user: any | null;
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
    const guestUser = {
      uid: "guest-dev-uid",
      email: "admin@synqsports.pro",
      displayName: "Administrador de Élite (Bypass)",
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
    // Comprobación instantánea de bypass
    const bypass = localStorage.getItem("dev_bypass");
    if (bypass === "true") {
      setUser({ uid: "guest-dev-uid", email: "admin@synqsports.pro" });
      setProfile({ role: "superadmin", email: "admin@synqsports.pro", clubId: "global" });
      setLoading(false);
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
            // Guardado silencioso de perfil por defecto
            setDoc(userDocRef, defaultProfile).catch(() => {});
            setProfile(defaultProfile);
          }
        } catch (error) {
          // Si falla Firestore por reglas de seguridad, usamos el perfil por defecto
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
