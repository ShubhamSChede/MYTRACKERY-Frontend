import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Logout = () => {
  const navigation = useNavigation(); // This should give you access to navigation

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('x-auth-token');
      navigation.navigate('Login'); // Use 'Login' as your login screen name
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ padding: 30, backgroundColor: 'red', borderRadius: 5 }}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
    </TouchableOpacity>
  );
};

export default Logout;
