// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EthersAdapter } from '@safe-global/protocol-kit';
import { useAddress, useMetamask, useNetworkMismatch, useSigner } from '@thirdweb-dev/react';
import { Modal } from 'antd';
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
	safeService:{} as any,
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
	const isNetworkMismatch = useNetworkMismatch();
	const [userDetailsContextState, setUserDetailsContextState] = useState(
		initialUserDetailsContext
	);
	const [activeMultisigData, setActiveMultisigData] = useState<any>({});
	const { network } = useGlobalApiContext();
	const navigate = useNavigate();
	const [safeService, setSafeService] = useState<GnosisSafeService>(
		{} as any
	);
	const signer =useSigner();
	const connect = useMetamask();

	const [loading, setLoading] = useState(false);

	const connectAddress = useCallback(async (passedNetwork:string = network, address?:string, signature?:string) => {
		console.log(address);
		setLoading(true);
		const user = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddress`, {
			headers: firebaseFunctionsHeader(passedNetwork, address, signature),
			method: 'POST'
		});
		const { data: userData, error: connectAddressErr } = await user.json();
		if (!connectAddressErr && userData) {
			setUserDetailsContextState((prevState) => {
				return {
					...prevState,
					activeMultisig: localStorage.getItem('active_multisig') || userData?.multisigAddresses?.filter((address:any) => address.network === network)?.[0]?.address || '',
					address: userData?.address,
					addressBook: userData?.addressBook || [],
					createdAt: userData?.created_at,
					multisigAddresses: userData?.multisigAddresses?.filter((address:any) => address.network === network),
					multisigSettings: userData?.multisigSettings || {},
					notification_preferences: userData?.notification_preferences
					|| initialUserDetailsContext.notification_preferences
				};
			});
			console.log(signer);
			if(!signer){
				await connect();
				console.log('enter');
			}
			if(signer){
				const txUrl = returnTxUrl(network);
				const web3Adapter = new EthersAdapter({
					ethers: signer.provider as any,
					signerOrProvider: signer
				});
				const gnosisService = new GnosisSafeService(web3Adapter, signer, txUrl);
				setSafeService(gnosisService);
			}
		} else {
			localStorage.clear();
			setUserDetailsContextState(initialUserDetailsContext);
			navigate('/');
		}
		setLoading(false);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connect, network, signer]);

	const updateCurrentMultisigData = useCallback(async () => {
		if (
			!userDetailsContextState.activeMultisig
			|| Boolean(!Object.keys(safeService).length)
			|| !userDetailsContextState.multisigAddresses
			|| !userDetailsContextState.address
		) {
			console.log(
				userDetailsContextState.activeMultisig,
				safeService,
				userDetailsContextState.multisigAddresses,
				userDetailsContextState.address
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
			console.log(userDetailsContextState.activeMultisig, safeBalance?.toString(), 'safe balance');
			setActiveMultisigData({ ...activeData, safeBalance });
		} catch (err) {
			console.log('err from update current multisig data', err);
		}
	}, [network, safeService, signer?.provider, userDetailsContextState.activeMultisig, userDetailsContextState.address, userDetailsContextState.multisigAddresses]);

	useEffect(() => {
		if (localStorage.getItem('signature')) {
			console.log('enter');
			console.log(address);
			connectAddress(network, address);
		} else {
			localStorage.clear();
			setLoading(false);
			navigate('/');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, connectAddress, network]);

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
			{
				isNetworkMismatch &&
				<Modal title='Error' open={isNetworkMismatch}>
					inValid Network
				</Modal>
			}
			{children}
		</UserDetailsContext.Provider>
	);
};
