import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { ethers } from "ethers";

// Solana balance fetching (Devnet)
export async function getSolanaBalance(publicKey: string): Promise<number> {
  const connection = new Connection("https://api.devnet.solana.com");
  const balance = await connection.getBalance(new PublicKey(publicKey));
  return balance / 1e9; // Convert from lamports to SOL
}

// Function to send SOL
export const sendSol = async (
  fromWallet: Keypair,
  toAddress: string,
  amount: number
) => {
  try {
    // Create a transaction
    const connection = new Connection("https://api.devnet.solana.com");
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports: amount * 1e9, // Convert SOL to lamports
      })
    );

    // Sign and send the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      fromWallet,
    ]);
    console.log("Transaction successful with signature:", signature);
    return signature;
  } catch (error) {
    console.error("Error sending SOL:", error);
  }
};

// Ethereum balance fetching (Sepolia)
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
// Create a provider instance
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

// Function to get the balance of an Ethereum address
export async function getEthereumBalance(address: string): Promise<string> {
  try {
    // Get the balance in wei
    const balanceWei = await provider.getBalance(address);

    // Convert balance to ether and return
    const balanceEther = ethers.formatEther(balanceWei);
    return balanceEther;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
}

// Function to send ETH
export const sendEth = async (
  privateKey: string,
  toAddress: string,
  amount: string
) => {
  try {
    // Connect wallet to the provider
    const wallet = new ethers.Wallet(privateKey, provider);

    // Create a transaction
    const tx = {
      to: toAddress,
      value: ethers.parseEther(amount), // Convert ETH to wei
    };

    // Send the transaction
    const txResponse = await wallet.sendTransaction(tx);

    // Wait for transaction confirmation
    const txnHash = await txResponse.wait();
    console.log("Transaction successful with hash:", txResponse.hash);
    return txnHash;
  } catch (error) {
    console.error("Error sending ETH:", error);
  }
};
