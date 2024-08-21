"use client";
import React, { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const WalletActions: React.FC = () => {
  const { data: session } = useSession();
  const userId = (session?.user as { uid: string })?.uid;
  const router = useRouter();

  // State to hold the seed phrase
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);

  const handleCreateNewWallet = async () => {
    if (!userId) return;

    try {
      const response = await axios.post("/api/wallets/create", {
        userId,
      });
      console.log("New Wallet Created:", response.data);

      // Trigger a refresh or redirect to the same page to fetch updated wallet data
      router.refresh(); // refreshes the current page and triggers the server component to re-fetch data
    } catch (error) {
      console.error("Failed to create wallet:", error);
    }
  };

  const handleShowSeedPhrase = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        "/api/wallets/seedPhrase?userId=" + userId
      );
      // Fetch the seed phrase again and update the state
      setSeedPhrase(response.data);
    } catch (error) {
      console.error("Failed to fetch seed phrase:", error);
    }
  };

  const handleCloseSeedPhrase = () => {
    setSeedPhrase(null); // Clear the seed phrase state to hide it
  };

  return (
    <div className="flex flex-col items-center space-y-4 m-5">
      <div className="flex space-x-4">
        <button
          onClick={handleCreateNewWallet}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-700"
        >
          Create New Wallet
        </button>
        <button
          onClick={handleShowSeedPhrase}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700"
        >
          Show Seed Phrase
        </button>
      </div>
      {/* Display seed phrase if available */}
      {seedPhrase && (
        <div className="mt-4 p-4 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold mb-2">Seed Phrase:</h3>
          <p>{seedPhrase}</p>
          <button
            onClick={handleCloseSeedPhrase}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletActions;
