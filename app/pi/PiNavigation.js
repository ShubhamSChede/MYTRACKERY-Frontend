import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Import the Icon component
import Expenses from './PiNavigationScreens/Expenses';
import Icon2 from 'react-native-vector-icons/FontAwesome'
import Profile from './PiNavigationScreens/Profile';

const Tab = createBottomTabNavigator();

const PiNavigation = () => {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
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
              <Icon2 name="bar-chart" size={size} color={color} /> // Insights Icon
            ),
          }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default PiNavigation;
