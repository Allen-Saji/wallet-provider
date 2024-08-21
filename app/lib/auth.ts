import GoogleProvider from "next-auth/providers/google";
import db from "@/app/db";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import { ethers } from "ethers";
import * as bip39 from "bip39";
import { hdkey } from "ethereumjs-wallet";
import { derivePath } from "ed25519-hd-key";
import { createCipheriv, randomBytes, createDecipheriv } from "crypto";

import { Session } from "next-auth";

export interface session extends Session {
  user: {
    email: string;
    name: string;
    image: string;
    uid: string;
  };
}

// Encryption settings
const algorithm = "aes-256-cbc";
const encryptionKey =
  process.env.ENCRYPTION_KEY ?? randomBytes(32).toString("hex"); // Should be 32 bytes

// Function to encrypt data
function encrypt(text: string): { iv: string; encryptedData: string } {
  const iv = randomBytes(16); // Initialization vector
  const cipher = createCipheriv(
    algorithm,
    Buffer.from(encryptionKey, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
}

// Function to decrypt data (if needed)
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

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || "secr3t",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    session: ({ session, token }: any): session => {
      const newSession: session = session as session;
      if (newSession.user && token.uid) {
        // @ts-ignore
        newSession.user.uid = token.uid ?? "";
      }
      return newSession!;
    },
    async jwt({ token, account, profile }: any) {
      const user = await db.user.findFirst({
        where: {
          sub: account?.providerAccountId ?? "",
        },
      });
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    async signIn({ user, account, profile, email, credentials }: any) {
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) {
          return false;
        }

        const userDb = await db.user.findFirst({
          where: {
            username: email,
          },
        });

        if (userDb) {
          return true;
        }

        // Generate seed phrase
        const seedPhrase = bip39.generateMnemonic();
        const seed = await bip39.mnemonicToSeed(seedPhrase);

        // Derive Solana Wallet from seed
        const solDerivationPath = "m/44'/501'/0'/0'";
        const solDerivedSeed = derivePath(
          solDerivationPath,
          seed.toString("hex")
        ).key;
        const solKeypair = SolanaKeypair.fromSeed(solDerivedSeed);
        const solPublicKey = solKeypair.publicKey.toBase58();
        const solPrivateKey = solKeypair.secretKey.toString();

        // Derive Ethereum Wallet from seed
        const ethHdWallet = hdkey.fromMasterSeed(seed);
        const ethHdKey = ethHdWallet.derivePath("m/44'/60'/0'/0/0");
        const ethWallet = ethHdKey.getWallet();
        const ethPublicKey = ethWallet.getChecksumAddressString();
        const ethPrivateKey = ethWallet.getPrivateKeyString();

        await db.user.create({
          data: {
            username: email,
            name: profile?.name,
            profilePicture: profile?.picture,
            provider: "Google",
            sub: account.providerAccountId,
            seedPhrase: JSON.stringify(encrypt(seedPhrase)), // Store as JSON
            wallets: {
              create: [
                {
                  name: "wallet 1",
                  derivationPath: solDerivationPath,
                  solPublicKey: solPublicKey,
                  solPrivateKey: JSON.stringify(encrypt(solPrivateKey)),
                  ethPublicKey: ethPublicKey,
                  ethPrivateKey: JSON.stringify(encrypt(ethPrivateKey)),
                },
              ],
            },
          },
        });

        return true;
      }

      return false;
    },
  },
};
