import { View, Text, Image } from 'react-native';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';

const HomeScreen = ({ navigation }) => {
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (token) {
        navigation.replace('PiNavigation'); // Navigate directly to PiNavigation if token exists
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <View className="flex-1">
      <Image
        source={require('../assets/images/10478138.jpg')}
        className="h-1/2 w-full object-cover"
      />
      
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-5xl font-bold">EXPENSE TRACKER</Text>
        <Text className="text-sm font-bold mb-10">Track your expenses easily</Text>
       
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="bg-black px-6 py-3 rounded-md"
        >
          <Text className="text-white text-lg font-semibold">GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
