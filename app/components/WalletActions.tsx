"use client";
import React, { useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const WalletActions: React.FC = () => {
  const { data: session } = useSession();
  const userId = (session?.user as { uid: string })?.uid;
  const router = useRouter();

  // States for the seed phrase, loading, and fetching status
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState<boolean>(false);
  const [isFetchingWallet, setIsFetchingWallet] = useState<boolean>(false);

  const handleCreateNewWallet = async () => {
    if (!userId) return;

    setIsCreatingWallet(true); // Start creation loading state
    try {
      const response = await axios.post("/api/wallets/create", {
        userId,
      });
      console.log("New Wallet Created:", response.data);

      // End creation loading, start fetching state
      setIsCreatingWallet(false);
      setIsFetchingWallet(true);

      // Refresh to fetch updated wallet data
      await router.refresh();

      // End fetching state when done
      setIsFetchingWallet(false);
    } catch (error) {
      console.error("Failed to create wallet:", error);
      setIsCreatingWallet(false); // End loading state in case of error
    }
  };

  const handleShowSeedPhrase = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        "/api/wallets/seedPhrase?userId=" + userId
      );
      setSeedPhrase(response.data); // Update seed phrase state
    } catch (error) {
      console.error("Failed to fetch seed phrase:", error);
    }
  };

  const handleCloseSeedPhrase = () => {
    setSeedPhrase(null); // Clear the seed phrase state
  };

  return (
    <div className="flex flex-col items-center space-y-4 m-5">
      <div className="flex space-x-4">
        <button
          onClick={handleCreateNewWallet}
          disabled={isCreatingWallet || isFetchingWallet} // Disable button while loading or fetching
          className={`px-4 py-2 text-white rounded-lg ${
            isCreatingWallet || isFetchingWallet
              ? "bg-purple-300"
              : "bg-purple-500 hover:bg-purple-700"
          }`}
        >
          {isCreatingWallet
            ? "Creating New Wallet..."
            : isFetchingWallet
            ? "Wallet creation successful, fetching new wallet..."
            : "Create New Wallet"}
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
        <div className="mt-4 text-white p-4 border rounded bg-gray-900">
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
