"use client";

import React, { useState } from "react";
import { Keypair } from "@solana/web3.js";
import { sendSol, sendEth } from "../lib/blockchain";
import { useRouter } from "next/navigation";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  currency: "ETH" | "SOL";
  publicKey: string; // This can be used for displaying or other purposes, but is not used for sending
  fromWallet: Keypair | string; // Keypair for SOL, private key string for ETH
}

const getKeypairFromPrivateKeyString = (privateKeyString: string): Keypair => {
  const privateKeyArray = privateKeyString
    .split(",")
    .map((num) => parseInt(num.trim(), 10));
  const secretKey = new Uint8Array(privateKeyArray);
  return Keypair.fromSecretKey(secretKey);
};

const SendModal: React.FC<SendModalProps> = ({
  isOpen,
  onClose,
  balance,
  currency,
  publicKey,
  fromWallet,
}) => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSend = async () => {
    if (!recipient || !amount) {
      setError("Recipient address and amount are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let keyPair;
      if (typeof fromWallet === "string") {
        keyPair = getKeypairFromPrivateKeyString(fromWallet);
      }
      if (currency === "SOL" && keyPair instanceof Keypair) {
        await sendSol(keyPair, recipient, parseFloat(amount));
      } else if (currency === "ETH" && typeof fromWallet === "string") {
        await sendEth(fromWallet, recipient, amount);
      } else {
        setError("Invalid wallet type provided for the selected currency.");
        return;
      }

      // Close the modal and attempt to refresh the page
      onClose();
      try {
        router.refresh(); // Try refreshing the current route
      } catch {
        window.location.reload(); // Fallback to reloading the page
      }
    } catch (error) {
      setError("Error sending transaction. Please try again.");
      console.error("Error sending transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
      <div className="bg-gray-900 p-6 rounded shadow-lg relative border border-2 border-purple-300">
        <h2 className="text-xl mb-4 text-purple-300">Send {currency}</h2>
        <div className="mb-2">
          <strong className="text-purple-300">Balance:</strong> {balance}{" "}
          {currency}
        </div>
        <input
          type="text"
          className="border rounded p-2 w-full mb-4 bg-gray-900 text-purple-300"
          placeholder={`Enter recipient address`}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          type="text"
          className="border rounded p-2 w-full mb-4 bg-gray-900 text-purple-300"
          placeholder={`Enter amount of ${currency} to send`}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {error && <div className="mb-4 text-red-500">{error}</div>}
        <div className="flex justify-end">
          <button
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="bg-purple-300 text-white py-2 px-4 rounded"
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? <span>Sending...</span> : "Send"}
          </button>
        </div>
        {loading && (
          <div className="absolute inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center rounded">
            <div className="text-white">Processing...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendModal;
