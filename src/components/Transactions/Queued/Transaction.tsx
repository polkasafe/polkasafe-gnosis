// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse, Divider, Skeleton } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { IQueueItem, ITransaction, ITxNotification, NotificationStatus } from 'src/types';
import {
	ArrowUpRightIcon,
	CircleArrowDownIcon,
	CircleArrowUpIcon
} from 'src/ui-components/CustomIcons';
import LoadingModal from 'src/ui-components/LoadingModal';
import queueNotification from 'src/ui-components/QueueNotification';

import SentInfo from './SentInfo';

interface ITransactionProps {
  status: 'Approval' | 'Cancelled' | 'Executed';
  date: Date;
  approvals: string[];
  threshold: number;
  callData: string;
  callHash: string;
  note: string;
  refetch?: () => void;
  setQueuedTransactions?: React.Dispatch<React.SetStateAction<IQueueItem[]>>;
  numberOfTransactions: number;
  notifications?: ITxNotification;
  value: string;
  onAfterApprove?: any;
  onAfterExecute?: any;
  txType?: any;
  recipientAddress?:string
}

const Transaction: FC<ITransactionProps> = ({
	approvals,
	callData,
	callHash,
	date,
	threshold,
	notifications,
	value,
	onAfterApprove,
	onAfterExecute,
	txType,
	recipientAddress
}) => {
	const { activeMultisig, address, gnosisSafe } = useGlobalUserDetailsContext();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [failure, setFailure] = useState(false);
	const [getMultiDataLoading] = useState(false);
	const [loadingMessages, setLoadingMessage] = useState('');
	const [openLoadingModal, setOpenLoadingModal] = useState(false);
	const { network } = useGlobalApiContext();

	const [decodedCallData, setDecodedCallData] = useState<any>({});

	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const [callDataString, setCallDataString] = useState<string>(callData || '');
	const [transactionDetails, setTransactionDetails] = useState<ITransaction>({} as any);
	const token = chainProperties[network].ticker;
	const location = useLocation();
	const hash = location.hash.slice(1);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [transactionDetailsLoading, setTransactionDetailsLoading] = useState<boolean>(false);

	const getTransactionNote = useCallback(async () => {

		setTransactionDetailsLoading(true);
		const getTransactionDetailsRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getTransactionNote`, {
			body: JSON.stringify({ callHash }),
			headers: firebaseFunctionsHeader(network),
			method: 'POST'
		});

		const { data: getTransactionData, error: getTransactionErr } = await getTransactionDetailsRes.json() as { data: ITransaction, error: string };
		if(!getTransactionErr && getTransactionData) {
			setTransactionDetails(getTransactionData);
		}
		setTransactionDetailsLoading(false);
	}, [callHash, network]);
	useEffect(() => {
		getTransactionNote();
	},[getTransactionNote]);

	useEffect(() => {
		if(!callData) return;
		gnosisSafe.safeService.decodeData(callData).then((res) => setDecodedCallData(res)).catch((e) => console.log(e));
	}, [callData, gnosisSafe]);

	const handleApproveTransaction = async () => {
		setLoading(true);
		try {
			const response = await gnosisSafe.signAndConfirmTx(
				callHash,
				activeMultisig
			);
			if (response) {
				const updateTx = {
					signer: address,
					txHash: callHash,
					txSignature: response
				};
				fetch(`${FIREBASE_FUNCTIONS_URL}/updateTransaction`, {
					body: JSON.stringify(updateTx),
					headers: {
						Accept: 'application/json',
						'Acess-Control-Allow-Origin': '*',
						'Content-Type': 'application/json',
						'x-address': address,
						'x-api-key': '47c058d8-2ddc-421e-aeb5-e2aa99001949',
						'x-signature': localStorage.getItem('signature')!,
						'x-source': 'polkasafe'
					},
					method: 'POST'
				});
				onAfterApprove(callHash);
				setSuccess(true);
				setLoadingMessage('Transaction Signed Successfully.');
				queueNotification({
					header: 'Success!',
					message: 'Transaction Approved',
					status: NotificationStatus.SUCCESS
				});
			}
		} catch (error) {
			console.log(error);
			setFailure(true);
			setLoadingMessage('Something went wrong! Please try again.');
			queueNotification({
				header: 'Error!',
				message: 'Error in Approving the transaction',
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);
	};

	const handleExecuteTransaction = async () => {
		setLoading(true);
		try {
			const { data: response, error } = await gnosisSafe.executeTx(
				callHash,
				activeMultisig
			);
			if (error) {
				queueNotification({
					header: 'Execution Failed',
					message: error,
					status: NotificationStatus.ERROR
				});
			}
			if (response) {
				queueNotification({
					header: 'Execution started',
					message: 'Your transaction is executing, it might take a bit time.',
					status: NotificationStatus.INFO
				});
				await response.transactionResponse?.wait();
				const completeTx = {
					receipt: response || {},
					txHash: callHash
				};
				fetch(`${FIREBASE_FUNCTIONS_URL}/completeTransaction`, {
					body: JSON.stringify(completeTx),
					headers: {
						Accept: 'application/json',
						'Acess-Control-Allow-Origin': '*',
						'Content-Type': 'application/json',
						'x-address': address,
						'x-api-key': '47c058d8-2ddc-421e-aeb5-e2aa99001949',
						'x-network': network,
						'x-signature': localStorage.getItem('signature')!,
						'x-source': 'polkasafe'
					},
					method: 'POST'
				});
				onAfterExecute(callHash);
				queueNotification({
					header: 'Transaction Executed',
					message: 'Your transaction has been executed successfully.',
					status: NotificationStatus.SUCCESS
				});
				setSuccess(true);
			}
		} catch (error) {
			console.log(error);
			setFailure(true);
			setLoadingMessage('Something went wrong! Please try again.');
			queueNotification({
				header: 'Something went wrong! Please try again.',
				message: error.message || error,
				status: NotificationStatus.ERROR
			});
		}
		setLoading(false);
	};

	return (
		<>
			<Collapse
				className='bg-bg-secondary rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left'
				bordered={false}
				defaultActiveKey={[`${hash}`]}
			>
				<Collapse.Panel
					showArrow={false}
					key={`${callHash}`}
					header={
						getMultiDataLoading ? (
							<Skeleton active paragraph={{ rows: 0 }} />
						) : (
							<div
								onClick={() => {
									toggleTransactionVisible(!transactionInfoVisible);
								}}
								className={classNames(
									'grid items-center grid-cols-9 cursor-pointer text-white font-normal text-sm leading-[15px]'
								)}
							>
								<p className='col-span-3 flex items-center gap-x-3'>
									<span
										className={`flex items-center justify-center w-9 h-9 ${
											txType === 'addOwnerWithThreshold'
											||  txType === 'removeOwner'
												? 'bg-[#FF79F2] text-[#FF79F2]'
												: 'bg-success text-red-500'
										} bg-opacity-10 p-[10px] rounded-lg`}
									>
										<ArrowUpRightIcon />
									</span>

									<span>
										{txType === 'addOwnerWithThreshold'
											? 'Adding new owner'
											: txType === 'removeOwner'
												? 'Removing new owner'
												: txType === 'Sent' || txType === 'transfer'
													? 'Sent'
													: 'Custom Transaction'}
									</span>
								</p>
								{!(txType === 'addOwnerWithThreshold' ||  txType === 'removeOwner')
								&& <p className='col-span-2 flex items-center gap-x-[6px]'>
									<ParachainIcon src={chainProperties[network].logo} />
									<span
										className={
											'font-normal text-xs leading-[13px] text-failure'
										}
									>
										{ethers.utils.formatEther(transactionDetails.amount_token || value).toString()} {token}
									</span>
								</p>}
								<p className='col-span-2'>{dayjs(date).format('lll')}</p>
								<p
									className={`${
										txType === 'addOwnerWithThreshold'
										||  txType === 'removeOwner'
											? 'col-span-4'
											: 'col-span-2'
									} flex items-center justify-end gap-x-4`}
								>
									<span className='text-waiting'>
										{!approvals.includes(address) && 'Awaiting your Confirmation'} ({approvals.length}/{threshold})
									</span>
									<span className='text-white text-sm'>
										{transactionInfoVisible ? (
											<CircleArrowUpIcon />
										) : (
											<CircleArrowDownIcon />
										)}
									</span>
								</p>
							</div>
						)
					}
				>
					<LoadingModal
						message={loadingMessages}
						loading={loading}
						success={success}
						failed={failure}
						open={openLoadingModal}
						onCancel={() => setOpenLoadingModal(false)}
					/>

					<div>
						<Divider className='bg-text_secondary my-5' />
						<SentInfo
							amount={decodedCallData.method === 'multiSend' ? decodedCallData?.parameters?.[0]?.valueDecoded?.map((item: any) => item.value) : value}
							callHash={callHash}
							callDataString={callDataString}
							callData={callData}
							date={date}
							approvals={approvals}
							threshold={threshold}
							loading={loading}
							getMultiDataLoading={getMultiDataLoading}
							recipientAddress={decodedCallData.method === 'multiSend' ? decodedCallData?.parameters?.[0]?.valueDecoded?.map((item: any) => item.to) : recipientAddress || ''}
							setCallDataString={setCallDataString}
							handleApproveTransaction={handleApproveTransaction}
							handleExecuteTransaction={handleExecuteTransaction}
							handleCancelTransaction={async () => {}}
							note={transactionDetails.note || ''}
							isProxyApproval={false}
							isProxyAddApproval={false}
							delegate_id={''}
							isProxyRemovalApproval={false}
							notifications={notifications}
							txType={txType}
							transactionFields={transactionDetails.transactionFields}
							transactionDetailsLoading={transactionDetailsLoading}
						/>
					</div>
				</Collapse.Panel>
			</Collapse>
		</>
	);
};

export default Transaction;
