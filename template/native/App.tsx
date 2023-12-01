/**
 * React Native App for Oak Framework
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
	NavigationContainer,
	useNavigationContainerRef,
} from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import useFeatures from '@project/hooks/useFeatures';

import allRouters from './router';

const Stack = createStackNavigator();


function App() {
	const navigationRef = useNavigationContainerRef(); // You can also use a regular ref with `React.useRef()`
	const features = useFeatures();

	useEffect(() => {
		if (navigationRef) {
			features.navigator.setHistory(navigationRef as any);
		}
	}, []);

	useEffect(() => {
		if (navigationRef) {
			features.navigator.setHistory(navigationRef as any);
		}
	}, [navigationRef]);

	return (
		<NavigationContainer ref={navigationRef}>
			<Stack.Navigator>
				{allRouters.map(ele => {
					return (
						<Stack.Screen
							key={ele.path}
							name={ele.path}
							component={ele.component}
							options={ele.options}
						/>
					);
				})}
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default App;
