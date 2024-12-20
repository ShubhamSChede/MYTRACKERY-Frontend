import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PiNavigation from './pi/PiNavigation';
import HomeScreen from './HomeScreen';
import Profile from './pi/PiNavigationScreens/Profile';
import Expenses from './pi/PiNavigationScreens/Expenses';
import Create from './pi/PiNavigationScreens/Create';
import Journal from './pi/PiNavigationScreens/Journal';
import Login from './pi/Login';
import Signup from './pi/Signup';
import Logout from '@/components/Logout';
import * as Notifications from 'expo-notifications'

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    async function configurePushNotifications() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Schedule a notification every 24 hours (for testing, you can reduce this)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily Update",
          body: "This is a push notification from your app.",
        },
        trigger: {
          seconds: 15,
          //seconds: 24 * 60 * 60, // 24 hours
          repeats: true,
        },
      });
    }
    configurePushNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer >
      <Stack.Navigator initialRouteName="HomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen}/>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="PiNavigation" component={PiNavigation} />
        <Stack.Screen name="Journal" component={Journal} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Expenses" component={Expenses} />
        <Stack.Screen name="Create" component={Create} />
        <Stack.Screen name="Logout" component={Logout} />
      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}