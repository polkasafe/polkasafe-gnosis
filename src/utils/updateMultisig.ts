// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// of the Apache-2.0 license. See the LICENSE file for details.

import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';

interface IUpdateMultisig {
    address: string;
    txBody: any;
    network: string;
}

export default async function updateMultisig({ address, txBody, network }:IUpdateMultisig) {
	return await fetch(`${FIREBASE_FUNCTIONS_URL}/addMultisig`, {
		body: JSON.stringify(txBody),
		headers: {
			'Accept': 'application/json',
			'Acess-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
			'x-address': address,
			'x-api-key': '47c058d8-2ddc-421e-aeb5-e2aa99001949',
			'x-network': network,
			'x-signature': localStorage.getItem('signature')!,
			'x-source': 'polkasafe'
		},
		method: 'POST'
	}).then(res => res.json()).catch(err => err.message);
}
