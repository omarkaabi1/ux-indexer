import { run } from "@subsquid/batch-processor";
import { DataSourceBuilder } from "@subsquid/evm-stream";
import { augmentBlock } from "@subsquid/evm-objects";
import { TypeormDatabase } from "@subsquid/typeorm-store";
import * as usdtAbi from "./abi/usdt";
import { Transfer } from "./model";

// Adresse du contrat USDT sur Ethereum Mainnet
const USDT_ADDRESS =
  "0xdac17f958d2ee523a2206206994597c13d831ec7";

// Configuration des données récupérées depuis SQD
const dataSource = new DataSourceBuilder()
  .setPortal("https://portal.sqd.dev/datasets/ethereum-mainnet")

  // Petite plage de blocs pour garder le test rapide
  .setBlockRange({
    from: 20_000_000,
    to: 20_001_000,
  })

  // Champs nécessaires au décodage des événements
  .setFields({
    log: {
      topics: true,
      data: true,
    },
  })

  // Récupère uniquement les événements Transfer d'USDT
  .addLog({
    where: {
      address: [USDT_ADDRESS],
      topic0: [usdtAbi.events.Transfer.topic],
    },
  })
  .build();

// Connexion à PostgreSQL
const database = new TypeormDatabase({
  supportHotBlocks: true,
});

// Lancement de l'indexeur
run(dataSource, database, async (context) => {
  const blocks = context.blocks.map(augmentBlock);
  const transfers: Transfer[] = [];

  // Parcourt les blocs et leurs événements
  for (const block of blocks) {
    for (const log of block.logs) {
      // Décode l'événement Transfer
      const { from, to, value } =
        usdtAbi.events.Transfer.decode(log);

      // Prépare les données à enregistrer
      transfers.push(
        new Transfer({
          id: log.id,
          from,
          to,
          value,
        })
      );
    }
  }

  // Enregistre les transferts dans PostgreSQL
  await context.store.insert(transfers);
});