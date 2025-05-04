// app/pi/PiNavigationScreens/Journal.js
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
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { 
  X, 
  Plus, 
  PencilLine, 
  Calendar, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react-native';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import { FadeIn, SlideUp } from '../../../components/AnimationUtils';

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
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#8B4513',
    },
  };

  // Add year navigation controls
  const YearNavigation = () => (
    <View className="flex-row items-center justify-center mb-4">
      <TouchableOpacity 
        onPress={() => setSelectedYear(prev => prev - 1)}
        className="p-2 bg-[#8B4513]/10 rounded-full"
      >
        <ChevronLeft color="#8B4513" size={24} />
      </TouchableOpacity>
      <Text className="text-[#8B4513] text-xl font-bold mx-4">{selectedYear}</Text>
      <TouchableOpacity 
        onPress={() => setSelectedYear(prev => prev + 1)}
        className="p-2 bg-[#8B4513]/10 rounded-full"
      >
        <ChevronRight color="#8B4513" size={24} />
      </TouchableOpacity>
    </View>
  );

  // Validation functions remain the same
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

  // Fetch all journals - code remains largely the same
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
    console.log('Raw data:', data);

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
                color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
                strokeWidth: 2,
              },
              {
                data: Array(12).fill(0),
                color: (opacity = 1) => `rgba(210, 180, 140, ${opacity})`,
                strokeWidth: 2,
              },
              {
                data: Array(12).fill(0),
                color: (opacity = 1) => `rgba(165, 42, 42, ${opacity})`,
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
              color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
              strokeWidth: 2,
            },
            {
              data: Array(12).fill(0),
              color: (opacity = 1) => `rgba(210, 180, 140, ${opacity})`,
              strokeWidth: 2,
            },
            {
              data: Array(12).fill(0),
              color: (opacity = 1) => `rgba(165, 42, 42, ${opacity})`,
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
      <Card title="Monthly Journal Entry">
        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Month Highlight</Text>
          <TextInput
            className="bg-gray-50 rounded-xl p-3 text-gray-800 border border-gray-200"
            placeholder="What was the highlight of your month?"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            value={formData.monthHighlight}
            onChangeText={(text) => setFormData({ ...formData, monthHighlight: text })}
          />
        </View>

        <View className="mb-4">
          <Text className="text-gray-700 mb-2">Skills Learnt</Text>
          <TextInput
            className="bg-gray-50 rounded-xl p-3 text-gray-800 border border-gray-200"
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
          <Text className="text-gray-700 mb-2 font-medium">Productivity</Text>
          <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Text className="text-[#8B4513] mb-2">Rating: {formData.productivity.rating}</Text>
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
              minimumTrackTintColor="#8B4513"
              maximumTrackTintColor="#D2B48C"
              thumbTintColor="#8B4513"
            />
            <TextInput
              className="mt-3 bg-white rounded-xl p-3 text-gray-800 border border-gray-200"
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
          <Text className="text-gray-700 mb-2 font-medium">Health</Text>
          <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Text className="text-[#8B4513] mb-2">Rating: {formData.health.rating}</Text>
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
              minimumTrackTintColor="#8B4513"
              maximumTrackTintColor="#D2B48C"
              thumbTintColor="#8B4513"
            />
            <TextInput
              className="mt-3 bg-white rounded-xl p-3 text-gray-800 border border-gray-200"
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
          <Text className="text-gray-700 mb-2 font-medium">Mood</Text>
          <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <Text className="text-[#8B4513] mb-2">Rating: {formData.mood.rating}</Text>
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
              minimumTrackTintColor="#8B4513"
              maximumTrackTintColor="#D2B48C"
              thumbTintColor="#8B4513"
            />
            <TextInput
              className="mt-3 bg-white rounded-xl p-3 text-gray-800 border border-gray-200"
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

        <Button
          title={editing ? "Update Journal" : "Create Journal"}
          onPress={handleSubmit}
          size="large"
        />
      </Card>
    </ScrollView>
  );

  const renderMonthCard = (year, month) => {
    const monthNumber = month.padStart(2, '0');
    const monthData = yearData[year]?.months[monthNumber];
    const monthName = getMonthName(parseInt(month));

    console.log(`Looking up month data for ${year}-${monthNumber}:`, monthData);
    
    // Determine the background color based on whether data exists
    const bgColorClass = monthData 
      ? "bg-[#8B4513]/20 border-[#8B4513]/40" 
      : "bg-gray-100 border-gray-200";

    return (
      <TouchableOpacity
        key={`${year}-${month}`}
        className={`${bgColorClass} p-4 rounded-xl m-1 flex-1 min-w-[80px] border`}
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
        <Text className={`font-bold ${monthData ? 'text-[#8B4513]' : 'text-gray-600'}`}>{monthName}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8B4513" />
      </View>
    );
  }

  if (selectedMonth) {
    const [year, month] = selectedMonth.split('-');
    const monthData = yearData[year]?.months[month];

    return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="px-4 py-4 border-b border-gray-200 flex-row justify-between items-center">
          <TouchableOpacity onPress={resetForm} className="p-2">
            <ArrowLeft size={24} color="#8B4513" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#8B4513]">
            {getMonthName(parseInt(month))} {year}
          </Text>
          
          {monthData && !editing ? (
            <View className="flex-row">
              <TouchableOpacity 
                onPress={() => setEditing(true)} 
                className="p-2"
              >
                <PencilLine color="#8B4513" size={22} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert(
                    'Delete Journal',
                    'Are you sure you want to delete this journal entry?',
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Delete", 
                        style: "destructive",
                        onPress: () => deleteJournal(selectedMonth)
                      }
                    ]
                  );
                }} 
                className="p-2 ml-2"
              >
                <Trash2 color="#ef4444" size={22} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        <View className="flex-1 p-4">
          {editing ? (
            renderForm()
          ) : (
            <ScrollView className="flex-1">
              {monthData ? (
                <FadeIn>
                  <Card
                    title="Monthly Highlight"
                    className="mb-4"
                  >
                    <Text className="text-gray-700">{monthData.monthHighlight}</Text>
                  </Card>

                  <Card
                    title="Skills Learnt"
                    className="mb-4"
                  >
                    <Text className="text-gray-700">{monthData.skillsLearnt}</Text>
                  </Card>

                  <Card
                    title="Productivity"
                    className="mb-4"
                  >
                    <View className="flex-row items-center mb-2">
                      <View className="bg-[#8B4513]/10 px-3 py-1 rounded-full">
                        <Text className="text-[#8B4513] font-bold">
                          Rating: {monthData.productivity.rating}/10
                        </Text>
                      </View>
                    </View>
                    {monthData.productivity.note ? (
                      <Text className="text-gray-700 mt-2">{monthData.productivity.note}</Text>
                    ) : null}
                  </Card>

                  <Card
                    title="Health"
                    className="mb-4"
                  >
                    <View className="flex-row items-center mb-2">
                      <View className="bg-[#8B4513]/10 px-3 py-1 rounded-full">
                        <Text className="text-[#8B4513] font-bold">
                          Rating: {monthData.health.rating}/10
                        </Text>
                      </View>
                    </View>
                    {monthData.health.note ? (
                      <Text className="text-gray-700 mt-2">{monthData.health.note}</Text>
                    ) : null}
                  </Card>

                  <Card
                    title="Mood"
                    className="mb-4"
                  >
                    <View className="flex-row items-center mb-2">
                      <View className="bg-[#8B4513]/10 px-3 py-1 rounded-full">
                        <Text className="text-[#8B4513] font-bold">
                          Rating: {monthData.mood.rating}/10
                        </Text>
                      </View>
                    </View>
                    {monthData.mood.note ? (
                      <Text className="text-gray-700 mt-2">{monthData.mood.note}</Text>
                    ) : null}
                  </Card>
                </FadeIn>
              ) : (
                <View className="flex-1 justify-center items-center p-8">
                  <Text className="text-gray-500 text-lg mb-4 text-center">No journal entry for this month</Text>
                  <Button
                    title="Create Entry"
                    onPress={() => setEditing(true)}
                    icon={<Plus size={18} color="white" />}
                  />
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-[#8B4513]">Journal</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {/* Year Navigation */}
        <YearNavigation />

        {/* Year Data Display */}
        <View>
          {yearData[selectedYear] ? (
            <SlideUp>
              <View className="mb-6">
                <Card title={`${selectedYear} Overview`} className="mb-4">
                  <LineChart
                    data={yearData[selectedYear].chartData}
                    width={screenWidth - 48}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                    legend={yearData[selectedYear].chartData.legend}
                  />
                </Card>

                <Text className="text-[#8B4513] text-lg font-bold mt-3 mb-3">Monthly Entries</Text>
                <View className="flex-row flex-wrap justify-between mb-4">
                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(month => 
                    renderMonthCard(selectedYear.toString(), month)
                  )}
                </View>
              </View>
            </SlideUp>
          ) : (
            <SlideUp>
              <View className="flex-1 items-center justify-center py-8">
                <Text className="text-gray-600 text-lg mb-4">No entries for {selectedYear}</Text>
                <Text className="text-gray-500 text-center mb-6">Click on any month below to start adding entries</Text>
                <View className="flex-row flex-wrap justify-between mb-4">
                  {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(month => 
                    renderMonthCard(selectedYear.toString(), month)
                  )}
                </View>
              </View>
            </SlideUp>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Journal;