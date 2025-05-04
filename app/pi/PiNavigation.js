// app/pi/PiNavigation.js
import React, { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BarChart2, BookOpen, PlusCircle } from 'lucide-react-native';
import Expenses from './PiNavigationScreens/Expenses';
import Insights from './PiNavigationScreens/Insights';
import Journal from './PiNavigationScreens/Journal';
import Dashboard from '../../components/Dashboard';
import Create from './PiNavigationScreens/Create';

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
          backgroundColor: '#ffffff',
          borderTopColor: '#f5f5f5',
          borderTopWidth: 1,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#8B4513',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Expenses"
        component={Expenses}
        options={{
          tabBarIcon: ({ color, size }) => (
            <PlusCircle size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Journal"
        component={Journal}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Insights"
        component={Insights}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BarChart2 size={size} color={color} />
          ),
        }}
      />

<Tab.Screen 
    name="Create" 
    component={Create} 
    options={{ 
      tabBarButton: () => null,
      tabBarVisible: false
    }}
  />

    </Tab.Navigator>
  );
};

export default PiNavigation;