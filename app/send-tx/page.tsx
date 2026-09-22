"use client";

import { useState } from "react";
import {
  type BaseError,
  useConnection,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { isAddress, parseEther } from "viem";

export default function SendTransactionPage() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [validationError, setValidationError] = useState("");

  // Vérifie si un wallet est connecté
  const { isConnected } = useConnection();

  // Envoie la transaction et récupère son hash ou son erreur
  const {
    data: hash,
    error: transactionError,
    isPending,
    sendTransaction,
  } = useSendTransaction();

  // Attend la confirmation de la transaction
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });

  function handleSend() {
    setValidationError("");

    if (!isConnected) {
      setValidationError("Connectez votre wallet.");
      return;
    }

    if (!isAddress(recipient)) {
      setValidationError("L'adresse du destinataire est invalide.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setValidationError("Le montant doit être supérieur à zéro.");
      return;
    }

    // Envoie la transaction après conversion des ETH en Wei
    sendTransaction({
      to: recipient,
      value: parseEther(amount),
    });
  }

  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="mb-6 text-2xl font-bold">
        Envoyer des ETH
      </h1>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block">
            Adresse du destinataire
          </label>

          <input
            type="text"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="0x..."
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-1 block">
            Montant en ETH
          </label>

          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.001"
            className="w-full rounded border p-3"
          />
        </div>

        {validationError && (
          <p className="text-red-600">{validationError}</p>
        )}

        {transactionError && (
          <p className="text-red-600">
            Erreur :{" "}
            {(transactionError as BaseError).shortMessage ||
              transactionError.message}
          </p>
        )}

        <button
          onClick={handleSend}
          disabled={isPending}
          className="w-full rounded bg-blue-600 p-3 text-white disabled:bg-gray-400"
        >
          {isPending ? "Confirmation dans MetaMask..." : "Envoyer"}
        </button>

        {hash && (
          <p className="break-all">
            <strong>Hash :</strong> {hash}
          </p>
        )}

        {isConfirming && <p>Transaction en attente...</p>}

        {isConfirmed && (
          <p className="text-green-600">
            Transaction confirmée avec succès.
          </p>
        )}
      </div>
    </main>
  );
}