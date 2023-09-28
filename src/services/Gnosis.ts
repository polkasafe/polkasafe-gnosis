// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import SafeApiKit, {
  AllTransactionsListResponse,
  OwnerResponse,
  SafeCreationInfoResponse,
  SafeInfoResponse,
  SafeMultisigTransactionListResponse,
  SignatureResponse,
} from "@safe-global/api-kit";
import Safe, {
  SafeAccountConfig,
  SafeFactory,
  EthersAdapter,
  getSafeContract,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  // SafeTransactionDataPartial,
  TransactionResult,
  MetaTransactionOptions,
  OperationType,
  RelayTransaction,
} from "@safe-global/safe-core-sdk-types";
import { createTokenTransferParams } from "src/utils/createTokenTransaferParams";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import {
  RelayResponse,
  TransactionStatusResponse,
} from "@gelatonetwork/relay-sdk";
const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY!;
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
const gasLimit = "100000";
const options: MetaTransactionOptions = {
  gasLimit,
  isSponsored: true,
};

export class GnosisSafeService {
  ethAdapter: any;
  safeFactory: any;
  signer: any;
  safeService: SafeApiKit;

  constructor(ethersProvider: any, signer: any, txServiceURL: any) {
    this.ethAdapter = ethersProvider;
    this.signer = signer;
    this.safeService = new SafeApiKit({
      ethAdapter: this.ethAdapter,
      txServiceUrl: txServiceURL,
    });
  }

  createSafe = async (
    owners: [string],
    threshold: number
  ): Promise<string | undefined> => {
    try {
      const safeAccountConfig: SafeAccountConfig = {
        owners,
        threshold,
      };

      const safeFactory = await SafeFactory.create({
        ethAdapter: this.ethAdapter,
      });

      const safe = await safeFactory.deploySafe({
        options: {
          gasLimit: 1000000,
        },
        safeAccountConfig,
      });
      const safeAddress = await safe.getAddress();
      return safeAddress;
    } catch (err) {
      console.log("error from createSafe", err);
    }
  };

  getAllSafesByOwner = async (
    ownerAddress: string
  ): Promise<OwnerResponse | null> => {
    try {
      return await this.safeService.getSafesByOwner(ownerAddress);
    } catch (err) {
      console.log("error from getAllSafesByOwner", err);
      return null;
    }
  };

  getSafeInfoByAddress = async (
    safeAddress: string
  ): Promise<SafeInfoResponse | null> => {
    try {
      return await this.safeService.getSafeInfo(safeAddress);
    } catch (err) {
      console.log("error from getSafeInfoByAddress", err);
      return null;
    }
  };

  confirmTxByHash = async (
    txHash: string,
    signature: any
  ): Promise<SignatureResponse | null> => {
    try {
      return await this.safeService.confirmTransaction(txHash, signature);
    } catch (err) {
      console.log("error from confirmTxByHash", err);
      return null;
    }
  };

  getSafeCreationInfo = async (
    safeAddress: string
  ): Promise<SafeCreationInfoResponse | null> => {
    try {
      return await this.safeService.getSafeCreationInfo(safeAddress);
    } catch (err) {
      console.log("error from getSafeCreationInfo", err);
      return null;
    }
  };

  createSafeTx = async (
    multisigAddress: string,
    to: string[],
    value: string[],
    senderAddress: string,
    note?: string
  ): Promise<string | null> => {
    try {
      console.log("in create safe tx");
      const safeSdk = await Safe.create({
        ethAdapter: this.ethAdapter,
        isL1SafeMasterCopy: true,
        safeAddress: multisigAddress,
      });
      console.log("after safe sdk");
      const signer = await this.ethAdapter.getSignerAddress();
      console.log("after signer");

      console.log("after signer", signer);

      const safeTransactionData: MetaTransactionData[] =
        createTokenTransferParams(to, value);

      console.log("safe tx", safeTransactionData);
      if (note) console.log(note);

      const safeTransaction = await safeSdk.createTransaction({
        safeTransactionData,
      });
      const ownerAddresses = await safeSdk.getOwners();
      console.log(ownerAddresses);
      console.log(safeTransaction);
      const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
      let signature = (await safeSdk.signTransaction(safeTransaction)) as any;

      signature = Object.fromEntries(signature.signatures.entries());
      console.log(
        multisigAddress,
        safeTransaction.data,
        safeTxHash,
        senderAddress,
        signature[signer.toLowerCase()].data
      );
      await this.safeService.proposeTransaction({
        safeAddress: multisigAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress,
        senderSignature: signature[signer.toLowerCase()].data,
      });

      return safeTxHash;
    } catch (err) {
      console.log(err);
      // console.log('error from createSafeTx', err);
      return null;
    }
  };

  createAddOwner = async (
    multisigAddress: string,
    senderAddress: string,
    ownerAddress: string,
    threshold: number
  ): Promise<string | null> => {
    try {
      const safeSdk = await Safe.create({
        ethAdapter: this.ethAdapter,
        isL1SafeMasterCopy: true,
        safeAddress: multisigAddress,
      });
      const signer = await this.ethAdapter.getSignerAddress();
      const safeTransaction = await safeSdk.createAddOwnerTx({
        ownerAddress,
        threshold,
      });
      console.log(safeTransaction);
      const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
      let signature = (await safeSdk.signTransaction(safeTransaction)) as any;
      console.log(signature);
      signature = Object.fromEntries(signature.signatures.entries());
      console.log(
        multisigAddress,
        safeTransaction.data,
        safeTxHash,
        senderAddress,
        signature[signer.toLowerCase()].data
      );
      await this.safeService.proposeTransaction({
        safeAddress: multisigAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress,
        senderSignature: signature[signer.toLowerCase()].data,
      });
      return safeTxHash;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  createRemoveOwner = async (
    multisigAddress: string,
    senderAddress: string,
    ownerAddress: string,
    threshold: number
  ): Promise<string | null> => {
    try {
      const safeSdk = await Safe.create({
        ethAdapter: this.ethAdapter,
        isL1SafeMasterCopy: true,
        safeAddress: multisigAddress,
      });
      const signer = await this.ethAdapter.getSignerAddress();

      const safeTransaction = await safeSdk.createRemoveOwnerTx({
        ownerAddress,
        threshold,
      });
      const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
      let signature = (await safeSdk.signTransaction(safeTransaction)) as any;

      signature = Object.fromEntries(signature.signatures.entries());
      console.log(
        multisigAddress,
        safeTransaction.data,
        safeTxHash,
        senderAddress,
        signature[signer.toLowerCase()].data
      );
      await this.safeService.proposeTransaction({
        safeAddress: multisigAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress,
        senderSignature: signature[signer.toLowerCase()].data,
      });
      return safeTxHash;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  getPendingTx = async (
    multisigAddress: string
  ): Promise<SafeMultisigTransactionListResponse> => {
    const data = await this.safeService.getPendingTransactions(multisigAddress);
    return data;
  };

  getAllTx = async (
    multisigAddress: string,
    options: any = {}
  ): Promise<AllTransactionsListResponse> => {
    const data = await this.safeService.getAllTransactions(
      multisigAddress,
      options
    );
    return data;
  };

  signAndConfirmTx = async (
    txHash: string,
    multisig: string
  ): Promise<SignatureResponse | null> => {
    try {
      const signer = await this.ethAdapter.getSignerAddress();
      const safeSdk = await Safe.create({
        ethAdapter: this.ethAdapter,
        isL1SafeMasterCopy: true,
        safeAddress: multisig,
      });
      const safeTransaction = await this.safeService.getTransaction(txHash);
      let signature = (await safeSdk.signTransaction(safeTransaction)) as any;
      signature = Object.fromEntries(signature.signatures.entries());
      return await this.safeService.confirmTransaction(
        txHash,
        signature[signer.toLowerCase()].data
      );
    } catch (err) {
      console.log("error from signAndConfirmTx", err);
      return null;
    }
  };

  executeTx = async (
    txHash: string,
    multisig: string
  ): Promise<{ data: TransactionResult | null; error: string | null }> => {
    try {
      console.log({
        ethAdapter: this.ethAdapter,
        isL1SafeMasterCopy: true,
        safeAddress: multisig,
      });
      const safeSdk = await Safe.create({
        ethAdapter: this.ethAdapter,
        isL1SafeMasterCopy: true,
        safeAddress: multisig,
      });
      const safeTransaction = await this.safeService.getTransaction(txHash);
      const executeTxResponse = await safeSdk.executeTransaction(
        safeTransaction
      );
      return { data: executeTxResponse, error: null };
    } catch (err) {
      console.log("error from executeTx", err);
      return { data: null, error: err.message || "Something went wrong" };
    }
  };

  getMultisigData = async (
    multisigAddress: string
  ): Promise<SafeInfoResponse | null> => {
    try {
      const info = await this.safeService.getSafeInfo(multisigAddress);
      return info;
    } catch (err) {
      console.log("error from getMultisigData", err);
      return null;
    }
  };

  relayTransaction = async (
    multisigAddress: string,
    chainId: number,
    signature: any
  ): Promise<RelayResponse | null> => {
    try {
      console.log("relay transaction");
      const safeSdk = await Safe.create({
        ethAdapter: this.ethAdapter,
        isL1SafeMasterCopy: true,
        safeAddress: multisigAddress,
      });
      console.log("after safe sdk");
      const relayKit = new GelatoRelayPack(GELATO_RELAY_API_KEY);
      const signer = await this.ethAdapter.getSignerAddress();
      console.log("after signer");

      console.log("after signer", signer);

      const contractVersion = safeSdk.getContractVersion();
      const safeSingletonContract = await getSafeContract({
        ethAdapter: this.ethAdapter,
        safeVersion: await contractVersion,
      });
      
      signature = Object.fromEntries(signature.signatures.entries());

      const signedSafeTx = signature[signer.toLowerCase()].data;

      const encodedTx = safeSingletonContract.encode("execTransaction", [
        signedSafeTx.data.to,
        signedSafeTx.data.value,
        signedSafeTx.data.data,
        signedSafeTx.data.operation,
        signedSafeTx.data.safeTxGas,
        signedSafeTx.data.baseGas,
        signedSafeTx.data.gasPrice,
        signedSafeTx.data.gasToken,
        signedSafeTx.data.refundReceiver,
        signedSafeTx.encodedSignatures(),
      ]);

      const relayTransaction: RelayTransaction = {
        target: multisigAddress,
        encodedTransaction: encodedTx, // replace with the encoded transaction
        chainId: chainId,
        options: {}, // replace with the options
      };

      const response = await relayKit.relayTransaction(relayTransaction);
      return response;
    } catch (err) {
      console.log(err);
      // console.log('error from createSafeTx', err);
      return null;
    }
  };
}
