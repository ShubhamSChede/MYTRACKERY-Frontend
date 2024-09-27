import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import PiProfile from './PiNavigationScreens/PiProfile';
import PiAlert from './PiNavigationScreens/PiAlert';
import Create from './PiNavigationScreens/Create'; // Import CreateScreen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PiProfile" component={PiProfile} />
      <Stack.Screen name="Create" component={Create} />
    </Stack.Navigator>
  );
};

const PiNavigation = () => {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="PiProfile" component={ProfileStack} />
        <Tab.Screen name="PiAlert" component={PiAlert} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default PiNavigation;