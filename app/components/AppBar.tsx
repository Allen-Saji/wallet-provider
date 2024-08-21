"use client";
import React from "react";
import { Button } from "./Button";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function AppBar() {
  const session = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" }); // Redirect to root after sign out
  };

  return (
    <div className="border-b flex flex-row justify-between p-4 bg-gray-900">
      <div className="font-bold text-2xl text-purple-300">WalletEase</div>
      {session.data?.user ? (
        <Button onClick={handleLogout}>Logout</Button>
      ) : (
        <Button
          onClick={() => {
            signIn("google");
          }}
        >
          Login
        </Button>
      )}
    </div>
  );
}

export default AppBar;
