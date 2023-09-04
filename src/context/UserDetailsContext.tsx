// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState
} from 'react';
import { DEFAULT_ADDRESS_NAME } from 'src/global/default';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { chainProperties } from 'src/global/networkConstants';
import { UserDetailsContextType, Wallet } from 'src/types';
import { convertSafeMultisig } from 'src/utils/convertSafeData/convertSafeMultisig';

// import updateDB, { UpdateDB } from 'src/utils/updateDB';
import { useGlobalApiContext } from './ApiContext';
import { useGlobalWeb3Context } from './Web3Auth';

const initialUserDetailsContext: UserDetailsContextType = {
	activeMultisig: localStorage.getItem('active_multisig') || '',
	address: localStorage.getItem('address') || '',
	addressBook: [],
	createdAt: new Date(),
	loggedInWallet: Wallet.WEB3AUTH,
	multisigAddresses: [],
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
	const [userDetailsContextState, setUserDetailsContextState] = useState(
		initialUserDetailsContext
	);
	const [activeMultisigData, setActiveMultisigData] = useState<any>({});
	const { ethProvider, web3Provider, safeService } =
    useGlobalWeb3Context();
	const { network } = useGlobalApiContext();
	const { switchChain, addChain } = useGlobalWeb3Context();

	const [loading, setLoading] = useState(false);

	const address = localStorage.getItem('address');
	const signature = localStorage.getItem('signature');

	const fetchUserData = useCallback(async () => {
		if (!address && !signature) {
			console.log('something');
			return;
		}
		setLoading(true);
		const { data } = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddressEth`, {
			headers: firebaseFunctionsHeader(network, address!, signature!),
			method: 'POST'
		}).then((res) => res.json());

		const getMultisig = localStorage.getItem('active_multisig') || '';

		if (data?.multisigAddresses.length > 0) {
			if(!getMultisig){
				localStorage.setItem(
					'active_multisig',
					data?.multisigAddresses[0].address
				);
			}
		}
		setUserDetailsContextState((prevState) => {
			return {
				...prevState,
				activeMultisig: data?.multisigAddresses.length > 0 ? getMultisig || data?.multisigAddresses?.[0]?.address : '',
				address: data?.address,
				addressBook: data?.addressBook || [],
				createdAt: data?.created_at,
				loggedInWallet: Wallet.WEB3AUTH,
				multisigAddresses: data?.multisigAddresses
			};
		});
		setLoading(false);
	}, [address, network, signature]);

	const updateCurrentMultisigData = useCallback(async () => {
		if (
			!userDetailsContextState.activeMultisig
			|| !safeService
			|| !userDetailsContextState.multisigAddresses
			|| !address
		) {
			console.log(
				userDetailsContextState.activeMultisig, safeService, userDetailsContextState.multisigAddresses, address
			);
			// if(!ethProvider){
			// setExpired(true);
			// }
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
			if(!userDetailsContextState.activeMultisig){
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
			const safeBalance = await ethProvider?.getBalance(
				userDetailsContextState.activeMultisig
			);
			setActiveMultisigData({ ...activeData, safeBalance });
		} catch (err) {
			console.log('err from update current multisig data', err);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		address,
		ethProvider,
		network,
		safeService,
		userDetailsContextState.activeMultisig,
		userDetailsContextState.multisigAddresses
	]);

	useEffect(() => {
		if (address) fetchUserData();
	}, [address, fetchUserData]);

	useEffect(() => {
		const chains = async () => {
			await addChain(network);
			await switchChain(chainProperties[network].chainId);
		};
		if (ethProvider) {
			chains();
		}
	}, [addChain, ethProvider, network, switchChain]);

	useEffect(() => {
		if (!ethProvider || !web3Provider) {
			return;
		}
		updateCurrentMultisigData();
	}, [ethProvider, updateCurrentMultisigData, web3Provider]);

	return (
		<UserDetailsContext.Provider
			value={{
				activeMultisigData,
				fetchUserData,
				loading,
				...userDetailsContextState,
				setActiveMultisigData,
				setLoading,
				setUserDetailsContextState,
				updateCurrentMultisigData
			}}
		>
			{children}
		</UserDetailsContext.Provider>
	);
};
