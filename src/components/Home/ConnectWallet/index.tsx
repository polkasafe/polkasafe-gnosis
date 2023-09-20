// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ConnectWallet as ThirdConnectWallet, useAddress, useSDK } from '@thirdweb-dev/react';
import { Button } from 'antd';
import React, {  useCallback, useState } from 'react';
import ConnectWalletImg from 'src/assets/connect-wallet.svg';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { WalletIcon } from 'src/ui-components/CustomIcons';

const ConnectWallet = () => {
	const { network } = useGlobalApiContext();
	const address = useAddress();
	const [loading, setLoading] = useState<boolean>(false);
	const { connectAddress } = useGlobalUserDetailsContext();
	const sdk = useSDK();

	const handleLogin = useCallback( async () => {
		try {
			setLoading(true);
			if(!address){
				setLoading(false);
				return;
			}
			// Make a request to the API with the payload.
			const res = await fetch(`${FIREBASE_FUNCTIONS_URL}/login`, {
				body: JSON.stringify({ address }),
				headers: {
					'Content-Type': 'application/json',
					'x-network': network
				},
				method: 'POST'
			});
			const { token } = await res.json();
			const signature = await sdk?.wallet?.sign(token) || '';
			localStorage.setItem('signature', signature);
			localStorage.setItem('address', address);
			await connectAddress(network, address, signature);
		} catch (err) {
			console.log(err);
		}
		setLoading(false);
	},[address, connectAddress, network, sdk?.wallet]
	);
	return (
		<div className='rounded-xl flex flex-col items-center justify-center min-h-[400px] bg-bg-main'>
			<img src={ConnectWalletImg} alt='Wallet' height={120} width={120} className='mb-4 mt-1' />
			<>
				<h2 className='font-bold text-lg text-white'>Get Started</h2>
				<p className='mt-[10px]  text-normal text-sm text-white'>Connect your wallet</p>
				<p className='text-text_secondary text-sm font-normal mt-[20px] mb-2'>Your first step towards creating a safe & secure MultiSig</p>
				{!address ?
					<ThirdConnectWallet/>:
					<Button
						icon={<WalletIcon />}
						onClick={async () => {
							handleLogin();
						}}
						loading={loading}
						className={'mt-[25px] text-sm border-none outline-none flex items-center justify-center bg-primary text-white'}
					>
					Sign In
					</Button>
				}
			</>
		</div>
	);
};

export default ConnectWallet;