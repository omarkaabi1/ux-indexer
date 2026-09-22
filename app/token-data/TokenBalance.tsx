"use client";

import { useAccount, useReadContract } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { mainnet } from "viem/chains";

// Adresse du contrat USDT sur Ethereum Mainnet
const USDT_ADDRESS =
  "0xdac17f958d2ee523a2206206994597c13d831ec7";

export default function TokenBalance() {
  // Récupère l'adresse connectée avec MetaMask
  const { address, isConnected } = useAccount();

  // Lit le solde USDT de l'adresse connectée
  const { data: balance, isLoading } = useReadContract({
    address: USDT_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,

    // USDT est lu sur Ethereum Mainnet
    chainId: mainnet.id,

    query: {
      // La requête démarre uniquement si une adresse existe
      enabled: Boolean(address),
    },
  });

  if (!isConnected) {
    return (
      <div className="rounded-lg border p-6">
        Connecte ton wallet pour voir ton solde USDT.
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6">
      <p className="text-gray-500">Mon solde USDT</p>

      <p className="text-2xl font-bold">
        {isLoading
          ? "Chargement..."
          : `${formatUnits(balance ?? 0n, 6)} USDT`}
      </p>
    </div>
  );
}