// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useSigner } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';

interface Props {
	className?: string
	address: string
	onChange?: (balance: string) => void
}

const Balance = ({ address, className }: Props) => {
	const signer= useSigner();

	const [balance, setBalance] = useState<string>('0');

	const fetchEthBalance = async (address: string) => {
		try {
			if(!signer?.provider){
				return;
			}
			const balance = ethers?.utils?.formatEther(
				await signer.provider?.getBalance(address)
			);
			if(balance)
				setBalance(balance);
		} catch (err) {
			console.log('Err from fetchEthBalance', err);
		}
	};

	useEffect(() => {
		if (address) fetchEthBalance(address);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	return (
		<div className={`bg-highlight rounded-lg px-[10px] py-[6px] ml-auto font-normal text-xs leading-[13px] flex items-center justify-center ${className}`}>
			<span className='text-primary mr-2'>Balance: </span>
			<span className='text-white'>{parseFloat(balance).toFixed(3)}</span>
		</div>
	);
};

export default Balance;