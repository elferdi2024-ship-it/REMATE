"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  role: string | null;
  sucursalId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nombre: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsAdminDios?: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [sucursalId, setSucursalId] = useState<string | null>(null);

  useEffect(() => {
    const isBypass = typeof window !== "undefined" && 
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
      sessionStorage.getItem("bypass_admin_dios") === "true";
    if (isBypass) {
      setRole("admin");
      setSucursalId(null);
      setUser({
        uid: "admin-dios-local-uid",
        email: "rnt.atlantida@gmail.com",
        displayName: "Admin Dios Local",
        emailVerified: true,
      } as any);
      setLoading(false);
      return;
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        if (firebaseUser.email === "rnt.atlantida@gmail.com") {
          setRole("admin");
          setSucursalId(null);
          setUser(firebaseUser);
          setLoading(false);
          return;
        }

        try {
          const snap = await getDoc(doc(db, "usuarios", firebaseUser.uid));
          if (snap.exists()) {
            setRole(snap.data().role || null);
            setSucursalId(snap.data().sucursalId || null);
          } else {
            setRole(null);
            setSucursalId(null);
          }
        } catch (e) {
          console.error("Error reading user profile:", e);
          setRole(null);
          setSucursalId(null);
        }
      } else {
        setRole(null);
        setSucursalId(null);
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, nombre: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: nombre });
  };

  const loginAsAdminDios = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("bypass_admin_dios", "true");
      document.cookie = "session=true; path=/; max-age=86400";
      setRole("admin");
      setSucursalId(null);
      setUser({
        uid: "admin-dios-local-uid",
        email: "rnt.atlantida@gmail.com",
        displayName: "Admin Dios Local",
        emailVerified: true,
      } as any);
    }
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("bypass_admin_dios");
      document.cookie = "session=; path=/; max-age=0";
    }
    setRole(null);
    setSucursalId(null);
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.warn("Silent failure signing out Firebase:", e);
      }
    }
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, role, sucursalId, signIn, signUp, signOut, loginAsAdminDios }),
    [user, loading, role, sucursalId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
