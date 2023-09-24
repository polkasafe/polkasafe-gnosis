// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */

import { EthersAdapter } from '@safe-global/protocol-kit';
import { useAddress, useMetamask, useNetworkMismatch, useSigner } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
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
import { EFieldType, IUser, UserDetailsContextType } from 'src/types';
import InvalidNetwork from 'src/ui-components/InvalidNetwork';
import { convertSafeMultisig } from 'src/utils/convertSafeData/convertSafeMultisig';

import { useGlobalApiContext } from './ApiContext';
const initialUserDetailsContext: UserDetailsContextType = {
	activeMultisig: localStorage.getItem('active_multisig') || '',
	address: localStorage.getItem('address') || '',
	addressBook: [],
	createdAt: new Date(),
	gnosisSafe: {} as any,
	loggedInWallet: localStorage.getItem('logged_in_wallet') || '',
	multisigAddresses: [],
	multisigSettings: {},
	notification_preferences: {},
	setActiveMultisigData: (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	},
	setGnosisSafe: (): void => {},
	setUserDetailsContextState: (): void => {
		throw new Error('setUserDetailsContextState function must be overridden');
	},
	updateCurrentMultisigData: (): void => {
		throw new Error('updateCurrentMultisigData function must be overridden');
	},
	transactionFields: {
		['expense_reimbursement']: {
			fieldDesc: '',
			fieldName: 'Expense Reimbursement',
			subfields: {
				['department']: {
					subfieldName: 'Department',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Engineering'
						},
						{
							optionName: 'Finance'
						},
						{
							optionName: 'Marketing'
						},
						{
							optionName: 'Operations'
						},
						{
							optionName: 'Legal'
						},
						{
							optionName: 'Content'
						},
						{
							optionName: 'Other'
						}
					]
				},
				['project']: {
					subfieldName: 'Project',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				['description']: {
					subfieldName: 'Description',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				['expense_type']: {
					subfieldName: 'Expense Type',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Legal'
						},
						{
							optionName: 'Gas Fees'
						},
						{
							optionName: 'Events'
						},
						{
							optionName: 'Other'
						},
						{
							optionName: 'Software'
						}
					]
				},
				['invoice']: {
					subfieldName: 'Invoice',
					subfieldType: EFieldType.TEXT,
					required: true
				}
			}
		},
		['contributor_compensation']: {
			fieldName: 'Contributor Compensation',
			fieldDesc: '',
			subfields: {
				['department']: {
					subfieldName: 'Department',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Engineering'
						},
						{
							optionName: 'Finance'
						},
						{
							optionName: 'Marketing'
						},
						{
							optionName: 'Operations'
						},
						{
							optionName: 'Legal'
						},
						{
							optionName: 'Content'
						},
						{
							optionName: 'Other'
						}
					]
				},
				['project']: {
					subfieldName: 'Project',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				['description']: {
					subfieldName: 'Description',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				['compensation_type']: {
					subfieldName: 'Compensation Type',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Bounty'
						},
						{
							optionName: 'Contractor'
						},
						{
							optionName: 'Full-Time'
						},
						{
							optionName: 'Part-Time'
						}
					]
				},
				['invoice']: {
					subfieldName: 'Invoice',
					subfieldType: EFieldType.TEXT,
					required: true
				}
			}
		},
		['grants']: {
			fieldName: 'Grants',
			fieldDesc: '',
			subfields: {
				['department']: {
					subfieldName: 'Department',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Engineering'
						},
						{
							optionName: 'Finance'
						},
						{
							optionName: 'Marketing'
						},
						{
							optionName: 'Operations'
						},
						{
							optionName: 'Legal'
						},
						{
							optionName: 'Content'
						},
						{
							optionName: 'Other'
						}
					]
				},
				['project']: {
					subfieldName: 'Project',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				['description']: {
					subfieldName: 'Description',
					subfieldType: EFieldType.TEXT,
					required: true
				}
			}
		},
		['airdrop']: {
			fieldName: 'Airdrop',
			fieldDesc: '',
			subfields: {
				['department']: {
					subfieldName: 'Department',
					subfieldType: EFieldType.SINGLE_SELECT,
					required: true,
					dropdownOptions: [
						{
							optionName: 'Engineering'
						},
						{
							optionName: 'Finance'
						},
						{
							optionName: 'Marketing'
						},
						{
							optionName: 'Operations'
						},
						{
							optionName: 'Legal'
						},
						{
							optionName: 'Content'
						},
						{
							optionName: 'Other'
						}
					]
				},
				['project']: {
					subfieldName: 'Project',
					subfieldType: EFieldType.TEXT,
					required: true
				},
				['description']: {
					subfieldName: 'Description',
					subfieldType: EFieldType.TEXT,
					required: true
				}
			}
		},
		['none']: {
			fieldDesc: 'N/A',
			fieldName: 'Other',
			subfields: {}
		}
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
	const [gnosisSafe, setGnosisSafe] = useState<GnosisSafeService>({} as any);
	const signer = useSigner();

	const [loading, setLoading] = useState(false);
	const connect  = useMetamask();

	const connectAddress = useCallback(async (passedNetwork:string = network, address?:string, signature?:string) => {
		if(isNetworkMismatch){
			return;
		}
		if(!address && !localStorage.getItem('address')){
			return;
		}
		setLoading(true);
		const user = await fetch(`${FIREBASE_FUNCTIONS_URL}/connectAddressEth`, {
			headers: firebaseFunctionsHeader(passedNetwork, address, signature),
			method: 'POST'
		});
		const { data: userData, error: connectAddressErr } = await user.json() as { data: IUser, error: string };
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
					notification_preferences: userData?.notification_preferences || initialUserDetailsContext.notification_preferences,
					transactionFields: userData?.transactionFields || initialUserDetailsContext.transactionFields
				};
			});
			if(!signer){
				await connect({ chainId:592 });
			}
			if(signer){
				const txUrl = returnTxUrl(network);
				const web3Adapter = new EthersAdapter({
					ethers,
					signerOrProvider: signer
				});
				const gnosisService = new GnosisSafeService(web3Adapter, signer, txUrl);
				setGnosisSafe(gnosisService);
			}
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
			|| Boolean(!Object.keys(gnosisSafe).length)
			|| !userDetailsContextState.multisigAddresses
			|| !userDetailsContextState.address
		) {
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
			const multiData = await gnosisSafe.getMultisigData(
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
	}, [network, gnosisSafe, signer?.provider, userDetailsContextState.activeMultisig, userDetailsContextState.address, userDetailsContextState.multisigAddresses]);

	useEffect(() => {
		if(!address){
			return;
		}
		if(localStorage.getItem('address') !== address){
			localStorage.removeItem('signature');
			localStorage.removeItem('address');
			setUserDetailsContextState(initialUserDetailsContext);
			navigate('/',{ replace: true });
			setLoading(false);
			return;
		}
		if (localStorage.getItem('signature')) {
			connectAddress(network);
		} else {
			localStorage.clear();
			setLoading(false);
			navigate('/');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, network]);

	useEffect(() => {
		if(!userDetailsContextState.activeMultisig){
			return;
		}
		updateCurrentMultisigData();
	}, [updateCurrentMultisigData, userDetailsContextState.activeMultisig]);

	useEffect(() => {
		if(!gnosisSafe) return;
	}, [gnosisSafe]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleNetworkMisMatch = async () => {
		await connect({ chainId:592 });
	};

	useEffect(() => {
		if(isNetworkMismatch){
			handleNetworkMisMatch();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[isNetworkMismatch]);

	return (
		<UserDetailsContext.Provider
			value={{
				activeMultisigData,
				connectAddress,
				loading,
				...userDetailsContextState,
				gnosisSafe,
				setActiveMultisigData,
				setGnosisSafe,
				setLoading,
				setUserDetailsContextState,
				updateCurrentMultisigData
			}}
		>
			{isNetworkMismatch && localStorage.getItem('signature')?
				<InvalidNetwork/>:
				<>{children}</>
			}
		</UserDetailsContext.Provider>
	);
};
