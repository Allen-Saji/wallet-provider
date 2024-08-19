"use client";
import React from "react";
import { Button } from "./Button";
import { signIn, signOut, useSession } from "next-auth/react";

function AppBar() {
  const session = useSession();
  return (
    <div className="border-b flex flex-row justify-between p-4 bg-gray-900">
      <div className="font-bold text-2xl text-purple-300">WalletEase</div>
      {session.data?.user ? (
        <Button
          onClick={() => {
            signOut();
          }}
        >
          Logout
        </Button>
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
