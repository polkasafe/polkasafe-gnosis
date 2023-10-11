// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK } from './networkConstants';

export const returnTxUrl = (network?: NETWORK): string => {
	if (network === NETWORK.GOERLI) {
		return 'https://safe-transaction-goerli.safe.global';
	} else if (network === NETWORK.POLYGON) {
		return 'https://safe-transaction-polygon.safe.global';
	} else if (network === NETWORK.ASTAR) {
		return 'https://transaction.safe.astar.network';
	} else if (network === NETWORK.ETHERIUM) {
		return 'https://safe-transaction-mainnet.safe.global';
	} else if (network === NETWORK.ARBITRUM) {
		return 'https://safe-transaction-arbitrum.safe.global';
	} else if (network === NETWORK.OPTIMISM) {
		return 'https://safe-transaction-optimism.safe.global';
	} else if (network === NETWORK.GNOSIS) {
		return 'https://safe-transaction-gnosis-chain.safe.global';
	} else if (network === NETWORK.BNB) {
		return 'https://safe-transaction-bsc.safe.global';
	} else {
		return '';
	}
};