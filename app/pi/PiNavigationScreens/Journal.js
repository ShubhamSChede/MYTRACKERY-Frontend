import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { X, Plus, PencilLine, Calendar, Trash, ChevronLeft, ChevronRight } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

const Journal = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [editing, setEditing] = useState(false);
  const [yearData, setYearData] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  
  const [formData, setFormData] = useState({
    monthYear: '',
    monthHighlight: '',
    skillsLearnt: '',
    productivity: { rating: 5, note: '' },
    health: { rating: 5, note: '' },
    mood: { rating: 5, note: '' },
  });

  const chartConfig = {
    backgroundColor: '#1e1e1e',
    backgroundGradientFrom: '#1e1e1e',
    backgroundGradientTo: '#1e1e1e',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  // Add year navigation controls
  const YearNavigation = () => (
    <View className="flex-row items-center justify-center mb-4">
      <TouchableOpacity 
        onPress={() => setSelectedYear(prev => prev - 1)}
        className="p-2"
      >
        <ChevronLeft color="#ffffff" size={24} />
      </TouchableOpacity>
      <Text className="text-white text-xl font-bold mx-4">{selectedYear}</Text>
      <TouchableOpacity 
        onPress={() => setSelectedYear(prev => prev + 1)}
        className="p-2"
      >
        <ChevronRight color="#ffffff" size={24} />
      </TouchableOpacity>
    </View>
  );

  // Validation functions
  const validateMonthYear = (value) => {
    const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
    if (!regex.test(value)) {
      return false;
    }
    const currentYear = new Date().getFullYear();
    const year = parseInt(value.split('-')[0]);
    return year >= 2000 ;
  };

  const validateForm = () => {
    const errors = [];

    if (!selectedMonth && !formData.monthYear) {
      errors.push('Month and Year is required');
    } else if (!selectedMonth && !validateMonthYear(formData.monthYear)) {
      errors.push('Invalid Month-Year format. Use YYYY-MM (e.g., 2024-12)');
    }

    if (!formData.monthHighlight?.trim()) {
      errors.push('Month Highlight is required');
    }
    if (!formData.skillsLearnt?.trim()) {
      errors.push('Skills Learnt is required');
    }

    return errors;
  };

  // Fetch all journals
  const fetchJournals = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('x-auth-token');
      const response = await fetch('https://expensetrackerbackend-j2tz.onrender.com/api/journal', {
        headers: {
          'x-auth-token': token,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setJournals(data);
        organizeDataByYear(data);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch journals');
    } finally {
      setLoading(false);
    }
  };

  const organizeDataByYear = (data) => {

    console.log('Raw data:', data); // Log raw data

    const organized = data.reduce((acc, journal) => {
      const [year, month] = journal.monthYear.split('-');

      console.log('Processing entry:', year, month);

      if (!acc[year]) {
        acc[year] = {
          months: {},
          chartData: {
            labels: Array(12).fill('').map((_, i) => getMonthName(i + 1)),
            datasets: [
              {
                data: Array(12).fill(0),
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                strokeWidth: 2,
              },
              {
                data: Array(12).fill(0),
                color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
                strokeWidth: 2,
              },
              {
                data: Array(12).fill(0),
                color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                strokeWidth: 2,
              },
            ],
            legend: ['Productivity', 'Health', 'Mood'],
          },
        };
      }
      
      acc[year].months[month] = journal;
      const monthIndex = parseInt(month) - 1;
      acc[year].chartData.datasets[0].data[monthIndex] = journal.productivity.rating;
      acc[year].chartData.datasets[1].data[monthIndex] = journal.health.rating;
      acc[year].chartData.datasets[2].data[monthIndex] = journal.mood.rating;
      
      return acc;
    }, {});

     // Update available years
     const years = Object.keys(organized).sort((a, b) => b - a);
     setAvailableYears(years);

        // If no data exists for selected year, create empty structure
    if (!organized[selectedYear]) {
      organized[selectedYear] = {
        months: {},
        chartData: {
          labels: Array(12).fill('').map((_, i) => getMonthName(i + 1)),
          datasets: [
            {
              data: Array(12).fill(0),
              color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
              strokeWidth: 2,
            },
            {
              data: Array(12).fill(0),
              color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
              strokeWidth: 2,
            },
            {
              data: Array(12).fill(0),
              color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
              strokeWidth: 2,
            },
          ],
          legend: ['Productivity', 'Health', 'Mood'],
        },
      };
    }
    console.log('Organized data:', organized); 
    setYearData(organized);
  };

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  const createJournal = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('x-auth-token');
      
      // Ensure proper monthYear format
      const payload = {
        monthYear: selectedMonth || formData.monthYear,
        monthHighlight: formData.monthHighlight,
        skillsLearnt: formData.skillsLearnt,
        productivity: formData.productivity,
        health: formData.health,
        mood: formData.mood
      };
  
  
      const response = await fetch('https://expensetrackerbackend-j2tz.onrender.com/api/journal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(payload)
      });
  
      const data = await response.json();
      
  
      if (response.ok) {
        Alert.alert('Success', 'Journal created successfully');
        await fetchJournals();
        resetForm();
      } else {
        Alert.alert('Error', data.message || 'Failed to create journal');
      }
    } catch (error) {
      Alert.alert('Debug Error', error.toString());
    } finally {
      setLoading(false);
    }
  };

  // Update journal
  const updateJournal = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('x-auth-token');
      const response = await fetch(
        `https://expensetrackerbackend-j2tz.onrender.com/api/journal/${selectedMonth}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Journal updated successfully');
        await fetchJournals();
        setEditing(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to update journal');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update journal');
    } finally {
      setLoading(false);
    }
  };

  const deleteJournal = async (monthYear) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('x-auth-token');
      const response = await fetch(
        `https://expensetrackerbackend-j2tz.onrender.com/api/journal/${monthYear}`,
        {
          method: 'DELETE',
          headers: {
            'x-auth-token': token,
          },
        }
      );
      
      if (response.ok) {
        Alert.alert('Success', 'Journal deleted successfully');
        await fetchJournals();
        resetForm();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to delete journal');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete journal');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      Alert.alert(
        'Validation Error',
        validationErrors.join('\n'),
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (editing) {
      await updateJournal();
    } 
    if(selectedMonth) {
      await createJournal();
    }
  };

  const resetForm = () => {
    setFormData({
      monthYear: '',
      monthHighlight: '',
      skillsLearnt: '',
      productivity: { rating: 5, note: '' },
      health: { rating: 5, note: '' },
      mood: { rating: 5, note: '' },
    });
    setSelectedMonth(null);
    setEditing(false);
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const renderForm = () => (
    <ScrollView className="flex-1">
      <View className="mb-4">
        <Text className="text-white text-lg mb-2">Month Highlight</Text>
        <TextInput
          className="bg-gray-800 rounded-md p-3 text-white"
          placeholder="What was the highlight of your month?"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          value={formData.monthHighlight}
          onChangeText={(text) => setFormData({ ...formData, monthHighlight: text })}
        />
      </View>

      <View className="mb-4">
        <Text className="text-white text-lg mb-2">Skills Learnt</Text>
        <TextInput
          className="bg-gray-800 rounded-md p-3 text-white"
          placeholder="What skills did you learn this month?"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          value={formData.skillsLearnt}
          onChangeText={(text) => setFormData({ ...formData, skillsLearnt: text })}
        />
      </View>

      {/* Productivity Section */}
      <View className="mb-6">
        <Text className="text-white text-lg mb-2">Productivity</Text>
        <View className="bg-gray-800 rounded-md p-4">
          <Text className="text-white mb-2">Rating: {formData.productivity.rating}</Text>
          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={formData.productivity.rating}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                productivity: { ...formData.productivity, rating: value },
              })
            }
            minimumTrackTintColor="#4ade80"
            maximumTrackTintColor="#6b7280"
            thumbTintColor="#4ade80"
          />
          <TextInput
            className="mt-3 bg-gray-700 rounded-md p-3 text-white"
            placeholder="Notes on productivity..."
            placeholderTextColor="#9ca3af"
            multiline
            value={formData.productivity.note}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                productivity: { ...formData.productivity, note: text },
              })
            }
          />
        </View>
      </View>

      {/* Health Section */}
      <View className="mb-6">
        <Text className="text-white text-lg mb-2">Health</Text>
        <View className="bg-gray-800 rounded-md p-4">
          <Text className="text-white mb-2">Rating: {formData.health.rating}</Text>
          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={formData.health.rating}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                health: { ...formData.health, rating: value },
              })
            }
            minimumTrackTintColor="#60a5fa"
            maximumTrackTintColor="#6b7280"
            thumbTintColor="#60a5fa"
          />
          <TextInput
            className="mt-3 bg-gray-700 rounded-md p-3 text-white"
            placeholder="Notes on health..."
            placeholderTextColor="#9ca3af"
            multiline
            value={formData.health.note}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                health: { ...formData.health, note: text },
              })
            }
          />
        </View>
      </View>

      {/* Mood Section */}
      <View className="mb-6">
        <Text className="text-white text-lg mb-2">Mood</Text>
        <View className="bg-gray-800 rounded-md p-4">
          <Text className="text-white mb-2">Rating: {formData.mood.rating}</Text>
          <Slider
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={formData.mood.rating}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                mood: { ...formData.mood, rating: value },
              })
            }
            minimumTrackTintColor="#f472b6"
            maximumTrackTintColor="#6b7280"
            thumbTintColor="#f472b6"
          />
          <TextInput
            className="mt-3 bg-gray-700 rounded-md p-3 text-white"
            placeholder="Notes on mood..."
            placeholderTextColor="#9ca3af"
            multiline
            value={formData.mood.note}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                mood: { ...formData.mood, note: text },
              })
            }
          />
        </View>
      </View>

      <TouchableOpacity
        className="bg-gray-800 p-4 rounded-md mb-6"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center font-bold text-lg">
          {editing ? 'Update Journal' : 'Create Journal'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderMonthCard = (year, month) => {

    console.log('yearData:', yearData);


    //const monthData = yearData[year]?.months[month];
    const monthNumber = month.padStart(2, '0');
    const monthData = yearData[year]?.months[monthNumber];
    const monthName = getMonthName(parseInt(month));

    //console.log(`Checking ${year}-${monthNumber}:`, yearData[year]?.months[monthNumber]);

      // Debug log to see what we're checking
  console.log(`Looking up month data for ${year}-${monthNumber}:`, monthData);
    
      // Determine the background color based on whether data exists
  const bgColorClass = monthData 
  ? "bg-green-800" // Green background for months with data
  : "bg-gray-800"; // Original gray for months without data


    return (
      <TouchableOpacity
        key={`${year}-${month}`}
        className={`${bgColorClass} p-4 rounded-lg m-1 flex-1 min-w-[80px]`}
        onPress={() => {
          setSelectedMonth(`${year}-${monthNumber}`);
          if (monthData) {
            setFormData({
              monthYear: `${year}-${monthNumber}`,
              monthHighlight: monthData.monthHighlight,
              skillsLearnt: monthData.skillsLearnt,
              productivity: monthData.productivity,
              health: monthData.health,
              mood: monthData.mood,
            });
          } else {
            setFormData({
              ...formData,
              monthYear: `${year}-${monthNumber}`,
            });
          }
        }}
      >
        <Text className="text-white font-bold">{monthName}</Text>
              {/* Add this temporarily to debug */}
      <Text className="text-white text-xs">{`${year}-${monthNumber}`}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-');
    const monthData = yearData[year]?.months[month];

    return (
      <View className="flex-1 bg-black p-4">
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={resetForm} className="p-2">
            <X color="#ffffff" size={24} />
          </TouchableOpacity>
          
          {monthData && !editing ? (
  <View className="flex-row">
    <TouchableOpacity 
      onPress={() => setEditing(true)} 
      className="p-2"
    >
      <PencilLine color="#ffffff" size={24} />
    </TouchableOpacity>
    <TouchableOpacity 
      onPress={() => {
        Alert.alert(
          'Delete Journal',
          'Are you sure you want to delete this journal entry?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => deleteJournal(selectedMonth)
            }
          ]
        );
      }} 
      className="p-2 ml-2"
    >
      <Trash color="#ff4444" size={24} />
    </TouchableOpacity>
  </View>
) : null}
        </View>

        {editing ? (
          renderForm()
        ) : (
          <ScrollView className="flex-1">
            {monthData ? (
              <View>
                <Text className="text-white text-2xl font-bold mb-4">{getMonthName(parseInt(month))} {year}</Text>
                <View className="bg-gray-800 rounded-lg p-4 mb-4">
                  <Text className="text-white text-xl font-bold mb-2">Highlight</Text>
                  <Text className="text-gray-300">{monthData.monthHighlight}</Text>
                </View>

                <View className="bg-gray-800 rounded-lg p-4 mb-4">
                  <Text className="text-white text-xl font-bold mb-2">Skills Learnt</Text>
                  <Text className="text-gray-300">{monthData.skillsLearnt}</Text>
                </View>

                <View className="bg-gray-800 rounded-lg p-4 mb-4">
                  <Text className="text-white text-xl font-bold mb-2">Productivity</Text>
                  <Text className="text-green-500 text-lg">Rating: {monthData.productivity.rating}/10</Text>
                  <Text className="text-gray-300 mt-2">{monthData.productivity.note}</Text>
                </View>

                <View className="bg-gray-800 rounded-lg p-4 mb-4">
                  <Text className="text-white text-xl font-bold mb-2">Health</Text>
                  <Text className="text-blue-500 text-lg">Rating: {monthData.health.rating}/10</Text>
                  <Text className="text-gray-300 mt-2">{monthData.health.note}</Text>
                </View>

                <View className="bg-gray-800 rounded-lg p-4 mb-4">
                  <Text className="text-white text-xl font-bold mb-2">Mood</Text>
                  <Text className="text-pink-500 text-lg">Rating: {monthData.mood.rating}/10</Text>
                  <Text className="text-gray-300 mt-2">{monthData.mood.note}</Text>
                </View>
              </View>
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-gray-400 text-lg mb-4">No journal entry for this month</Text>
                <TouchableOpacity
                  className="bg-gray-800 px-6 py-3 rounded-md"
                  onPress={() => setEditing(true)}
                >
                  <Text className="text-white font-bold">Create Entry</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black p-4">
    {/* Year Navigation */}
    <View className="flex-row items-center justify-center mb-4">
      <TouchableOpacity 
        onPress={() => setSelectedYear(prev => prev - 1)}
        className="p-2"
      >
        <ChevronLeft color="#ffffff" size={24} />
      </TouchableOpacity>
      <Text className="text-white text-xl font-bold mx-4">{selectedYear}</Text>
      <TouchableOpacity 
        onPress={() => setSelectedYear(prev => prev + 1)}
        className="p-2"
      >
        <ChevronRight color="#ffffff" size={24} />
      </TouchableOpacity>
    </View>

    {/* Year Data Display */}
    <View>
      {yearData[selectedYear] ? (
        <View className="mb-6">
          <View className="mb-4">
            <LineChart
              data={yearData[selectedYear].chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              legend={yearData[selectedYear].chartData.legend}
            />
          </View>

          <View className="flex-row flex-wrap justify-between">
            {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(month => 
              renderMonthCard(selectedYear.toString(), month)
            )}
          </View>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-gray-400 text-lg mb-4">No entries for {selectedYear}</Text>
          <Text className="text-gray-500 text-center mb-6">Click on any month below to start adding entries</Text>
          <View className="flex-row flex-wrap justify-between">
            {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(month => 
              renderMonthCard(selectedYear.toString(), month)
            )}
          </View>
        </View>
      )}
    </View>
  </ScrollView>
);
};

export default Journal;