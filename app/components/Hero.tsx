"use client";
import React from "react";
import { DashboardButton } from "./Button";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const session = useSession();
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-4xl font-bold text-purple-300 mb-6">
        Welcome to WalletEase
      </div>
      <div className="text-xl text-purple-200 mb-12">
        "Your Gateway to Effortless Crypto Management"
      </div>
      {session.data?.user ? (
        <DashboardButton
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          Go to Dashboard
        </DashboardButton>
      ) : (
        <DashboardButton
          onClick={() => {
            signIn("google");
          }}
        >
          Signup for WalletEase
        </DashboardButton>
      )}
    </div>
  );
}
