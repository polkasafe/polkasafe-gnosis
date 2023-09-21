// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse, Divider, Spin, Timeline } from 'antd';
import classNames from 'classnames';
// import { ethers } from 'ethers';
import React, { FC } from 'react';
import { MetaMaskAvatar } from 'react-metamask-avatar';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { chainProperties } from 'src/global/networkConstants';
import AddressComponent from 'src/ui-components/AddressComponent';
import { CircleCheckIcon, CirclePlusIcon, CircleWatchIcon, CopyIcon, ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import copyText from 'src/utils/copyText';
import parseDecodedValue from 'src/utils/parseDecodedValue';
import shortenAddress from 'src/utils/shortenAddress';
import styled from 'styled-components';

interface ISentInfoProps {
	amount: string;
	amountType: string;
	approvals: string[];
	addressAddOrRemove?: string;
	date: string;
	// time: string;
	className?: string;
	recipient: string
	callHash: string
	note?: string
	loading?: boolean
	amount_usd: number
	from: string,
	txType?:string
}

const SentInfo: FC<ISentInfoProps> = ({ approvals, amount, from, className, date, recipient, callHash, note, loading, txType, addressAddOrRemove }) => {
	const { addressBook, activeMultisig, multisigAddresses } = useGlobalUserDetailsContext();
	const { network } = useGlobalApiContext();
	const threshold = multisigAddresses?.find((item: any) => item.address === activeMultisig || item.proxy === activeMultisig)?.threshold || 0;

	return (
		<div
			className={classNames('flex gap-x-4', className)}
		>
			<article
				className='p-4 rounded-lg bg-bg-main flex-1'
			>
				{!(txType === 'addOwnerWithThreshold' || txType === 'removeOwner') && recipient && amount && <>
					<p
						className='flex items-center gap-x-1 text-white font-medium text-sm leading-[15px]'
					>
						<span>
						Sent
						</span>
						<span
							className='text-failure'
						>
							{amount
								? parseDecodedValue({
									network,
									value: String(amount),
									withUnit: true
								})
								: `? ${chainProperties[network].ticker}`}{' '}
						</span>
						<span>
						to:
						</span>
					</p>
					<div
						className='mt-3 flex items-center gap-x-4'
					>
						<MetaMaskAvatar address={recipient} size={30}/>
						<div
							className='flex flex-col gap-y-[6px]'
						>
							<p
								className='font-medium text-sm leading-[15px] text-white'
							>
								{addressBook?.find((item: any) => item.address === recipient)?.name || DEFAULT_ADDRESS_NAME}
							</p>
							<p
								className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
							>
								<span>
									{recipient}
								</span>
								<span
									className='flex items-center gap-x-2 text-sm'
								>
									<button onClick={() => copyText(recipient)}><CopyIcon className='hover:text-primary' /></button>
									<a href={`https://${network}.subscan.io/account/${recipient}`} target='_blank' rel="noreferrer" >
										<ExternalLinkIcon />
									</a>
								</span>
							</p>
						</div>
					</div>
					<Divider className='bg-text_secondary my-5' />
				</>}
				<div
					className='flex items-center gap-x-7 mb-3'
				>
					<span
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
						From:
					</span>
					<AddressComponent address={from} />
				</div>
				<div
					className='flex items-center gap-x-5'
				>
					<span
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
						Txn Hash:
					</span>
					<p
						className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
					>
						<span
							className='text-white font-normal text-sm leading-[15px]'
						>
							{shortenAddress(callHash, 10)}
						</span>
						<span
							className='flex items-center gap-x-2 text-sm'
						>
							<button onClick={() => copyText(callHash)}><CopyIcon /></button>
							{/* <ExternalLinkIcon /> */}
						</span>
					</p>
				</div>
				<div
					className='flex items-center gap-x-5 mt-3'
				>
					<span
						className='text-text_secondary font-normal text-sm leading-[15px]'
					>
						Executed:
					</span>
					<p
						className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
					>
						<span
							className='text-white font-normal text-sm leading-[15px]'
						>
							{date}
						</span>
					</p>
				</div>
				{addressAddOrRemove &&
					<div
						className='flex items-center gap-x-5 mt-3'
					>
						<span
							className='text-text_secondary font-normal text-sm leading-[15px]'
						>
							{txType === 'addOwnerWithThreshold' ? 'Added Owner' : 'Removed Owner'}:
						</span>
						<p
							className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
						>
							<AddressComponent address={addressAddOrRemove} />
						</p>
					</div>
				}
				{loading ? <Spin className='mt-3' /> : note &&
					<div
						className='flex items-center gap-x-5 mt-3'
					>
						<span
							className='text-text_secondary font-normal text-sm leading-[15px]'
						>
							Note:
						</span>
						<p
							className='flex items-center gap-x-3 font-normal text-xs leading-[13px] text-text_secondary'
						>
							<span
								className='text-white font-normal text-sm leading-[15px] whitespace-pre'
							>
								{note}
							</span>
						</p>
					</div>
				}
			</article>
			<article
				className='p-8 rounded-lg bg-bg-main max-w-[328px] w-full'
			>
				<div className='h-full'>
					<Timeline
						className='h-full flex flex-col'
					>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CirclePlusIcon className='text-success text-sm' />
								</span>
							}
							className='success flex-1'
						>
							<div
								className='text-white font-normal text-sm leading-[15px]'
							>
								Created
							</div>
						</Timeline.Item>
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleCheckIcon className='text-success text-sm' />
								</span>
							}
							className='success flex-1'
						>
							<div
								className='text-white font-normal text-sm leading-[15px]'
							>
								Confirmations <span className='text-text_secondary'>{threshold} of {threshold}</span>
							</div>
						</Timeline.Item>
						{!!approvals?.length &&
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleCheckIcon className='text-success text-sm' />
								</span>
							}
							className='success'
						>
							<Collapse bordered={false}>
								<Collapse.Panel
									showArrow={false}
									key={1}
									header={<span className='text-primary font-normal text-sm leading-[15px] px-3 py-2 rounded-md bg-highlight'>Show All Confirmations</span>}
								>
									<Timeline>
										{approvals.map((address, i) => (
											<Timeline.Item
												key={i}
												dot={
													<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
														<CircleCheckIcon className='text-success text-sm' />
													</span>
												}
												className={`${i == 0 && 'mt-4'} success bg-transaparent`}
											>
												<div
													className='mb-3 flex items-center gap-x-4'
												>
													<AddressComponent address={address} />
												</div>
											</Timeline.Item>
										))}

									</Timeline>
								</Collapse.Panel>
							</Collapse>
						</Timeline.Item>
						}
						<Timeline.Item
							dot={
								<span className='bg-success bg-opacity-10 flex items-center justify-center p-1 rounded-md h-6 w-6'>
									<CircleWatchIcon className='text-success text-sm' />
								</span>
							}
							className='success flex-1'
						>
							<div
								className='text-white font-normal text-sm leading-[15px]'
							>
								<p>Executed</p>
							</div>
						</Timeline.Item>
					</Timeline>
				</div>
			</article>
		</div>
	);
};

export default styled(SentInfo)`
	.ant-collapse > .ant-collapse-item > .ant-collapse-header{
		padding: 4px 8px;
	}
    .ant-timeline-item-tail {
        border-inline-width: 0.5px !important;
    }
    .ant-timeline-item-last {
        padding: 0;
    }
    .ant-timeline-item:not(:first-child, :last-child) {
        margin-top: 5px;
        margin-bottom: 5px;
    }
    .ant-timeline-item-content {
        display: flex;
        min-height: 24px !important;
        height: auto !important;
        align-items: center;
    }
    .success .ant-timeline-item-tail {
        border-inline-color: #06D6A0;
    }
    .warning .ant-timeline-item-tail {
        border-inline-color: #FF9F1C;
    }
`;