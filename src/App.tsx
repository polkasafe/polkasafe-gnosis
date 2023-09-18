// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2022-2023 @Polkasafe/polkaSafe-ui authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { styledTheme } from 'src/themes/styledTheme';
// import { ThemeProvider } from 'styled-components';
// import AppLayout from './components/AppLayout';
// import { DAppContextProvider } from './context/DAppContext';
// import ModalContextProvider from './context/ModalContext';
// import { UserDetailsProvider } from './context/UserDetailsContext';
// import { GlobalStyle } from './ui-components/GlobalStyle';
import { Astar } from '@thirdweb-dev/chains';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// import Ath from './auth/Ath';
import AppLayout from './components/AppLayout';
import { ActiveMultisigProvider } from './context/ActiveMultisigContext';
import { ApiContextProvider } from './context/ApiContext';
import { DAppContextProvider } from './context/DAppContext';
import ModalContextProvider from './context/ModalContext';
import { UserDetailsProvider } from './context/UserDetailsContext';
import { FIREBASE_FUNCTIONS_URL } from './global/firebaseFunctionsUrl';
import { antdTheme } from './themes/antdTheme';
import { GlobalStyle } from './ui-components/GlobalStyle';
const activeChain = Astar;

function App() {
	return (
		<BrowserRouter>
			<ConfigProvider theme={antdTheme}>
				<ApiContextProvider>
					<ThirdwebProvider
						activeChain={activeChain}
						clientId="b2c09dab179152e7936744fa00899dfa"
						authConfig={{
							domain: FIREBASE_FUNCTIONS_URL as string
						}}
					>
						<UserDetailsProvider>
							<ActiveMultisigProvider>
								<DAppContextProvider>
									<GlobalStyle />
									<ModalContextProvider>
										<AppLayout />
									</ModalContextProvider>
								</DAppContextProvider>
							</ActiveMultisigProvider>
						</UserDetailsProvider>
					</ThirdwebProvider>
				</ApiContextProvider>
			</ConfigProvider>
		</BrowserRouter>
	);
}

export default App;
