// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EthersAdapter } from '@safe-global/protocol-kit';
import { SafeEventEmitterProvider } from '@web3auth/base';
import { Web3Auth } from '@web3auth/modal';
import {
	getWalletConnectV2Settings,
	WalletConnectV2Adapter
} from '@web3auth/wallet-connect-v2-adapter';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import {
	metamaskAdapter,
	openloginAdapter,
	torusPlugin,
	torusWalletAdapter,
	webAuth
} from 'src/global';
import { firebaseFunctionsHeader } from 'src/global/firebaseFunctionsHeader';
import { FIREBASE_FUNCTIONS_URL } from 'src/global/firebaseFunctionsUrl';
import { returnTxUrl } from 'src/global/gnosisService';
import { chainProperties, NETWORK } from 'src/global/networkConstants';
import { GnosisSafeService } from 'src/services';
import { loginMethod } from 'src/utils/loginMethodConfig';
import Web3 from 'web3';

import { useGlobalApiContext } from './ApiContext';

export interface Web3AuthContextType {
  web3Auth: Web3Auth | null;
  login: any;
  logout: any;
  authenticateUser: any;
  getChainId: any;
  getUserInfo: any;
  web3AuthUser: Web3AuthUser | null;
  signMessage: any;
  switchChain: any;
  ethProvider: any | null;
  provider: SafeEventEmitterProvider | null;
  addChain: any;
  sendNativeToken: any;
  web3Provider: Web3 | null;
  handleWeb3AuthConnection: () => Promise<{
    data: any;
    error: any;
  }>;
  init: any;
  safeService: any;
  expired:boolean;
  setExpired: any;
}

export interface Web3AuthUser {
  name?: string;
  email?: string;
  accounts: [string];
}

export const Web3AuthContext: React.Context<Web3AuthContextType> =
  React.createContext({} as any);

const DEFAULT_NETWORK = NETWORK.ASTAR;

export function Web3AuthProvider({
	children
}: React.PropsWithChildren<{}>): React.ReactElement {
	const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(
		null
	);
	const { network } = useGlobalApiContext();
	const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
	const [web3AuthUser, setWeb3AuthUser] = useState<Web3AuthUser | null>(null);
	const [ethProvider, setEthProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
	const [web3Provider, setWeb3Provider] = useState<Web3 | null>(null);
	const [safeService, setSafeService] = useState<null | GnosisSafeService>(
		null
	);
	const [expired, setExpired] = useState(false);

	const init = useCallback(async () => {
		try {
			const defaultWcSettings = await getWalletConnectV2Settings(
				'eip155',
				[1, 137, 5],
				'04309ed1007e77d1f119b85205bb779d'
			);
			const walletConnectV2Adapter = new WalletConnectV2Adapter({
				adapterSettings: { ...defaultWcSettings.adapterSettings },
				loginSettings: { ...defaultWcSettings.loginSettings }
			});
			const auth = webAuth(network);
			if (auth.provider) {
				console.log('web3Auth Provider');
				setProvider(auth.provider);
			}
			setWeb3Auth(auth);
			const metaAdapter = metamaskAdapter(network);
			auth.configureAdapter(metaAdapter as any);
			auth.configureAdapter(torusWalletAdapter as any);
			auth.configureAdapter(walletConnectV2Adapter as any);
			auth.configureAdapter(openloginAdapter);
			await auth.addPlugin(torusPlugin as any);
			await auth.initModal({
				modalConfig: {
					openlogin: {
						label: 'openlogin',
						loginMethods: loginMethod
					}
				}
			});
			console.log('web3Auth set');
		} catch (err) {
			console.log(`Error from web3Auth init func - ${err}`);
		}
	}, [network]);

	const handleWeb3AuthConnection = async (): Promise<{
    data: any;
    error: any;
  }> => {
		try {
			const ethProvider: any = await login();
			if (!ethProvider) {
				console.log('eth provider is not ready');
				return { data: null, error: 'invalid request' };
			}
			const signer = ethProvider.getSigner();
			const tokenResponse = await fetch(
				`${FIREBASE_FUNCTIONS_URL}/getConnectAddressTokenEth`,
				{
					headers: firebaseFunctionsHeader(
						DEFAULT_NETWORK,
						await signer.getAddress()
					),
					method: 'POST'
				}
			);
			const { data: token, error: tokenError } = await tokenResponse.json();
			if (!tokenError) {
				try {
					const signature = await signMessage(token, ethProvider);
					if (signature) {
						const { data } = await fetch(
							`${FIREBASE_FUNCTIONS_URL}/connectAddressEth`,
							{
								headers: firebaseFunctionsHeader(
									DEFAULT_NETWORK,
									await signer.getAddress(),
									signature
								),
								method: 'POST'
							}
						).then((res) => res.json());
						localStorage.setItem('address', await signer.getAddress());
						localStorage.setItem('signature', signature);
						return { data: data, error: null };
					}
				} catch (error) {
					console.log('rejects');
					await logout();
					return { data: null, error };
				}
			} else {
				console.log('do logout');
				await logout();
				return { data: null, error: 'invalid request' };
			}
		} catch (error) {
			await logout();
			console.log(error);
		}
		return { data: null, error: 'invalid request' };
	};

	const getUserInfo = useCallback(
		async (givenProvider: SafeEventEmitterProvider): Promise<any | null> => {
			if (!web3Auth) {
				console.log('Web3 Auth not installed');
				return null;
			}
			const user = await web3Auth.getUserInfo();
			try {
				const ethersProvider = new ethers.providers.Web3Provider(givenProvider);
				const web = new Web3(givenProvider);
				setWeb3Provider(web);
				console.log('web3 provider set');
				setEthProvider(ethersProvider);
				console.log('eth provider set');
				const signer = ethersProvider.getSigner();
				const address = await signer.getAddress();
				setWeb3AuthUser({
					accounts: [address],
					email: user.email || '',
					name: user.name || ''
				});
				console.log('web3 auth user set');
				return ethersProvider;
			} catch (err) {
				console.log(err, 'err from getUserInfo');
				return null;
			}
		},
		[web3Auth]
	);

	const login = useCallback(async (): Promise<string | null> => {
		if (!web3Auth) {
			console.log('Web3 Auth not installed');
			return null;
		}
		try {
			console.log('setting connect', await web3Auth.connect());
			const provider = await web3Auth.connect();
			if(provider){
				setExpired(true);
			}
			setProvider(provider);
			return await getUserInfo(provider!);
		} catch (err) {
			console.log(`Error from login: ${err}`);
			return null;
		}
	}, [getUserInfo, web3Auth]);

	const logout = async (): Promise<any | null> => {
		if (!web3Auth) {
			console.log('Web3 Auth not installed');
			return;
		}
		await web3Auth.logout();
	};

	const authenticateUser = async (): Promise<any | undefined> => {
		if (!web3Auth) {
			console.log('Web3 Auth not installed');
			return;
		}
		const idToken = await web3Auth.authenticateUser();
		return idToken;
	};

	const signMessage = async (
		message: string,
		ethProvider: any
	): Promise<string | null> => {
		if (!ethProvider) {
			console.log('provider not initialized yet signMessage');
			return null;
		}

		const signer = ethProvider.getSigner();

		return await signer.signMessage(message);
	};

	const getChainId = async (): Promise<number | null> => {
		if (!provider || !web3Auth || !ethProvider) {
			console.log('provider not initialized yet');
			return null;
		}
		const { chainId } = await ethProvider.getNetwork();

		return chainId;
	};

	const switchChain = async (chainId?: string) => {
		try {
			if (!provider || !web3Auth) {
				console.log('provider not initialized yet');
				return;
			}
			await web3Auth.switchChain({ chainId: chainId || '0x5' });
		} catch (err) {
			console.log('error from switchChain', err);
		}
	};

	const addChain = async (newChain: NETWORK) => {
		if (!provider || !web3Auth) {
			console.log('provider not initialized yet');
			return;
		}
		await web3Auth.addChain(chainProperties[newChain]);
	};

	const sendNativeToken = async (
		destination: string,
		amount: ethers.BigNumber
	) => {
		if (!provider || !web3Auth || !ethProvider) {
			console.log('provider not initialized yet');
			return;
		}

		const signer = ethProvider.getSigner();

		const tx = await signer.sendTransaction({
			to: destination,
			value: amount.toString()
		});

		return await tx.wait();
	};

	useEffect(() => {
		if (!web3Auth) {
			init();
		}
	}, [init, web3Auth]);

	useEffect(() => {
		console.log('enter', web3Auth);
		if (web3Auth) {
			console.log('enter start login');
			login();
		}
	}, [login, web3Auth]);

	useEffect(() => {
		if (provider) getUserInfo(provider);
	}, [getUserInfo, provider]);

	useEffect(() => {
		if (!ethProvider || !web3Provider) {
			console.log('eth provider', 'line 322');
			return;
		}
		const signer = ethProvider.getSigner();
		const txUrl = returnTxUrl(network);
		const web3Adapter = new EthersAdapter({
			ethers: web3Provider as any,
			signerOrProvider: signer
		});
		const gnosisService = new GnosisSafeService(web3Adapter, signer, txUrl);
		setSafeService(gnosisService);
	}, [ethProvider, network, web3Provider]);

	return (
		<Web3AuthContext.Provider
			value={{
				addChain,
				authenticateUser,
				ethProvider,
				expired,
				getChainId,
				getUserInfo,
				handleWeb3AuthConnection,
				init,
				login,
				logout,
				provider,
				safeService,
				sendNativeToken,
				setExpired,
				signMessage,
				switchChain,
				web3Auth,
				web3AuthUser,
				web3Provider
			}}
		>
			{children}
		</Web3AuthContext.Provider>
	);
}

export function useGlobalWeb3Context() {
	return useContext(Web3AuthContext);
}
