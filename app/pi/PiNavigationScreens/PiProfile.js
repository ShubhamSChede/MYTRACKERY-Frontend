// PiProfile.js
import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons'; // Import Ionicons

const PiProfile = ({ navigation }) => {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg font-bold">PiProfile</Text>

      <TouchableOpacity
        className="absolute bottom-8 right-8 bg-blue-500 p-4 rounded-full"
        onPress={() => navigation.navigate('Create')}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default PiProfile;
