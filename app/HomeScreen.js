import { View, Text, Image ,  Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';
import WelcomePopup from './WelcomePopup';

const HomeScreen = ({ navigation }) => {
  const [manualPopupVisible, setManualPopupVisible] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('x-auth-token');
      if (token) {
        navigation.replace('PiNavigation');
      }
    };
    checkLoginStatus();
  }, []);

  const openLinkedInProfile = () => {
    Linking.openURL(
      'https://www.linkedin.com/in/shubham-chede-2957bb278'
    );
  };

  return (
    <View className="flex-1 bg-black p-7">
      <WelcomePopup 
        manualVisible={manualPopupVisible} 
        setManualVisible={setManualPopupVisible} 
      />
      
      <Image
        source={require('../assets/images/apphome.jpeg')}
        className="h-1/2 w-full object-cover"
      />
      
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-5xl font-bold text-white mb-2">MYTRACKERY</Text>
        
        <Text className="text-sm font-bold text-white">Finance and growth all in </Text>
        <Text className="text-sm font-bold mb-10 text-white">one place.</Text>
       
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="bg-gray-800 px-6 py-3 rounded-md mb-4"
        >
          <Text className="text-white text-lg font-semibold">GET STARTED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setManualPopupVisible(true)}
          className="mt-2"
        >
          <Text className="text-gray-400 text-base underline">View Features</Text>
        </TouchableOpacity>

                {/* Clickable link */}
                <TouchableOpacity onPress={openLinkedInProfile} className="mt-4">
          <Text className="text-gray-400 text-sm underline">
            Developed by Shubham Chede
          </Text>
        </TouchableOpacity>
        <Text className="text-gray-700 text-sm mt-2">© 2023 MYTRACKERY. All rights reserved.</Text>
        <Text className="text-gray-700 text-sm">Version 3.0.1</Text>

      </View>
    </View>
  );
};

export default HomeScreen;