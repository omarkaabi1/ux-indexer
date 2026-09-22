"use client";

import {
  useBalance,
  useConnect,
  useConnection,
  useConnectors,
  useDisconnect,
} from "wagmi";
import { formatUnits } from "viem";

export default function Header() {
  // Informations sur le wallet connecté
  const { address, isConnected } = useConnection();

  // Wallets disponibles dans le navigateur
  const connectors = useConnectors();

  // Fonctions de connexion et de déconnexion
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Solde du wallet connecté
  const { data: balance } = useBalance({
    address,
  });

  return (
    <header className="flex items-center justify-between border-b p-4">
      <h1 className="text-xl font-bold">UX Indexer</h1>

      {isConnected ? (
        <div className="flex items-center gap-4">
          <div>
            <p>{address}</p>

            <p>
              {balance
                ? `${Number(
                    formatUnits(balance.value, balance.decimals)
                  ).toFixed(4)} ${balance.symbol}`
                : "Chargement..."}
            </p>
          </div>

          <button
            onClick={() => disconnect()}
            className="rounded bg-red-600 px-4 py-2 text-white"
          >
            Déconnecter
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            if (connectors[0]) {
              connect({ connector: connectors[0] });
            }
          }}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Connect Wallet
        </button>
      )}
    </header>
  );
}