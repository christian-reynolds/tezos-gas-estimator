"use strict";

import BigNumber from "bignumber.js";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";

const Tezos = new TezosToolkit("https://mainnet.api.tez.ie/");

Tezos.setProvider({
  signer: new InMemorySigner(process.env.PRIVATE_KEY || ""),
});

const getContractMethods = async () => {
  try {
    const contract = await Tezos.contract.at(CONTRACT_ADDRESS);

    let methods = contract.parameterSchema.ExtractSignatures();
    return {
      statusCode: 200,
      body: JSON.stringify(methods, null, 2),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

const estimateGasForMint = async () => {
  try {
    const contract = await Tezos.contract.at(CONTRACT_ADDRESS);
    const operation = await contract.methodsObject
      .mint({
        issuer_id: 21113,
      })
      .toTransferParams({
        amount: 2,
      });
    console.log({ operation });
    const estimate = await Tezos.estimate.transfer(operation);

    return {
      statusCode: 200,
      body: JSON.stringify({
        gasLimit: estimate.gasLimit,
        minimalFeeMutez: estimate.minimalFeeMutez,
        storageLimit: estimate.storageLimit,
        suggestedFeeMutez: estimate.suggestedFeeMutez,
        totalCost: estimate.totalCost,
        usingBaseFeeMutez: estimate.usingBaseFeeMutez,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

export { getContractMethods, estimateGasForMint };
