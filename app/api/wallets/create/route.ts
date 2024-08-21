import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import * as bip39 from "bip39";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import { hdkey } from "ethereumjs-wallet";
import { derivePath } from "ed25519-hd-key";
import { createCipheriv, randomBytes, createDecipheriv } from "crypto";

// Encryption key used to decrypt the seed phrase
const encryptionKey =
  process.env.ENCRYPTION_KEY ?? randomBytes(32).toString("hex"); // Should be 32 bytes
const algorithm = "aes-256-cbc";

// Function to encrypt data
function encrypt(text: string): { iv: string; encryptedData: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv(
    algorithm,
    Buffer.from(encryptionKey, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
}
// Function to decrypt data
function decrypt(encrypted: { iv: string; encryptedData: string }): string {
  const decipher = createDecipheriv(
    algorithm,
    Buffer.from(encryptionKey, "hex"),
    Buffer.from(encrypted.iv, "hex")
  );
  let decrypted = decipher.update(encrypted.encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Helper function to derive the next wallet name
async function getNextWalletName(userId: string): Promise<string> {
  const walletCount = await db.wallet.count({
    where: {
      userId,
    },
  });
  return `wallet ${walletCount + 1}`;
}

// Function to create a new wallet
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    // Fetch the user's encrypted seed phrase from the database
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.seedPhrase) {
      return NextResponse.json(
        { error: "Seed phrase not found." },
        { status: 404 }
      );
    }

    // Decrypt the seed phrase
    const decryptedSeedPhrase = decrypt(JSON.parse(user.seedPhrase));

    // Convert seed phrase to seed
    const seed = await bip39.mnemonicToSeed(decryptedSeedPhrase);

    // Determine the next derivation path
    const walletCount = await db.wallet.count({ where: { userId } });
    const nextDerivationPath = `m/44'/501'/${walletCount}'/0'`;

    // Derive the Solana Wallet from the seed
    const solDerivedSeed = derivePath(
      nextDerivationPath,
      seed.toString("hex")
    ).key;
    const solKeypair = SolanaKeypair.fromSeed(solDerivedSeed);
    const solPublicKey = solKeypair.publicKey.toBase58();
    const solPrivateKey = solKeypair.secretKey.toString();

    // Derive the Ethereum Wallet from the seed
    const ethHdWallet = hdkey.fromMasterSeed(seed);
    const ethHdKey = ethHdWallet.derivePath(nextDerivationPath);
    const ethWallet = ethHdKey.getWallet();
    const ethPublicKey = ethWallet.getChecksumAddressString();
    const ethPrivateKey = ethWallet.getPrivateKeyString();

    // Get the next wallet name
    const walletName = `wallet ${walletCount + 1}`;

    // Save the new wallet to the database
    const newWallet = await db.wallet.create({
      data: {
        name: walletName,
        derivationPath: nextDerivationPath,
        solPublicKey,
        solPrivateKey: JSON.stringify(encrypt(solPrivateKey)),
        ethPublicKey,
        ethPrivateKey: JSON.stringify(encrypt(ethPrivateKey)),
        userId,
      },
    });

    return NextResponse.json(newWallet);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create wallet." },
      { status: 500 }
    );
  }
}
