// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CHAIN_NAMESPACES } from '@web3auth/base';
import astarLogo from 'src/assets/astar-logo.png';
import moonbeamLogo from 'src/assets/parachains-logos/moonbeam-logo.png';
// import ethereumLogo from 'src/assets/eth.png';
// import polygonLogo from 'src/assets/polygon.png';
import { ChainPropType } from 'src/types';

export enum NETWORK {
	GOERLI = 'goerli',
	POLYGON = 'polygon',
	ASTAR = 'astar',
	MOONBEAM = 'moonbeam'
}
export const tokenSymbol = {
	ASTR: 'ASTR',
	GLMR: 'GLMR',
	GOER: 'GOER',
	MATIC: 'MATIC'
};

export const chainProperties: ChainPropType = {
	// [NETWORK.GOERLI]: {
	// blockExplorer: 'https://goerli.etherscan.io',
	// chainId: '0x5',
	// chainNamespace: CHAIN_NAMESPACES.EIP155,
	// decimals: 18,
	// displayName: 'Goerli',
	// logo: ethereumLogo,
	// rpcTarget: 'https://goerli.blockpi.network/v1/rpc/public',
	// ticker: 'ETH',
	// tickerName: 'GoerliETH'
	// },
	// [NETWORK.POLYGON]: {
	// blockExplorer: 'https://polygonscan.com/',
	// chainId: '0x89',
	// chainNamespace: CHAIN_NAMESPACES.EIP155,
	// decimals: 18,
	// displayName: 'Polygon',
	// logo: polygonLogo,
	// rpcTarget: 'https://polygon-rpc.com/',
	// ticker: 'MATIC',
	// tickerName: 'Matic'
	// },
	[NETWORK.ASTAR]: {
		blockExplorer: 'https://astar.subscan.io',
		chainId: '0x250',
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Astar',
		logo: astarLogo,
		rpcEndpoint: 'https://evm.astar.network/',
		tokenName: 'Astar',
		tokenSymbol: 'ASTR'
	},
	[NETWORK.MOONBEAM]: {
		blockExplorer: 'https://moonbeam-explorer.netlify.app/?network=Moonbeam',
		chainId: '0x504',
		chainNamespace: CHAIN_NAMESPACES.OTHER,
		decimals: 18,
		displayName: 'Moonbeam',
		logo: moonbeamLogo,
		rpcEndpoint: 'wss://wss.api.moonbeam.network',
		tokenName: 'Moonbeam',
		tokenSymbol: tokenSymbol.GLMR
	}
};