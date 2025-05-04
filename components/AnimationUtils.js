// components/AnimationUtils.js
import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

// Fade in animation component
export const FadeIn = ({ duration = 500, delay = 0, children, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
};

// Slide up animation component
export const SlideUp = ({ 
  duration = 500, 
  delay = 0, 
  children, 
  style, 
  distance = 50 
}) => {
  const translateY = useRef(new Animated.Value(distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

// Scale animation component
export const ScaleIn = ({ 
  duration = 300, 
  delay = 0, 
  children, 
  style 
}) => {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
      {children}
    </Animated.View>
  );
};

// Staggered animation for lists
export const createStaggeredAnimation = (items, initialDelay = 0, itemDelay = 100) => {
  return items.map((item, index) => ({
    ...item,
    animationDelay: initialDelay + index * itemDelay,
  }));
};

export default {
  FadeIn,
  SlideUp,
  ScaleIn,
  createStaggeredAnimation,
};