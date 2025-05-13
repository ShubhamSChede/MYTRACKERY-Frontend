// app/index.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PiNavigation from './pi/PiNavigation';
import HomeScreen from './HomeScreen';
import Insights from './pi/PiNavigationScreens/Insights';
import Expenses from './pi/PiNavigationScreens/Expenses';
import Create from './pi/PiNavigationScreens/Create';
import Journal from './pi/PiNavigationScreens/Journal';
import Login from './pi/Login';
import Signup from './pi/Signup';
import Logout from '@/components/Logout';
import { useSmsReader } from '../hooks/useSmsReader';
import { Link } from 'expo-router';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('x-auth-token');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName={isLoggedIn ? "PiNavigation" : "HomeScreen"} 
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="HomeScreen" component={HomeScreen}/>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="PiNavigation" component={PiNavigation} />
          <Stack.Screen name="Journal" component={Journal} />
          <Stack.Screen name="Insights" component={Insights} />
          <Stack.Screen name="Expenses" component={Expenses} />
          <Stack.Screen name="Create" component={Create} />
          <Stack.Screen name="Logout" component={Logout} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export function HomeScreen() {
    const { processSms, isLoading } = useSmsReader();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>MYTrackery</Text>
            
            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={processSms}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Processing SMS...' : 'Process SMS'}
                </Text>
            </TouchableOpacity>

            <Link href="/sms-transactions" asChild>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>View Pending Transactions</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});