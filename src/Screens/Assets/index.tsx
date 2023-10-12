// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AssetsTable from 'src/components/Assets/AssetsTable';
// import DropDown from 'src/components/Assets/DropDown';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import { chainProperties } from 'src/global/networkConstants';
import { IAsset } from 'src/types';
import { ExternalLinkIcon } from 'src/ui-components/CustomIcons';
import Loader from 'src/ui-components/Loader';

const Assets = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const { address, activeMultisig, gnosisSafe } =
		useGlobalUserDetailsContext();
	const [assetsData, setAssetsData] = useState<IAsset[]>([]);
	const { network } = useGlobalApiContext();

	const handleGetAssets = useCallback(async () => {
		try {
			const tokenInfo = await gnosisSafe.getMultisigAllAssets(
				network,
				activeMultisig
			);
			const assets = tokenInfo.map((token: any) => ({
				balance_token: (token.balance/ Math.pow(10, (token?.token?.decimals || chainProperties[network].decimals))),
				balance_usd: token.fiatBalance,
				logoURI: token?.token?.logoUri || chainProperties[network].logo,
				name: token?.token?.symbol || chainProperties[network].tokenSymbol
			}));
			setAssetsData(assets);
			setLoading(false);
		} catch (error) {
			console.log('ERROR', error);
			setLoading(false);
		}
	}, [activeMultisig, gnosisSafe, network]);

	useEffect(() => {
		handleGetAssets();
	}, [handleGetAssets]);

	if (loading) return <Loader size='large' />;

	return (
		<div className='h-[70vh] bg-bg-main rounded-lg'>
			{address ? (
				<div className='grid grid-cols-12 gap-4'>
					<div className='col-start-1 col-end-13'>
						<div className='flex items-center justify-between'>
							<div className='flex items-end gap-x-4'>
								<h2 className='text-base font-bold text-white mt-3 ml-5'>
									Tokens
								</h2>
							</div>
						</div>
					</div>
					<div className='col-start-1 col-end-13 mx-5'>
						<AssetsTable assets={assetsData} />
					</div>
				</div>
			) : (
				<div className='h-full w-full flex items-center justify-center text-primary font-bold text-lg'>
					<Link to='/'>
						<span>Please Login</span> <ExternalLinkIcon />
					</Link>
				</div>
			)}
		</div>
	);
};

export default Assets;
