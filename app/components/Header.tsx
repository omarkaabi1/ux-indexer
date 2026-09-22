"use client";

// Hooks fournis par Wagmi
import {
  useBalance,
  useConnect,
  useConnection,
  useConnectors,
  useDisconnect,
} from "wagmi";

export default function Header() {
  // Récupère l'adresse et l'état de connexion du wallet
  const { address, isConnected } = useConnection();

  // Récupère les wallets disponibles, par exemple MetaMask
  const connectors = useConnectors();

  // Fonction permettant de connecter un wallet
  const { connect } = useConnect();

  // Fonction permettant de déconnecter le wallet
  const { disconnect } = useDisconnect();

  // Récupère le solde ETH de l'adresse connectée
  const { data: balance } = useBalance({
    address,
  });

  return (
    <header className="flex items-center justify-between border-b p-4">
      <h1 className="text-xl font-bold">UX Indexer</h1>

      {/* Si le wallet est connecté */}
      {isConnected ? (
        <div className="flex items-center gap-4">
          <div>
            {/* Adresse du wallet */}
            <p>{address}</p>

            {/* Solde du wallet, limité à 4 chiffres après la virgule */}
            <p>
              {balance
                ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
                : "Chargement..."}
            </p>
          </div>

          {/* Déconnexion du wallet */}
          <button
            onClick={() => disconnect()}
            className="rounded bg-red-600 px-4 py-2 text-white"
          >
            Déconnecter
          </button>
        </div>
      ) : (
        // Si aucun wallet n'est connecté
        <button
          onClick={() => {
            // Connecte le premier wallet disponible
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