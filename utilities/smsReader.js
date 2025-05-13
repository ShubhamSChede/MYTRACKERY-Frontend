import { NativeModules, Platform } from 'react-native';

const { SmsReader } = NativeModules;

class SmsReaderService {
    async requestPermission() {
        if (Platform.OS !== 'android') {
            throw new Error('SMS reading is only supported on Android');
        }
        return await SmsReader.requestSmsPermission();
    }

    async readSms() {
        if (Platform.OS !== 'android') {
            throw new Error('SMS reading is only supported on Android');
        }
        return await SmsReader.readSms();
    }
}

export default new SmsReaderService(); 