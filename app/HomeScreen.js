import { View, Text, Image } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';

const HomeScreen = ({ navigation }) => {
  return (
    <View className="flex-1">
      {/* Image covering half the screen */}
      <Image
        source={require('../assets/images/10478138.jpg')} // Adjust the path as needed
        className="h-1/2 w-full object-cover" // Half the height, full width, cover the object
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
