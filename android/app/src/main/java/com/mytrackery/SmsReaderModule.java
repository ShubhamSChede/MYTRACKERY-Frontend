package com.mytrackery;

import android.Manifest;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.Telephony;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

public class SmsReaderModule extends ReactContextBaseJavaModule {
    private static final String TAG = "SmsReaderModule";
    private static final int SMS_PERMISSION_CODE = 123;
    private final ReactApplicationContext reactContext;

    public SmsReaderModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "SmsReader";
    }

    @ReactMethod
    public void requestSmsPermission(Promise promise) {
        if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_SMS)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(getCurrentActivity(),
                    new String[]{Manifest.permission.READ_SMS},
                    SMS_PERMISSION_CODE);
            promise.resolve(false);
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void readSms(Promise promise) {
        if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_SMS)
                != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSION_DENIED", "SMS permission not granted");
            return;
        }

        try {
            WritableArray smsList = Arguments.createArray();
            Uri uri = Uri.parse("content://sms/inbox");
            String[] projection = {
                    Telephony.Sms._ID,
                    Telephony.Sms.ADDRESS,
                    Telephony.Sms.BODY,
                    Telephony.Sms.DATE
            };
            String selection = Telephony.Sms.BODY + " LIKE ?";
            String[] selectionArgs = {"%Rs.%", "%INR%", "%paid to%", "%sent to%"};
            String sortOrder = Telephony.Sms.DATE + " DESC";

            Cursor cursor = reactContext.getContentResolver().query(
                    uri,
                    projection,
                    selection,
                    selectionArgs,
                    sortOrder
            );

            if (cursor != null && cursor.moveToFirst()) {
                do {
                    WritableMap sms = Arguments.createMap();
                    sms.putString("id", cursor.getString(cursor.getColumnIndexOrThrow(Telephony.Sms._ID)));
                    sms.putString("address", cursor.getString(cursor.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)));
                    sms.putString("body", cursor.getString(cursor.getColumnIndexOrThrow(Telephony.Sms.BODY)));
                    sms.putString("date", cursor.getString(cursor.getColumnIndexOrThrow(Telephony.Sms.DATE)));
                    smsList.pushMap(sms);
                } while (cursor.moveToNext());
                cursor.close();
            }

            promise.resolve(smsList);
        } catch (Exception e) {
            Log.e(TAG, "Error reading SMS: " + e.getMessage());
            promise.reject("ERROR", "Failed to read SMS: " + e.getMessage());
        }
    }
} 