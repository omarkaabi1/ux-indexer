"use client";

import {
  useBlock,
  useBlockNumber,
  useChainId,
  useConnection,
  useGasPrice,
  useSwitchChain,
} from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { formatEther, formatGwei } from "viem";

export default function ChainInfoPage() {
  // Réseau actuellement sélectionné
  const chainId = useChainId();

  // Vérifie si le wallet est connecté
  const { isConnected } = useConnection();

  // Permet de changer de réseau
  const switchChain = useSwitchChain();

  // Vérifie si le réseau est autorisé
  const isWrongChain =
    isConnected &&
    chainId !== mainnet.id &&
    chainId !== sepolia.id;

  // Numéro du dernier bloc
  const { data: blockNumber, isLoading: blockNumberLoading } =
    useBlockNumber({
      chainId,
      watch: true,
    });

  // Informations du dernier bloc
  const { data: block, isLoading: blockLoading } = useBlock({
    chainId,
    blockNumber,
  });

  // Prix actuel du gas
  const { data: gasPrice, isLoading: gasPriceLoading } =
    useGasPrice({
      chainId,
    });

  // Frais brûlés = gas utilisé × base fee
  const burntFees =
    block && block.baseFeePerGas !== null
      ? block.gasUsed * block.baseFeePerGas
      : undefined;

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Informations de la blockchain
      </h1>

      {/* Message affiché si le réseau n'est pas autorisé */}
      {isWrongChain && (
        <div className="mb-6 rounded bg-red-100 p-4 text-red-700">
          Réseau non supporté. Choisissez Mainnet ou Sepolia.
        </div>
      )}

      {/* Boutons permettant de changer de réseau */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() =>
            switchChain.mutate({ chainId: mainnet.id })
          }
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Passer sur Mainnet
        </button>

        <button
          onClick={() =>
            switchChain.mutate({ chainId: sepolia.id })
          }
          className="rounded bg-purple-600 px-4 py-2 text-white"
        >
          Passer sur Sepolia
        </button>
      </div>

      <div className="space-y-3">
        <p>
          <strong>Chain ID :</strong> {chainId}
        </p>

        <p>
          <strong>Dernier bloc :</strong>{" "}
          {blockNumberLoading
            ? "Chargement..."
            : blockNumber?.toString()}
        </p>

        <p>
          <strong>Hash du bloc :</strong>{" "}
          {blockLoading ? "Chargement..." : block?.hash}
        </p>

        <p>
          <strong>Gas utilisé :</strong>{" "}
          {blockLoading
            ? "Chargement..."
            : block?.gasUsed.toString()}
        </p>

        <p>
          <strong>Prix du gas :</strong>{" "}
          {gasPriceLoading || !gasPrice
            ? "Chargement..."
            : `${formatGwei(gasPrice)} Gwei`}
        </p>

        <p>
          <strong>Frais brûlés :</strong>{" "}
          {burntFees !== undefined
            ? `${formatEther(burntFees)} ETH`
            : "Non disponible"}
        </p>
      </div>
    </main>
  );
}