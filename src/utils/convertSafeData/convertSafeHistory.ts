// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export interface IHistoryTransactions {
    amount_token: string
    created_at: Date
    data: string
    executed: boolean
    network: string
    safeAddress: string
    signatures: Array<{address: string, signature:string}>,
    to: string
    txHash: string
    type: string
	executor: string
}
export const convertSafeHistoryData = (data:any) => {
	const convertedData:IHistoryTransactions = {
		amount_token: data?.value || '0',
		created_at: data?.executionDate || '',
		data: data.data,
		executed: data.isExecuted,
		executor: data?.executor || data?.from,
		network: data.network,
		safeAddress:data.safe,
		signatures:data?.confirmations?.map((user:any) => ({ address:user?.owner || '', signature:user?.signature|| '' })) || [],
		to:data.to,
		txHash:data.safeTxHash || data.txHash,
		type: data?.dataDecoded?.method || data.txType || 'Sent'
	};
	return convertedData;
};