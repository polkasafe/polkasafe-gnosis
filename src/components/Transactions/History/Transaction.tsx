// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Collapse, Divider } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import React, { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ParachainIcon } from 'src/components/NetworksDropdown';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { ITransaction } from 'src/types';
import { ArrowDownLeftIcon, ArrowUpRightIcon, CircleArrowDownIcon, CircleArrowUpIcon } from 'src/ui-components/CustomIcons';

import ReceivedInfo from './ReceivedInfo';
import SentInfo from './SentInfo';

const LocalizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(LocalizedFormat);

const Transaction: FC<ITransaction> = ({ amount_token, token, created_at, to, from, txHash, amount_usd, type, executor }) => {
	const { network } = useGlobalApiContext();
	const [transactionInfoVisible, toggleTransactionVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const [note, setNote] = useState<string>('');
	const location = useLocation();
	const hash = location.hash.slice(1);
	const isSentType =  type === 'Sent' || type === 'MULTISIG_TRANSACTION';
	const isFundType = type === 'ETHEREUM_TRANSACTION';

	const handleGetHistoryNote = async () => {
		try {
			const userAddress = localStorage.getItem('address');
			const signature = localStorage.getItem('signature');

			if (!userAddress || !signature) {
				console.log('ERROR');
				return;
			}
			else {
				setLoading(true);
				const noteRes = await fetch(`${FIREBASE_FUNCTIONS_URL}/getTransactionNote`, {
					body: JSON.stringify({
						txHash
					}),
					headers: firebaseFunctionsHeader(network),
					method: 'POST'
				});

				const { data: noteData, error: noteError } = await noteRes.json() as { data: string, error: string };

				if (noteError) {
					console.log('error', noteError);
					setLoading(false);
					return;
				} else {
					setLoading(false);
					setNote(noteData);
				}

			}
		} catch (error) {
			setLoading(false);
			console.log('ERROR', error);
		}
	};

	return (
		<>
			<Collapse
				className='bg-bg-secondary rounded-lg p-2.5 scale-90 h-[111%] w-[111%] origin-top-left'
				bordered={false}
				defaultActiveKey={[`${hash}`]}
			>
				<Collapse.Panel showArrow={false} key={`${txHash}`} header={
					<div
						onClick={() => {
							if (!transactionInfoVisible) {
								handleGetHistoryNote();
							}
							toggleTransactionVisible(!transactionInfoVisible);
						}}
						className={classNames(
							'grid items-center grid-cols-9 cursor-pointer text-white font-normal text-sm leading-[15px]'
						)}
					>
						<p className='col-span-3 flex items-center gap-x-3'>
							{
								type === 'Sent' ||  type === 'removeOwner' ||  type === 'MULTISIG_TRANSACTION'?
									<span
										className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-red-500'
									>
										<ArrowUpRightIcon />
									</span>
									:
									<span
										className='flex items-center justify-center w-9 h-9 bg-success bg-opacity-10 p-[10px] rounded-lg text-green-500'
									>
										<ArrowDownLeftIcon />
									</span>
							}
							<span>
								{type === 'ETHEREUM_TRANSACTION'
									? 'Fund'
									: type === 'Sent'
									|| type === 'MULTISIG_TRANSACTION'
										? 'Sent'
										: type === 'removeOwner'
											? 'Removed Owner'
											: type === 'addOwnerWithThreshold'
												? 'Added Owner'
												: type}
							</span>
						</p>
						{(isFundType || isSentType) && <p className='col-span-2 flex items-center gap-x-[6px]'>
							<ParachainIcon src={chainProperties[network].logo} />
							<span
								className={classNames(
									'font-normal text-xs leading-[13px] text-failure',
									{
										'text-success': isFundType
									}
								)}
							>
								{isSentType ? '-' : '+'} {ethers?.utils?.formatEther(amount_token?.toString())?.toString()} {token}
							</span>
						</p>}
						{created_at && <p className='col-span-2'>{new Date(created_at).toLocaleString()}</p>}
						<p className='col-span-2 flex items-center justify-end gap-x-4'>
							<span className='text-success'>
								Success
							</span>
							<span className='text-white text-sm'>
								{
									transactionInfoVisible ?
										<CircleArrowUpIcon /> :
										<CircleArrowDownIcon />
								}
							</span>
						</p>
					</div>
				}>

					<div>
						<Divider className='bg-text_secondary my-5' />
						{
							isFundType ?
								<ReceivedInfo
									amount={String(amount_token)}
									amountType={token}
									date={created_at}
									from={from}
									callHash={txHash||''}
									note={note}
									loading={loading}
									amount_usd={amount_usd}
									to={to}
								/>
								:
								<SentInfo
									amount={String(amount_token)}
									amountType={token}
									date={created_at}
									recipient={to.toString()}
									callHash={txHash || ''}
									note={note}
									from={executor || ''}
									loading={loading}
									amount_usd={amount_usd}
									txType={type}
								/>
						}
					</div>
				</Collapse.Panel>
			</Collapse>
		</>
	);
};

export default Transaction;