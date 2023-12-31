// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import { useAddress } from '@thirdweb-dev/react';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import AddressCard from 'src/components/Home/AddressCard';
import ConnectWallet from 'src/components/Home/ConnectWallet';
import ConnectWalletWrapper from 'src/components/Home/ConnectWallet/ConnectWalletWrapper';
import NewUserModal from 'src/components/Home/ConnectWallet/NewUserModal';
import DashboardCard from 'src/components/Home/DashboardCard';
import TxnCard from 'src/components/Home/TxnCard';
import AddMultisig from 'src/components/Multisig/AddMultisig';
import Loader from 'src/components/UserFlow/Loader';
import { useGlobalApiContext } from 'src/context/ApiContext';
import { useGlobalUserDetailsContext } from 'src/context/UserDetailsContext';
import Spinner from 'src/ui-components/Loader';
import styled from 'styled-components';

const Home = () => {
	const { address, multisigAddresses, activeMultisig, loading, gnosisSafe, createdAt, addressBook } = useGlobalUserDetailsContext();
	const [hasProxy] = useState<boolean>(true);
	const metaMaskAddress = useAddress();

	const [transactionLoading] = useState(false);
	const [isOnchain, setIsOnchain] = useState(true);
	const [openTransactionModal, setOpenTransactionModal] = useState(false);
	const [openNewUserModal, setOpenNewUserModal] = useState(false);
	const { network } = useGlobalApiContext();

	useEffect(() => {
		if ((dayjs(createdAt) > dayjs().subtract(15, 'seconds')) && addressBook?.length === 1) {
			setOpenNewUserModal(true);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createdAt]);

	useEffect(() => {
		const handleNewTransaction = async () => {
			if (!activeMultisig || Boolean(!Object.keys(gnosisSafe).length)) return;
			const safeData = await gnosisSafe.getSafeCreationInfo(activeMultisig);
			if (safeData) {
				setIsOnchain(true);
			} else {
				setIsOnchain(false);
			}

		};
		handleNewTransaction();
	}, [activeMultisig, gnosisSafe]);

	return (
		<>
			{
				address === metaMaskAddress ?
					<>
						<NewUserModal open={openNewUserModal} onCancel={() => setOpenNewUserModal(false)} />
						{ loading ? <Spinner size='large' /> :multisigAddresses.filter((address:any) => address.network === network).length > 0
							?
							<section>
								<div className="mb-0 grid grid-cols-16 gap-4 grid-row-2 lg:grid-row-1 h-auto">
									<div className='col-start-1 col-end-13 lg:col-end-8'>
										<DashboardCard transactionLoading={transactionLoading} isOnchain={isOnchain} setOpenTransactionModal={setOpenTransactionModal} openTransactionModal={openTransactionModal} hasProxy={hasProxy} setNewTxn={() => { }} />
									</div>
									<div className='col-start-1 col-end-13 lg:col-start-8 h-full'>
										<AddressCard />
									</div>
								</div>
								<div className="grid grid-cols-12 gap-4 grid-row-2 lg:grid-row-1">
									<div className='col-start-1 col-end-13 lg:col-end-13'>
										<TxnCard />
									</div>
								</div>
							</section>
							:
							<section className='bg-bg-main p-5 rounded-lg scale-90 w-[111%] h-[111%] origin-top-left'>
								<section className='grid grid-cols-2 gap-x-5'>
									<Loader className='bg-primary col-span-1' />
									<Loader className='bg-primary col-span-1' />
								</section>
								<AddMultisig className='mt-4' homepage />
							</section>}
					</>
					:
					<ConnectWalletWrapper>
						<ConnectWallet />
					</ConnectWalletWrapper>
			}
		</>
	);
};

export default styled(Home)`
	.ant-spin-nested-loading .ant-spin-blur{
		opacity: 0 !important;
	}
	.ant-spin-nested-loading .ant-spin-blur::after{
		opacity: 1 !important;
	}
`;