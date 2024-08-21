"use client";
import React, { useState } from "react";
import { ClipboardIcon } from "@heroicons/react/24/outline"; // Importing Heroicons
import SendModal from "./SendModal";

interface WalletComponentProps {
  name: string;
  solPublicKey: string;
  solPrivateKey: string;
  ethPublicKey: string;
  ethPrivateKey: string;
  solBalance: number;
  ethBalance: number;
}

const WalletComponent: React.FC<WalletComponentProps> = ({
  name,
  solPublicKey,
  solPrivateKey,
  ethPublicKey,
  ethPrivateKey,
  solBalance,
  ethBalance,
}) => {
  const [isSolModalOpen, setIsSolModalOpen] = useState(false);
  const [isEthModalOpen, setIsEthModalOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const handleCopy = (text: string, keyType: "SOL" | "ETH") => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyMessage(`${keyType} Public Key copied!`);
        setTimeout(() => setCopyMessage(null), 2000); // Clear message after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  const trimPublicKey = (key: string) => {
    return key.slice(0, 10) + "..." + key.slice(-10);
  };

  return (
    <div className="border rounded-lg shadow-md p-4 mb-4 bg-gray-900 text-white">
      <h3 className="text-lg font-semibold mb-4">{name}</h3>
      <div className="mb-2">
        <strong className="text-purple-300">Solana Public Key:</strong>{" "}
        {trimPublicKey(solPublicKey)}{" "}
        <button
          onClick={() => handleCopy(solPublicKey, "SOL")}
          className="ml-2 text-blue-500 hover:text-blue-700"
        >
          <ClipboardIcon className="w-5 h-5 inline" />
        </button>
      </div>
      <div className="mb-2">
        <strong className="text-purple-300">Ethereum Public Key:</strong>{" "}
        {trimPublicKey(ethPublicKey)}{" "}
        <button
          onClick={() => handleCopy(ethPublicKey, "ETH")}
          className="ml-2 text-blue-500 hover:text-blue-700"
        >
          <ClipboardIcon className="w-5 h-5 inline" />
        </button>
      </div>
      {copyMessage && <div className="mt-2 text-green-500">{copyMessage}</div>}
      <div className="flex justify-between mt-2">
        <div>
          <strong className="text-purple-300">Solana Balance:</strong>{" "}
          {solBalance} SOL
        </div>
        <div>
          <strong className="text-purple-300">Ethereum Balance:</strong>{" "}
          {ethBalance} ETH
        </div>
      </div>
      <div className="flex mt-4">
        <button
          className="bg-purple-500 text-white py-2 px-4 rounded mr-2"
          onClick={() => setIsEthModalOpen(true)}
        >
          Send ETH
        </button>
        <button
          className="bg-green-500 text-white py-2 px-4 rounded mr-2"
          onClick={() => setIsSolModalOpen(true)}
        >
          Send SOL
        </button>
        {/* <button
          className="bg-red-500 text-white py-2 px-4 rounded"
          onClick={() => setShowPrivateKey(!showPrivateKey)}
        >
          Show Private Key
        </button> */}
      </div>
      {/* {showPrivateKey && (
        <div className="mt-4 text-red-500">
          <strong>Private Key:</strong> 
        </div>
      )} */}
      <SendModal
        isOpen={isEthModalOpen || isSolModalOpen}
        onClose={() => {
          setIsEthModalOpen(false);
          setIsSolModalOpen(false);
        }}
        balance={isEthModalOpen ? ethBalance : solBalance}
        currency={isEthModalOpen ? "ETH" : "SOL"}
        publicKey={isEthModalOpen ? ethPublicKey : solPublicKey}
        fromWallet={isEthModalOpen ? ethPrivateKey : solPrivateKey}
      />
    </div>
  );
};

export default WalletComponent;
