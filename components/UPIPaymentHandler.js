// UPIPaymentHandler.js
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

export const initiateUPIPayment = async ({
  amount,
  receiverUPI,
  receiverName,
  transactionNote
}) => {
  if (Platform.OS !== 'android') {
    throw new Error('UPI payments are only supported on Android');
  }

  try {
    // For HDFC Bank UPI IDs, we'll use the specific Google Pay format
    // Note: amount should be like "1.00"
    const formattedAmount = parseFloat(amount).toFixed(2);
    
    // Google Pay specific URL (using 'tez://' scheme)
    const gpayUrl = `tez://upi/pay?pa=${receiverUPI}&pn=${encodeURIComponent(receiverName)}&am=${formattedAmount}&cu=INR`;
    
    try {
      // Try Google Pay first
      await Linking.openURL(gpayUrl);
    } catch (gpayError) {
      // If Google Pay fails, try PayTM
      const paytmUrl = `paytmmp://pay?pa=${receiverUPI}&pn=${encodeURIComponent(receiverName)}&am=${formattedAmount}&cu=INR`;
      await Linking.openURL(paytmUrl);
    }
    
    return Date.now().toString();
  } catch (error) {
    console.error('UPI Error:', error);
    throw new Error('Failed to open payment app. Please ensure Google Pay or Paytm is installed and try again.');
  }
};

export default initiateUPIPayment;