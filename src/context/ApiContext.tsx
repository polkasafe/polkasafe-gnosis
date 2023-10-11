// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import { Arbitrum, Astar, Binance, Ethereum, Gnosis, Goerli, Optimism, Polygon } from '@thirdweb-dev/chains';
import { metamaskWallet, ThirdwebProvider, walletConnect } from '@thirdweb-dev/react';
import React, { useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { NETWORK } from 'src/global/networkConstants';
import getNetwork from 'src/utils/getNetwork';

export interface ApiContextType {
	network: NETWORK;
	setNetwork: React.Dispatch<React.SetStateAction<NETWORK>>
}

export const ApiContext: React.Context<ApiContextType> = React.createContext(
	{} as ApiContextType
);

export interface ApiContextProviderProps {
	children?: React.ReactElement;
}

const chains: any = {
	arbitrum: Arbitrum,
	astar: Astar,
	'bnb smart chain': Binance,
	etherium: Ethereum,
	'gnosis chain': Gnosis,
	goerli: Goerli,
	optimism: Optimism,
	polygon: Polygon
};

export function ApiContextProvider({ children }: ApiContextProviderProps): React.ReactElement {
	const location = useLocation();
	const queryNetwork = new URLSearchParams(location.search).get('network');
	console.log(queryNetwork);
	const [network, setNetwork] = useState<NETWORK>(getNetwork());
	return (
		<ApiContext.Provider value={{ network, setNetwork }}>
			<ThirdwebProvider
				activeChain={chains?.[network || 'astar']}
				clientId="b2c09dab179152e7936744fa00899dfa"
				authConfig={{
					domain: FIREBASE_FUNCTIONS_URL as string
				}}
				supportedChains={Object.values(chains) as any}
				supportedWallets={[metamaskWallet(), walletConnect()]}
			>
				{children}
			</ThirdwebProvider>
		</ApiContext.Provider>
	);
}

export function useGlobalApiContext() {
	return useContext(ApiContext);
}