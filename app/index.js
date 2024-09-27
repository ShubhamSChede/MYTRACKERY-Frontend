import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PiNavigation from './pi/PiNavigation';
import HomeScreen from './HomeScreen';
import PiAlert from './pi/PiNavigationScreens/PiAlert';
import PiProfile from './pi/PiNavigationScreens/PiProfile';
import Create from './pi/PiNavigationScreens/Create';
import CreateDep from './pi/PiNavigationScreens/CreateDep';
import CreateMeeting from './pi/PiNavigationScreens/CreateMeeting';
import CreatePat from './pi/PiNavigationScreens/CreatePat';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen}/>
        <Stack.Screen name="PiNavigation" component={PiNavigation} />
        <Stack.Screen name="PiAlert" component={PiAlert} />
        <Stack.Screen name="PiProfile" component={PiProfile} />
        <Stack.Screen name="Create" component={Create} />
        <Stack.Screen name="CreateDep" component={CreateDep}/>
        <Stack.Screen name="CreatePat" component={CreatePat}/>
        <Stack.Screen name="CreateMeeting" component={CreateMeeting}/>


      </Stack.Navigator>
    </NavigationContainer>
  );
}