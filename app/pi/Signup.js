import { View, Text, Image, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

const Signup = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      const response = await fetch('https://expensetrackerbackend-j2tz.onrender.com/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Handle successful signup, e.g., navigate to the login screen
        Alert.alert('Signup Successful', 'You can now log in!');
        navigation.navigate('Login');
      } else {
        // Handle error
        Alert.alert('Signup Failed', data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Please check your internet connection.');
    }
  };

  return (
    <View className="flex-1 bg-black p-7">
      <Image
        source={require('../../assets/images/loginpic.png')} // Adjust the path as needed
        className="h-1/3 w-full object-cover" // 30% of the height
      />
      
      <View className="flex-1 justify-center items-center bg-black p-4">
        <Text className="text-2xl font-bold mb-4 text-white">CREATE ACCOUNT</Text>

        {/* Username Input */}
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
           placeholderTextColor="#9ca3af"
          className="border border-gray-900 bg-gray-800 rounded-md w-full p-2 mb-4 text-white placeholder:text-white"
        />

        {/* Email Input */}
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
           placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          className="border border-gray-900 bg-gray-800 rounded-md w-full p-2 mb-4 text-white placeholder:text-white"
        />

        {/* Password Input */}
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
           placeholderTextColor="#9ca3af"
          secureTextEntry
          className="border border-gray-900 bg-gray-800 rounded-md w-full p-2 mb-4 text-white placeholder:text-white"
        />

        {/* Signup Button */}
        <TouchableOpacity
          onPress={handleSignup}
          className="bg-gray-800 px-6 py-3 rounded-md w-full mb-2"
        >
          <Text className="text-white text-lg font-semibold text-center">SIGNUP</Text>
        </TouchableOpacity>

        {/* Already Registered Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="mb-2"
        >
          <Text className="text-white underline">Already registered?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Signup;
