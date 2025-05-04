// components/Card.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Card = ({ 
  title, 
  children, 
  actionText, 
  onAction, 
  className = "", 
  titleClassName = "" 
}) => {
  return (
    <View className={`p-4 bg-white rounded-3xl shadow-md elevation-3 border border-[#8B4513]/10 ${className}`}>
      <View className="flex-row justify-between items-center mb-3">
        <Text className={`text-[#8B4513] text-lg font-bold ${titleClassName}`}>{title}</Text>
        {actionText && onAction && (
          <TouchableOpacity onPress={onAction}>
            <Text className="text-[#8B4513]">{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
};

export default Card;