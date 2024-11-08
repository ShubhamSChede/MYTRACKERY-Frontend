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
   
    <View className="flex-1 bg-black p-7 ">
      <Image
        source={require('../assets/images/10478138.png')}
        className="h-1/2 w-full object-cover "
      />
      
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-5xl font-bold text-white">EXPENSE TRACKER</Text>
        <Text className="text-sm font-bold mb-10 text-white">Track your expenses easily</Text>
       
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="bg-gray-800 px-6 py-3 rounded-md"
        >
          <Text className="text-white text-lg font-semibold">GET STARTED</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
