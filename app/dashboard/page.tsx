"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "../components/Button";
import axios from "axios";

function Dashboard() {
  const { data: session } = useSession();

  const handleCreateNewWallet = async () => {
    try {
      if (!session || !session.user) {
        console.error("User session is not available");
        return;
      }

      const userId = (session.user as { uid: string }).uid;
      const derivationPath = "m/44'/501'/0'/0'"; // Example derivation path for Solana

      const response = await axios.post("/api/wallets", {
        userId,
        derivationPath,
      });

      console.log("New wallet created:", response.data);
    } catch (error) {
      console.error("Error creating wallet:", error);
    }
  };

  return (
    <div>
      Welcome to Dashboard
      <Button onClick={handleCreateNewWallet}>Create New Wallet</Button>
      <Button onClick={() => {}}>Show Seed Phrase</Button>
    </div>
  );
}

export default Dashboard;
