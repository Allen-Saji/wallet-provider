import axios from "axios";
import WalletComponent from "@/app/components/WalletComponent";
import { createDecipheriv } from "crypto";
import WalletActions from "@/app/components/WalletActions";

const encryptionKey = process.env.ENCRYPTION_KEY;
const algorithm = "aes-256-cbc";

async function fetchWallets(userId: string) {
  const response = await axios.get(
    `http://localhost:3000/api/wallets?userId=${userId}`
  );
  return response.data;
}

function decrypt(encrypted: { iv: string; encryptedData: string }): string {
  if (encryptionKey) {
    const decipher = createDecipheriv(
      algorithm,
      Buffer.from(encryptionKey, "hex"),
      Buffer.from(encrypted.iv, "hex")
    );
    let decrypted = decipher.update(encrypted.encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } else {
    return "";
  }
}

export default async function Page({ params }: { params: { uid: string } }) {
  const wallets = await fetchWallets(params.uid);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-purple-300 mb-6">Your Wallets</h1>
      <WalletActions />
      {wallets && wallets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet: any) => (
            <WalletComponent
              key={wallet.id}
              name={wallet.name}
              solPublicKey={wallet.solPublicKey}
              solPrivateKey={decrypt(JSON.parse(wallet.solPrivateKey))}
              ethPublicKey={wallet.ethPublicKey}
              ethPrivateKey={decrypt(JSON.parse(wallet.ethPrivateKey))}
              solBalance={wallet.solBalance}
              ethBalance={wallet.ethBalance}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No wallets found.</p>
      )}
    </div>
  );
}
