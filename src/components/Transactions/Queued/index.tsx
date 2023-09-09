// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import Loader from 'src/ui-components/Loader';
import { convertSafePendingData } from 'src/utils/convertSafeData/convertSafePending';
import updateDB, { UpdateDB } from 'src/utils/updateDB';

import NoTransactionsQueued from './NoTransactionsQueued';
import Transaction from './Transaction';

const LocalizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(LocalizedFormat);

interface IQueued {
	loading: boolean
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	refetch: boolean
	setRefetch: React.Dispatch<React.SetStateAction<boolean>>
}

const Queued: FC<IQueued> = () => {
	const { address, activeMultisig, setActiveMultisigData, activeMultisigData, safeService } = useGlobalUserDetailsContext();
	const [queuedTransactions, setQueuedTransactions] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const location = useLocation();
	const [refetch, setRefetch] = useState<boolean>(false);
	const { network } = useGlobalApiContext();

	const handleAfterApprove = (callHash:string) => {
		const payload = queuedTransactions.map(queue => {
			return queue.txHash === callHash ? { ...queue, signatures:[...(queue.signatures || []), { address }] } : queue;
		});
		setQueuedTransactions(payload);
	};

	const handleAfterExecute = (callHash:string) => {
		let transaction:any = null;
		const payload = queuedTransactions.filter(queue => {
			if(queue.txHash === callHash){
				transaction = queue;
			}
			return queue.txHash !== callHash;
		});
		if(transaction){
			if(transaction.type === 'addOwnerWithThreshold'){
				const [addedAddress, newThreshold] = transaction.dataDecoded.parameters;
				const payload = {
					...activeMultisigData,
					signatories:[...activeMultisigData.signatories, addedAddress.value],
					threshold: newThreshold.value
				};
				setActiveMultisigData(payload);
				updateDB(UpdateDB.Update_Multisig, { multisig: payload }, address, network);
			}
			else if(transaction.type === 'removeOwner'){
				const [,removedAddress, newThreshold] = transaction.dataDecoded.parameters;
				const payload = {
					...activeMultisigData,
					signatories: activeMultisigData.signatories.filter((address: string) => address !== removedAddress.value),
					threshold: newThreshold.value
				};
				setActiveMultisigData(payload);
				updateDB(UpdateDB.Update_Multisig, { multisig: payload }, address, network);
			}
		}
		setQueuedTransactions(payload);
	};

	useEffect(() => {
		const hash = location.hash.slice(1);
		const elem = document.getElementById(hash);
		if (elem) {
			elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [location.hash, queuedTransactions]);

	useEffect(() => {
		if(!safeService){
			console.log('retiring');
			return;
		}
		(async () => {
			setLoading(true);
			try {
				const safeData = await safeService.getPendingTx(
					activeMultisig
				);
				const convertedData = safeData.results.map((safe:any) => convertSafePendingData({ ...safe, network }));
				setQueuedTransactions(convertedData);
				if(convertedData?.length > 0)
					updateDB(UpdateDB.Update_Pending_Transaction, { transactions: convertedData }, address, network);
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		})();
	}, [activeMultisig, address, network, refetch, safeService]);

	if (loading) {
		return (
			<div className='h-full'>
				<Loader size='large' />
			</div>
		);
	}

	return (
		<>
			{(queuedTransactions && queuedTransactions.length > 0) ? <div className='flex flex-col gap-y-[10px]'>
				{queuedTransactions.sort((a, b) => dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? 1 : -1).map((transaction) => {
					return <section id={transaction.txHash} key={transaction.txHash}>
						<Transaction
							value={transaction.amount_token}
							setQueuedTransactions={setQueuedTransactions}
							date={new Date(transaction.created_at).toLocaleString()}
							status={transaction.isExecuted ? 'Executed' : 'Approval'}
							approvals={transaction.signatures ? transaction.signatures.map((item: any) => item.address) : []}
							threshold={activeMultisigData?.threshold || 0}
							callData={transaction.data}
							callHash={transaction.txHash}
							note={transaction.note || ''}
							refetch={() => setRefetch(prev => !prev)}
							onAfterApprove={handleAfterApprove}
							onAfterExecute={handleAfterExecute}
							amountUSD={'0'}
							numberOfTransactions={queuedTransactions.length || 0}
							notifications={transaction?.notifications || {}}
							txType={transaction.type}
							recipientAddress={transaction.to}
						/>
					</section>;
				})}
			</div> : <NoTransactionsQueued />}
		</>
	);
};

export default Queued;