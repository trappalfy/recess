/**
 * Draft ABI for IRecessMarkets, transcribed from corrective brief §6.
 * The contract does not exist yet and no Solidity file is created at this stage.
 * This is the shape the UI is written against, so the contract stage can be
 * checked against it. Update §6 requires that revisions stay inside this file and chain.ts.
 */
export const RECESS_MARKETS_ABI = [
  {
    type: "function", name: "stake", stateMutability: "nonpayable",
    inputs: [
      { name: "marketId", type: "bytes32" },
      { name: "side", type: "uint8" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function", name: "claim", stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [{ name: "paid", type: "uint256" }],
  },
  {
    type: "function", name: "market", stateMutability: "view",
    inputs: [{ name: "marketId", type: "bytes32" }],
    outputs: [
      { name: "ticker", type: "bytes32" },
      { name: "openTime", type: "uint64" },
      { name: "lockTime", type: "uint64" },
      { name: "fridayClose", type: "int256" },
      { name: "settlePrice", type: "int256" },
      { name: "poolAbove", type: "uint256" },
      { name: "poolBelow", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "winner", type: "uint8" },
    ],
  },
  {
    type: "function", name: "positionOf", stateMutability: "view",
    inputs: [{ name: "marketId", type: "bytes32" }, { name: "user", type: "address" }],
    outputs: [
      { name: "above", type: "uint256" },
      { name: "below", type: "uint256" },
      { name: "claimed", type: "bool" },
    ],
  },
  {
    type: "event", name: "Staked",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "side", type: "uint8", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "Settled",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      { name: "settlePrice", type: "int256", indexed: false },
      { name: "winner", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event", name: "Voided",
    inputs: [{ name: "marketId", type: "bytes32", indexed: true }],
  },
  {
    type: "event", name: "Claimed",
    inputs: [
      { name: "marketId", type: "bytes32", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

/** Contract enum order, matching update §6. */
export const SIDE_INDEX = { Above: 0, Below: 1 } as const;
export const STATUS_BY_INDEX = ["Open", "Locked", "Settled", "Void"] as const;
