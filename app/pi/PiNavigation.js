import React, { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Expenses from './PiNavigationScreens/Expenses';
import Profile from './PiNavigationScreens/Profile';

const Tab = createBottomTabNavigator();

const PiNavigation = () => {
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Exit App", "Are you sure you want to exit?", [
        { text: "Cancel", onPress: () => null, style: "cancel" },
        { text: "YES", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',  // Set background color to black
          borderTopColor: '#333',   // Set border color to dark gray (optional)
        },
        tabBarActiveTintColor: '#fff',  // Active icon color (white)
        tabBarInactiveTintColor: '#888', // Inactive icon color (gray)
      }}
    >
      <Tab.Screen
        name="Expenses"
        component={Expenses}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon2 name="money" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon2 name="bar-chart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default PiNavigation;
