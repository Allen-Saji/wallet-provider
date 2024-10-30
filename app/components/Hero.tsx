"use client";
import React, { useEffect, useState } from "react";
import { DashboardButton } from "./Button";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user ? (session.user as { uid: string }).uid : null;

  // State for loading status
  const [loading, setLoading] = useState(false);

  // Automatically redirect to dashboard if user exists
  useEffect(() => {
    if (userId) {
      setLoading(true); // Start loading
      router.push("/dashboard/" + userId);
    }
  }, [userId, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      {loading ? (
        <div className="text-xl font-semibold text-purple-200">
          Redirecting...
        </div>
      ) : (
        <>
          <div className="text-4xl font-bold text-purple-300 mb-6">
            Welcome to WalletEase
          </div>
          <div className="text-xl text-purple-200 mb-12">
            Your Gateway to Effortless Crypto Management
          </div>
          {!session?.user && (
            <DashboardButton onClick={() => signIn("google")}>
              Signup for WalletEase
            </DashboardButton>
          )}
        </>
      )}
    </div>
  );
}
