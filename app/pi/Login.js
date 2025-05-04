import { View, Text, Image, TextInput, Alert, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { FadeIn, SlideUp } from '../../components/AnimationUtils';
import { Dimensions } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  // Calculate header height based on screen size - adaptive sizing
  const headerHeight = screenHeight * 0.3; // 30% of screen height

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
                style={{ width: 60, height: 60, resizeMode: 'contain' }}
              />
              <Text className="text-white text-2xl font-bold mt-1">MYTRACKERY</Text>
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
            <Text className="text-xl font-bold text-[#8B4513] mb-4 text-center">Welcome Back</Text>
            
            {/* Email Input */}
            <View className="mb-3">
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
            <View className="mb-4">
              <Text className="text-gray-700 mb-1 font-medium text-sm">Password</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-3">
                <Lock size={18} color="#8B4513" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
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
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`bg-[#8B4513] py-3 rounded-xl ${loading ? 'opacity-70' : ''}`}
            >
              <Text className="text-white font-bold text-center">
                {loading ? 'Logging In...' : 'Login'}
              </Text>
            </TouchableOpacity>

        
          </View>
        </SlideUp>

        {/* Sign Up Link */}
        <View className="mt-4 mb-4">
          <View className="flex-row justify-center">
            <Text className="text-gray-600 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text className="text-[#8B4513] font-bold text-sm">Sign Up</Text>
            </TouchableOpacity>
          </View>
          
          {/* Version Info */}
          <Text className="text-gray-400 text-xs text-center mt-2">
            Version 3.1.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;