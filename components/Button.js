// components/Button.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

const Button = ({ 
  title, 
  onPress, 
  variant = 'filled', // filled, outlined, text
  size = 'medium', // small, medium, large
  loading = false,
  icon,
  className = "",
  textClassName = "",
  disabled = false
}) => {
  const variantClasses = {
    filled: 'bg-[#8B4513] border border-[#8B4513]',
    outlined: 'bg-transparent border border-[#8B4513]',
    text: 'bg-transparent border-0',
  };

  const sizeClasses = {
    small: 'py-2 px-3',
    medium: 'py-3 px-4',
    large: 'py-4 px-5',
  };

  const textVariantClasses = {
    filled: 'text-white',
    outlined: 'text-[#8B4513]',
    text: 'text-[#8B4513]',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const opacityClass = disabled ? 'opacity-50' : 'opacity-100';

  return (
    <TouchableOpacity
      className={`rounded-xl ${variantClasses[variant]} ${sizeClasses[size]} ${opacityClass} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View className="flex-row justify-center items-center">
        {loading ? (
          <ActivityIndicator size="small" color={variant === 'filled' ? 'white' : '#8B4513'} />
        ) : (
          <>
            {icon && <View className="mr-2">{icon}</View>}
            <Text 
              className={`font-bold ${textVariantClasses[variant]} ${textSizeClasses[size]} ${textClassName}`}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Button;