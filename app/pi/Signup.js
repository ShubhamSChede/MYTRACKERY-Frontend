import { View, Text, Image, TextInput, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';

const Signup = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://expensetrackerbackend-j2tz.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Signup Successful', 'You can now log in!');
        navigation.navigate('Login');
      } else {
        Alert.alert('Signup Failed', data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Network Error', 'Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black p-7">
      <Image
        source={require('../../assets/images/4860253.jpg')}
        className="w-full h-1/3 object-cover"
      />
      
      <View className="mt-10 justify-center items-center bg-black p-2">
        <Text className="text-2xl font-bold mb-4 text-white">CREATE ACCOUNT</Text>

        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          placeholderTextColor="#9ca3af"
          className="border border-gray-900 bg-gray-800 rounded-md w-full p-2 mb-4 text-white placeholder:text-white"
          autoCapitalize="none"
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          className="border border-gray-900 bg-gray-800 rounded-md w-full p-2 mb-4 text-white placeholder:text-white"
          autoCapitalize="none"
        />

        <View className="w-full relative">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            className="border border-gray-900 bg-gray-800 rounded-md w-full p-2 mb-4 text-white placeholder:text-white pr-12"
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5"
          >
            {showPassword ? (
              <Eye size={24} color="#9ca3af" />
            ) : (
              <EyeOff size={24} color="#9ca3af" />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSignup}
          disabled={loading}
          className={`bg-gray-800 px-10 py-3 rounded-md w-full mb-2 ${loading ? 'opacity-50' : ''}`}
        >
          <Text className="text-white text-lg font-semibold text-center">
            {loading ? 'SIGNING UP...' : 'SIGNUP'}
          </Text>
        </TouchableOpacity>

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