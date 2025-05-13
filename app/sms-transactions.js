import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../constants/Config';
import { Picker } from '@react-native-picker/picker';
import { TextInput } from 'react-native-gesture-handler';

export default function SmsTransactionsScreen() {
    const { token } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchPendingTransactions();
        fetchCategories();
    }, []);

    const fetchPendingTransactions = async () => {
        try {
            const response = await fetch(`${API_URL}/api/sms/pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setTransactions(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch pending transactions');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/api/expenses/categories`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch categories');
        }
    };

    const handleApprove = async (transactionId) => {
        if (!selectedCategory) {
            Alert.alert('Error', 'Please select a category');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/sms/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    transactionId,
                    categoryId: selectedCategory,
                    reason
                })
            });

            if (response.ok) {
                Alert.alert('Success', 'Transaction approved');
                fetchPendingTransactions();
                setReason('');
                setSelectedCategory('');
            } else {
                Alert.alert('Error', 'Failed to approve transaction');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to approve transaction');
        }
    };

    const handleReject = async (transactionId) => {
        try {
            const response = await fetch(`${API_URL}/api/sms/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    transactionId,
                    reason
                })
            });

            if (response.ok) {
                Alert.alert('Success', 'Transaction rejected');
                fetchPendingTransactions();
                setReason('');
            } else {
                Alert.alert('Error', 'Failed to reject transaction');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to reject transaction');
        }
    };

    const renderTransaction = ({ item }) => (
        <View style={styles.transactionCard}>
            <Text style={styles.merchantName}>{item.merchantName}</Text>
            <Text style={styles.amount}>₹{item.amount}</Text>
            <Text style={styles.date}>{new Date(item.transactionDate).toLocaleDateString()}</Text>
            <Text style={styles.smsText}>{item.smsText}</Text>

            <View style={styles.categoryContainer}>
                <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(value) => setSelectedCategory(value)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Category" value="" />
                    {categories.map((category) => (
                        <Picker.Item
                            key={category._id}
                            label={category.name}
                            value={category._id}
                        />
                    ))}
                </Picker>
            </View>

            <TextInput
                style={styles.reasonInput}
                placeholder="Reason (optional)"
                value={reason}
                onChangeText={setReason}
                multiline
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.approveButton]}
                    onPress={() => handleApprove(item._id)}
                >
                    <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.rejectButton]}
                    onPress={() => handleReject(item._id)}
                >
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 16,
    },
    transactionCard: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    merchantName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    amount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2ecc71',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    smsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    categoryContainer: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
    },
    picker: {
        height: 50,
    },
    reasonInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 8,
        marginBottom: 16,
        minHeight: 80,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    approveButton: {
        backgroundColor: '#2ecc71',
    },
    rejectButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
}); 