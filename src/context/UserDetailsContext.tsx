// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EthersAdapter } from '@safe-global/protocol-kit';
import { useAddress, useSigner } from '@thirdweb-dev/react';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { returnTxUrl } from 'src/global/gnosisService';
import { GnosisSafeService } from 'src/services';
import { UserDetailsContextType } from 'src/types';
import { convertSafeMultisig } from 'src/utils/convertSafeData/convertSafeMultisig';

import { useGlobalApiContext } from './ApiContext';

const initialUserDetailsContext: UserDetailsContextType = {
	activeMultisig: localStorage.getItem('active_multisig') || '',
	address: localStorage.getItem('address') || '',
	addressBook: [],
	createdAt: new Date(),
	loggedInWallet: localStorage.getItem('logged_in_wallet') || '',
	multisigAddresses: [],
	notification_preferences: {},
	setActiveMultisigData: (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	},
	setUserDetailsContextState: (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	},
	updateCurrentMultisigData: (): void => {
		throw new Error('updateCurrentMultisigData function must be overridden');
	}
};

export const UserDetailsContext: React.Context<UserDetailsContextType> =
  createContext(initialUserDetailsContext);

export function useGlobalUserDetailsContext() {
	return useContext(UserDetailsContext);
}

export const UserDetailsProvider = ({
	children
}: React.PropsWithChildren<{}>) => {
	const address = useAddress();
	const [userDetailsContextState, setUserDetailsContextState] = useState(
		initialUserDetailsContext
	);
	const [activeMultisigData, setActiveMultisigData] = useState<any>({});
	const { network } = useGlobalApiContext();
	const navigate = useNavigate();
	const [safeService, setSafeService] = useState<null | GnosisSafeService>(
		null
	);
	const signer = useSigner();

	const [loading, setLoading] = useState(false);

	const connectAddress = useCallback(async (passedNetwork:string = network, address?:string, signature?:string) => {
		setLoading(true);
		const user = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddress`, {
			headers: firebaseFunctionsHeader(passedNetwork, address, signature),
			method: 'POST'
		});
		const { data: userData, error: connectAddressErr } = await user.json();
		if(!signer){
			return;
		}
		if (!connectAddressErr && userData) {
			setUserDetailsContextState((prevState) => {
				return {
					...prevState,
					activeMultisig: localStorage.getItem('active_multisig') || userData?.multisigAddresses?.[0].address || '',
					address: userData?.address,
					addressBook: userData?.addressBook || [],
					createdAt: userData?.created_at,
					multisigAddresses: userData?.multisigAddresses,
					multisigSettings: userData?.multisigSettings || {},
					notification_preferences: userData?.notification_preferences
					|| initialUserDetailsContext.notification_preferences
				};
			});
			const txUrl = returnTxUrl(network);
			const web3Adapter = new EthersAdapter({
				ethers: signer.provider as any,
				signerOrProvider: signer
			});
			const gnosisService = new GnosisSafeService(web3Adapter, signer, txUrl);
			setSafeService(gnosisService);
		} else {
			localStorage.clear();
			setUserDetailsContextState(initialUserDetailsContext);
			navigate('/');
		}
		setLoading(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, signer]);

	const updateCurrentMultisigData = useCallback(async () => {
		if (
			!userDetailsContextState.activeMultisig
			|| !safeService
			|| !userDetailsContextState.multisigAddresses
			|| !address
		) {
			console.log(
				userDetailsContextState.activeMultisig,
				safeService,
				userDetailsContextState.multisigAddresses,
				address
			);
			return;
		}
		try {
			let activeData: any = {};
			const multisig = userDetailsContextState.multisigAddresses.find(
				(multi) => multi.address === userDetailsContextState.activeMultisig
			);
			if (!multisig) {
				return;
			}
			if (!userDetailsContextState.activeMultisig) {
				return;
			}
			const multiData = await safeService.getMultisigData(
				userDetailsContextState.activeMultisig
			);
			if (multiData) {
				activeData = convertSafeMultisig({
					...multiData,
					name: multisig?.name || DEFAULT_ADDRESS_NAME,
					network
				});
			}
			const safeBalance = await signer?.provider?.getBalance(
				userDetailsContextState.activeMultisig
			);
			setActiveMultisigData({ ...activeData, safeBalance });
		} catch (err) {
			console.log('err from update current multisig data', err);
		}
	}, [address, network, safeService, signer?.provider, userDetailsContextState.activeMultisig, userDetailsContextState.multisigAddresses]);

	useEffect(() => {
		if (localStorage.getItem('signature')) {
			connectAddress();
		} else {
			localStorage.clear();
			setLoading(false);
			navigate('/');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectAddress]);

	useEffect(() => {
		if(!userDetailsContextState.activeMultisig){
			return;
		}
		updateCurrentMultisigData();
	}, [updateCurrentMultisigData, userDetailsContextState.activeMultisig]);

	return (
		<UserDetailsContext.Provider
			value={{
				activeMultisigData,
				connectAddress,
				loading,
				...userDetailsContextState,
				safeService,
				setActiveMultisigData,
				setLoading,
				setSafeService,
				setUserDetailsContextState,
				updateCurrentMultisigData
			}}
		>
			{children}
		</UserDetailsContext.Provider>
	);
};
