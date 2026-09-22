import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  http,
} from "viem";
import { mainnet } from "viem/chains";
import TokenBalance from "./TokenBalance";

// Adresse du contrat USDT sur Ethereum Mainnet
const USDT_ADDRESS =
  "0xdac17f958d2ee523a2206206994597c13d831ec7";

// Client permettant de lire les données d'Ethereum
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Récupère les informations du token USDT
async function getTokenInfo() {
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    client.readContract({
      address: USDT_ADDRESS,
      abi: erc20Abi,
      functionName: "name",
    }),

    client.readContract({
      address: USDT_ADDRESS,
      abi: erc20Abi,
      functionName: "symbol",
    }),

    client.readContract({
      address: USDT_ADDRESS,
      abi: erc20Abi,
      functionName: "decimals",
    }),

    client.readContract({
      address: USDT_ADDRESS,
      abi: erc20Abi,
      functionName: "totalSupply",
    }),
  ]);

  return {
    name,
    symbol,
    decimals,
    totalSupply: formatUnits(totalSupply, decimals),
  };
}

// Récupère le nombre de transferts depuis GraphQL
async function getTransferCount(): Promise<number> {
  const graphqlUrl = process.env.SQUID_GRAPHQL_URL;

  if (!graphqlUrl) {
    throw new Error("SQUID_GRAPHQL_URL est manquante");
  }

  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      query: `
        query {
          transfersConnection(orderBy: id_ASC) {
            totalCount
          }
        }
      `,
    }),

    // Évite d'utiliser une ancienne réponse
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Impossible de contacter GraphQL");
  }

  const result = await response.json();

  return result.data.transfersConnection.totalCount;
}

export default async function TokenDataPage() {
  // Récupère les informations du token et de l'indexeur
  const [token, transferCount] = await Promise.all([
    getTokenInfo(),
    getTransferCount(),
  ]);

  return (
    <main className="min-h-screen p-10">
      <h1 className="mb-6 text-3xl font-bold">Données USDT</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <p className="text-gray-500">Nom</p>
          <p className="text-2xl font-bold">{token.name}</p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-gray-500">Symbole</p>
          <p className="text-2xl font-bold">{token.symbol}</p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-gray-500">Décimales</p>
          <p className="text-2xl font-bold">{token.decimals}</p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-gray-500">Offre totale</p>

          <p className="text-2xl font-bold">
            {Number(token.totalSupply).toLocaleString()} {token.symbol}
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <p className="text-gray-500">Transferts indexés</p>
          <p className="text-2xl font-bold">{transferCount}</p>
        </div>

        {/* Solde USDT du wallet connecté */}
        <TokenBalance />
      </div>
    </main>
  );
}