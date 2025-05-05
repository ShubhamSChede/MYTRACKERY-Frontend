import { View, Text, Image, TextInput, Alert, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { FadeIn, SlideUp } from '../../components/AnimationUtils';
import { Dimensions } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

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

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
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

  // Calculate header height based on screen size - adaptive sizing
  const headerHeight = screenHeight * 0.25; // 25% of screen height for signup (needs more space for form)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#8B4513" />
      
      {/* Header with Logo */}
      <View className="bg-[#8B4513]" style={{ height: headerHeight }}>
        <View className="flex-1 justify-center items-center">
          <FadeIn>
            <View className="items-center">
              <Image 
                source={require('../../assets/images/finallogo.png')} 
                style={{ width: 55, height: 55, resizeMode: 'contain' }}
              />
              <Text className="text-white text-xl font-bold mt-1">MYTRACKERY</Text>
              <Text className="text-white/70 text-xs">Track. Save. Prosper.</Text>
            </View>
          </FadeIn>
        </View>
        
        {/* Wave Design */}
        <View>
          <Svg height="40" width={screenWidth} viewBox={`0 0 ${screenWidth} 40`}>
            <Path
              d={`
                M0,0
                L${screenWidth},0
                L${screenWidth},15
                Q${screenWidth * 0.75},35 ${screenWidth * 0.5},25
                Q${screenWidth * 0.25},15 0,30
                Z
              `}
              fill="white"
            />
          </Svg>
        </View>
      </View>

      {/* Form Section */}
      <View className="flex-1 px-6 mt-8">
        <SlideUp delay={150}>
          <View className="bg-white rounded-3xl shadow-md elevation-3 p-5">
            <Text className="text-xl font-bold text-[#8B4513] mb-3 text-center">Create Account</Text>
            
            {/* Username Input */}
            <View className="mb-2">
              <Text className="text-gray-700 mb-1 font-medium text-sm">Username</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-3">
                <User size={18} color="#8B4513" />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Choose a username"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 py-2 px-2 text-gray-800"
                  autoCapitalize="none"
                />
              </View>
            </View>
            
            {/* Email Input */}
            <View className="mb-2">
              <Text className="text-gray-700 mb-1 font-medium text-sm">Email</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-3">
                <Mail size={18} color="#8B4513" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  className="flex-1 py-2 px-2 text-gray-800"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-3">
              <Text className="text-gray-700 mb-1 font-medium text-sm">Password</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-3">
                <Lock size={18} color="#8B4513" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  className="flex-1 py-2 px-2 text-gray-800"
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <Eye size={18} color="#8B4513" />
                  ) : (
                    <EyeOff size={18} color="#8B4513" />
                  )}
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500 text-xs pl-1">
                Password must be at least 6 characters long
              </Text>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading}
              className={`bg-[#8B4513] py-3 rounded-xl ${loading ? 'opacity-70' : ''}`}
            >
              <Text className="text-white font-bold text-center">
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </SlideUp>

        {/* Terms and Login Link */}
        <View className="mt-2 mb-2">
          <Text className="text-gray-500 text-center text-xs">
            By signing up, you agree to our Terms of Service
          </Text>
          
          <View className="flex-row justify-center mt-3">
            <Text className="text-gray-600 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-[#8B4513] font-bold text-sm">Login</Text>
            </TouchableOpacity>
          </View>
          
          {/* Version Info */}
          <Text className="text-gray-400 text-xs text-center mt-1">
            Version 3.0.3
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Signup;