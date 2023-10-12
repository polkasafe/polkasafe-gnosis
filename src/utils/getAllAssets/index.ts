// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { returnTxUrl } from 'src/global/gnosisService';
import { NETWORK } from 'src/global/networkConstants';

// of the Apache-2.0 license. See the LICENSE file for details.
export const getAllAssets = async (network: NETWORK, address: string) => {
	return (await fetch(`${returnTxUrl(network)}/api/v1/safes/${address}/balances/usd/?trusted=false&exclude_spam=false`)).json();
};