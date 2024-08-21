import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { createDecipheriv } from "crypto";

const encryptionKey = process.env.ENCRYPTION_KEY;
const algorithm = "aes-256-cbc";

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

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const userId = req.nextUrl.searchParams.get("userId") || undefined;
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
    return NextResponse.json(decryptedSeedPhrase);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch seed phrase." },
      { status: 500 }
    );
  }
}
