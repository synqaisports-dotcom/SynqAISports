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
        try {
          const isElite = SUPERADMIN_EMAILS.includes(user.email || "");
          const userDocRef = doc(db, "users", user.uid);
          
          let profileData: UserProfile | null = null;
          
          try {
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              profileData = userDoc.data() as UserProfile;
            }
          } catch (e) {
            // Si falla la lectura por permisos pero es Elite, forzamos perfil local
            if (isElite) {
              profileData = {
                email: user.email || "",
                role: "superadmin",
                clubId: "global",
              };
            }
          }

          if (!profileData) {
            // Auto-provisión si no existe
            const newProfile: UserProfile = {
              email: user.email || "",
              role: isElite ? "superadmin" : "coach",
              clubId: isElite ? "global" : "guest_node",
            };

            try {
              await setDoc(userDocRef, newProfile);
              profileData = newProfile;
            } catch (e) {
              // Si falla setDoc (ej. por config de Firebase), pero es Elite, permitimos entrar
              if (isElite) profileData = newProfile;
            }
          }
          
          setProfile(profileData);
        } catch (error) {
          console.error("AUTH_ORCHESTRATION_ERROR:", error);
        } finally {
          setLoading(false);
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
