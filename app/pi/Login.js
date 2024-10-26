import { View, Text, Image, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://expensetrackerbackend-j2tz.onrender.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.token) {
        // Store the token
        await AsyncStorage.setItem('x-auth-token', data.token);
        Alert.alert('Login Successful', 'Welcome back!');
        navigation.navigate('PiNavigation');
      } else {
        Alert.alert('Login Failed', data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Network Error', 'Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <Image
        source={require('../../assets/images/loginpic2.png')}
        className="h-1/3 w-full object-cover"
      />
      
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg font-bold mb-4">Login Screen</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          className="border border-gray-300 rounded-md w-full p-2 mb-4"
          autoCapitalize="none"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          className="border border-gray-300 rounded-md w-full p-2 mb-4"
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`bg-black px-6 py-3 rounded-md w-full mb-2 ${loading ? 'opacity-50' : ''}`}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          className="mb-2"
        >
          <Text className="text-blue-500">Not registered?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;