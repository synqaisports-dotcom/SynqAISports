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
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

const SUPERADMIN_EMAILS = ["munozmartinez.ismael@gmail.com", "synqaisports@gmail.com"];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        if (SUPERADMIN_EMAILS.includes(user.email || "")) {
          const adminProfile: UserProfile = {
            email: user.email || "",
            role: "superadmin",
            clubId: "global",
          };
          setProfile(adminProfile);
          // Opcional: Asegurar que el perfil de admin exista en Firestore
          await setDoc(doc(db, "users", user.uid), adminProfile, { merge: true });
          setLoading(false);
        } else {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setProfile(userDoc.data() as UserProfile);
            } else {
              // AUTO-PROVISIÓN: Si el usuario no existe, creamos uno básico de Coach
              const newProfile: UserProfile = {
                email: user.email || "",
                role: "coach",
                clubId: "guest_node",
              };
              await setDoc(doc(db, "users", user.uid), newProfile);
              setProfile(newProfile);
            }
          } catch (error) {
            console.error("FIREWALL_BLOCK:", error);
            setProfile(null);
          } finally {
            setLoading(false);
          }
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);