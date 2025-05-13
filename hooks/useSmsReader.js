import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import smsReader from '../utilities/smsReader';
import { API_URL } from '../constants/Config';
import { useAuth } from './useAuth';

export const useSmsReader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuth();

    const processSms = useCallback(async () => {
        try {
            setIsLoading(true);

            // Request SMS permission
            const hasPermission = await smsReader.requestPermission();
            if (!hasPermission) {
                Alert.alert('Permission Required', 'Please grant SMS permission to continue');
                return;
            }

            // Read SMS messages
            const messages = await smsReader.readSms();

            // Process each message
            for (const message of messages) {
                try {
                    const response = await fetch(`${API_URL}/api/sms/parse`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            smsText: message.body
                        })
                    });

                    if (!response.ok) {
                        console.error('Failed to process SMS:', message.id);
                    }
                } catch (error) {
                    console.error('Error processing SMS:', error);
                }
            }

            Alert.alert('Success', 'SMS processing completed');
        } catch (error) {
            Alert.alert('Error', 'Failed to process SMS messages');
            console.error('SMS processing error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    return {
        processSms,
        isLoading
    };
}; 