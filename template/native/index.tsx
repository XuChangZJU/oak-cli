/**
 * @format
 */
import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { setJSExceptionHandler } from 'react-native-exception-handler';
import features from './initialize';
import App from './App';
import { name as appName } from './app.json';
import { handler as exceptionHandler } from '@project/exceptionHandler';

import {
	FeaturesProvider,
} from 'oak-frontend-base/es/platforms/native/features';

// to 详化
setJSExceptionHandler((exception) => {
	exceptionHandler(exception, features);
});

function Root() {
	features.navigator.setNamespace('/frontend');
	return (
		<FeaturesProvider features={features as any}>
			<App />
		</FeaturesProvider>
	);
}

AppRegistry.registerComponent(appName, () => Root);
