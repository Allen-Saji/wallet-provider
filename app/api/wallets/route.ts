import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { getSolanaBalance, getEthereumBalance } from "@/app/lib/blockchain"; // Implement these functions

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const wallets = await db.wallet.findMany({
      where: {
        userId: userId,
      },
    });

    // Fetch balance for each wallet
    const walletsWithBalances = await Promise.all(
      wallets.map(async (wallet) => {
        const solBalance = wallet.solPublicKey
          ? await getSolanaBalance(wallet.solPublicKey)
          : 0;
        const ethBalance = wallet.ethPublicKey
          ? await getEthereumBalance(wallet.ethPublicKey)
          : 0;
        return {
          ...wallet,
          solBalance,
          ethBalance,
        };
      })
    );

    return NextResponse.json(walletsWithBalances);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch wallets" },
      { status: 500 }
    );
  }
}
