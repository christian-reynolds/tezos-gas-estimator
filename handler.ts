"use strict";

import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

const Tezos = new TezosToolkit("https://mainnet.api.tez.ie/");

Tezos.setProvider({
  signer: new InMemorySigner(process.env.TEZOS_ESTIMATOR || ""),
});

const getContractMethods = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      message: "No body passed in",
    };
  }

  const { contract_address } = JSON.parse(event.body);

  if (!contract_address) {
    return {
      statusCode: 400,
      message: "You must include a contract address",
    };
  }

  try {
    const contract = await Tezos.contract.at(contract_address);

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

const estimateGasForMethod = async (event) => {
  if (!event.body) {
    return {
      statusCode: 400,
      message: "No body passed in",
    };
  }

  const { methodName, methodArguments, amount, contract_address } = JSON.parse(
    event.body
  );

  if (!methodName || !methodArguments || !contract_address) {
    return {
      statusCode: 400,
      message:
        "You must provide a contract_address, methodName, and methodArguments",
    };
  }

  try {
    const contract = await Tezos.contract.at(contract_address);
    const operation = await contract.methodsObject[methodName](
      methodArguments
    ).toTransferParams({
      amount: amount ?? 2,
    });
    console.log({ operation });
    const estimate = await Tezos.estimate.transfer(operation);

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          gasLimit: estimate.gasLimit,
          minimalFeeMutez: estimate.minimalFeeMutez,
          storageLimit: estimate.storageLimit,
          suggestedFeeMutez: estimate.suggestedFeeMutez,
          totalCost: estimate.totalCost,
          usingBaseFeeMutez: estimate.usingBaseFeeMutez,
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

export { getContractMethods, estimateGasForMethod };
