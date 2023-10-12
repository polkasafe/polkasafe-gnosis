// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORK } from 'src/global/networkConstants';

/**
 * Return the current network
 *
 */

export default function getNetwork(): NETWORK {
	const defaultNetwork = NETWORK.ASTAR;
	const selectedNetwork = localStorage.getItem('network');
	const allNetwork = Object.values(NETWORK);
	const url = global.window.location.href;

	if (selectedNetwork && allNetwork.includes(selectedNetwork as NETWORK)) {
		// console.log(selectedNetwork);
		return selectedNetwork as NETWORK;
	}

	let network = url.split('//')[1].split('.')[0] as NETWORK || defaultNetwork;

	const possibleNetworks = Object.values(network);

	if (!possibleNetworks.includes(network)) {
		network = defaultNetwork;
	}

	localStorage.setItem('network', network);

	return network;
}
