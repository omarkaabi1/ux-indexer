"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const batch_processor_1 = require("@subsquid/batch-processor");
const evm_stream_1 = require("@subsquid/evm-stream");
const evm_objects_1 = require("@subsquid/evm-objects");
const typeorm_store_1 = require("@subsquid/typeorm-store");
const usdtAbi = __importStar(require("./abi/usdt"));
const model_1 = require("./model");
// Adresse du contrat USDT sur Ethereum Mainnet
const USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";
// Configuration des données récupérées depuis SQD
const dataSource = new evm_stream_1.DataSourceBuilder()
    .setPortal("https://portal.sqd.dev/datasets/ethereum-mainnet")
    // Petite plage de blocs pour garder le test rapide
    .setBlockRange({
    from: 20000000,
    to: 20001000,
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
const database = new typeorm_store_1.TypeormDatabase({
    supportHotBlocks: true,
});
// Lancement de l'indexeur
(0, batch_processor_1.run)(dataSource, database, async (context) => {
    const blocks = context.blocks.map(evm_objects_1.augmentBlock);
    const transfers = [];
    // Parcourt les blocs et leurs événements
    for (const block of blocks) {
        for (const log of block.logs) {
            // Décode l'événement Transfer
            const { from, to, value } = usdtAbi.events.Transfer.decode(log);
            // Prépare les données à enregistrer
            transfers.push(new model_1.Transfer({
                id: log.id,
                from,
                to,
                value,
            }));
        }
    }
    // Enregistre les transferts dans PostgreSQL
    await context.store.insert(transfers);
});
