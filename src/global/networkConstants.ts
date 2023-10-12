// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CHAIN_NAMESPACES } from '@web3auth/base';
import astarLogo from 'src/assets/astar-logo.png';
import ethereumLogo from 'src/assets/eth.png';
import arbLogo from 'src/assets/parachains-logos/arbitrum-logo.png';
import bnbLogo from 'src/assets/parachains-logos/bnb-logo.png';
import gnosisChainLogo from 'src/assets/parachains-logos/gnosis-chain-logo.png';
import opLogo from 'src/assets/parachains-logos/optimism-logo.png';
// import moonbeamLogo from 'src/assets/parachains-logos/moonbeam-logo.png';
import polygonLogo from 'src/assets/polygon.png';
import { ChainPropType } from 'src/types';

export enum NETWORK {
    GOERLI = 'goerli',
    POLYGON = 'polygon',
    ASTAR = 'astar',
    // MOONBEAM = 'moonbeam'
    ETHERIUM = 'etherium',
    ARBITRUM = 'arbitrum',
    OPTIMISM = 'optimism',
    GNOSIS = 'gnosis chain',
    BNB = 'bnb smart chain',
}
export const tokenSymbol = {
	ASTR: 'ASTR',
	BNB: 'BNB',
	ETH: 'ETH',
	GLMR: 'GLMR',
	MATIC: 'MATIC',
	OP: 'OP',
	xDAI: 'xDAI'
};

export const chainProperties: ChainPropType = {
	[NETWORK.GOERLI]: {
		blockExplorer: 'https://goerli.etherscan.io',
		chainId: 5,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Goerli',
		logo: ethereumLogo,
		rpcEndpoint: 'https://goerli.blockpi.network/v1/rpc/public',
		tokenName: 'GoerliETH',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.POLYGON]: {
		blockExplorer: 'https://polygonscan.com/',
		chainId: 137,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Polygon',
		logo: polygonLogo,
		rpcEndpoint: 'https://polygon-rpc.com/',
		tokenName: 'Matic',
		tokenSymbol: tokenSymbol.MATIC
	},
	[NETWORK.ASTAR]: {
		blockExplorer: 'https://astar.subscan.io',
		chainId: 592,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Astar',
		logo: astarLogo,
		rpcEndpoint: 'https://evm.astar.network/',
		tokenName: 'Astar',
		tokenSymbol: tokenSymbol.ASTR
	},
	[NETWORK.ETHERIUM]: {
		blockExplorer: 'https://etherscan.io/',
		chainId: 1,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Etherium',
		logo: ethereumLogo,
		rpcEndpoint: 'https://eth.api.onfinality.io/public',
		tokenName: 'Etherium',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.BNB]: {
		blockExplorer: 'https://bscscan.com/',
		chainId: 56,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'BNB Smart Chain',
		logo: bnbLogo,
		rpcEndpoint: 'https://bsc-dataseed.binance.org/',
		tokenName: 'BNB Smart Chain',
		tokenSymbol: tokenSymbol.BNB
	},
	[NETWORK.ARBITRUM]: {
		blockExplorer: 'https://arbiscan.io/',
		chainId: 42161,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Arbitrum',
		logo: arbLogo,
		rpcEndpoint: 'https://arb1.arbitrum.io/rpc',
		tokenName: 'Arbitrum',
		tokenSymbol: tokenSymbol.ETH
	},
	[NETWORK.OPTIMISM]: {
		blockExplorer: 'https://optimistic.etherscan.io/',
		chainId: 10,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Optimism',
		logo: opLogo,
		rpcEndpoint: 'https://mainnet.optimism.io/',
		tokenName: 'Optimism',
		tokenSymbol: tokenSymbol.OP
	},
	[NETWORK.GNOSIS]: {
		blockExplorer: 'https://gnosisscan.io/',
		chainId: 100,
		chainNamespace: CHAIN_NAMESPACES.EIP155,
		decimals: 18,
		displayName: 'Gnosis Chain',
		logo: gnosisChainLogo,
		rpcEndpoint: 'https://rpc.gnosischain.com/',
		tokenName: 'Gnosis Chain',
		tokenSymbol: tokenSymbol.xDAI
	}
	// [NETWORK.MOONBEAM]: {
	// blockExplorer: 'https://moonbeam-explorer.netlify.app/?network=Moonbeam',
	// chainId: '0x504',
	// chainNamespace: CHAIN_NAMESPACES.OTHER,
	// decimals: 18,
	// displayName: 'Moonbeam',
	// logo: moonbeamLogo,
	// rpcEndpoint: 'wss://wss.api.moonbeam.network',
	// tokenName: 'Moonbeam',
	// tokenSymbol: tokenSymbol.GLMR
	// }
};
