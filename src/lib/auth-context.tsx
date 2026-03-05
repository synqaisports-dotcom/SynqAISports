"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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

// Emails con bypass de administración total
const SUPERADMIN_EMAILS = ["munozmartinez.ismael@gmail.com", "synqaisports@gmail.com"];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // 1. Verificar si es Superadmin (Prioridad Máxima)
        if (SUPERADMIN_EMAILS.includes(user.email || "")) {
          setProfile({
            email: user.email || "",
            role: "superadmin",
            clubId: "global",
          });
          setLoading(false);
        } else {
          // 2. Intentar recuperar perfil de Firestore para otros usuarios
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              setProfile(userDoc.data() as UserProfile);
            } else {
              // Si el documento no existe, el perfil queda en null
              // Esto disparará la pantalla de Acceso Denegado en el Layout
              setProfile(null);
            }
          } catch (error) {
            console.error("FIREWALL_BLOCK: No se pudo leer el perfil del activo.", error);
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