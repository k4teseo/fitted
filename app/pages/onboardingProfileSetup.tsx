import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { FittedLogo } from "@/assets/images/FittedLogo";
import DateTimePicker from '@react-native-community/datetimepicker';

const OnboardingProfileSetup = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [username, setUsername] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isValidDate, setIsValidDate] = useState(true);

  const currentYear = new Date().getFullYear();

  const handleSetupProfile = () => {
    if (isValidDate) {
      router.replace("./feedPage");
    }
  };

  const handleGoToFeed = () => {
    router.replace("./feedPage"); 
  };

  const validateDate = (month: number, day: number, year: number) => {
    // Basic validation
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year > currentYear) return false;

    // Validate days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    return day <= daysInMonth;
  };

  const formatDate = (input: string) => {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, '');
    
    let month = '';
    let day = '';
    let year = '';

    if (cleaned.length > 0) {
      month = cleaned.slice(0, 2);
      // Validate month
      if (month.length === 2) {
        const monthNum = parseInt(month, 10);
        if (monthNum < 1 || monthNum > 12) {
          setIsValidDate(false);
        } else {
          setIsValidDate(true);
        }
      }
    }

    if (cleaned.length > 2) {
      day = cleaned.slice(2, 4);
      // Validate day
      if (day.length === 2) {
        const dayNum = parseInt(day, 10);
        if (dayNum < 1 || dayNum > 31) {
          setIsValidDate(false);
        } else {
          setIsValidDate(true);
        }
      }
    }

    if (cleaned.length > 4) {
      year = cleaned.slice(4, 8);
      // Validate year
      if (year.length === 4) {
        const yearNum = parseInt(year, 10);
        if (yearNum > currentYear) {
          setIsValidDate(false);
        } else {
          // Final validation with all parts
          const monthNum = parseInt(month, 10);
          const dayNum = parseInt(day, 10);
          setIsValidDate(validateDate(monthNum, dayNum, yearNum));
        }
      }
    }

    // Apply formatting based on length
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${month}/${day}`;
    } else {
      return `${month}/${day}/${year.slice(0, 4)}`;
    }
  };

  const handleDobChange = (text: string) => {
    const formatted = formatDate(text);
    setDob(formatted);
  };

  const handleCalendarPress = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDob(`${month}/${day}/${year}`);
      setIsValidDate(true);
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Welcome to Fitted!</Text>
          <Text style={styles.subheader}>Fill in your profile.</Text>
        </View>

        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadCircle}>
            <MaterialIcons name="add-a-photo" size={32} color="#4DA6FD" />
          </TouchableOpacity>
          <Text style={styles.uploadText}>Upload Profile Photo</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputBorder}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor="#383C40"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={[
            styles.inputBorder, 
            styles.dobInputContainer,
            !isValidDate && styles.inputError
          ]}>
            <Text style={[
              styles.inputLabel,
              !isValidDate && styles.inputLabelError
            ]}>Date of Birth</Text>
            <View style={styles.dobInputWrapper}>
              <TextInput
                style={[styles.input, styles.dobInput]}
                value={dob}
                onChangeText={handleDobChange}
                placeholder="mm/dd/yyyy"
                placeholderTextColor="#383C40"
                keyboardType="number-pad"
                maxLength={10}
              />
              <TouchableOpacity onPress={handleCalendarPress}>
                <MaterialIcons name="calendar-today" size={24} color="#4DA6FD" />
              </TouchableOpacity>
            </View>
          </View>
          {!isValidDate && (
            <Text style={styles.errorText}>Please enter a valid date</Text>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputBorder}>
            <Text style={styles.inputLabel}>Create username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Create username"
              placeholderTextColor="#383C40"
            />
          </View>
        </View>

        <Text style={styles.noteText}>You can change this later in settings.</Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[
              styles.setupButton,
              !isValidDate && styles.disabledButton
            ]} 
            onPress={handleSetupProfile}
            disabled={!isValidDate}
          >
            <Text style={styles.actionButtonText}>Set Up Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.feedButton} 
            onPress={handleGoToFeed}
          >
            <Text style={styles.actionButtonText}>Go To Feed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#0F1112",
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 32,
  },
  header: {
    fontSize: 25,
    fontWeight: "400",
    color: "#B9CADB",
    marginBottom: 8,
    textAlign: "left",
  },
  subheader: {
    fontSize: 12,
    color: "#84919D",
    fontWeight: "400",
    textAlign: "left",
  },
  uploadContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  uploadCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#4DA6FD",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  uploadText: {
    color: "#4DA6FD",
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 24,
    position: "relative",
  },
  inputBorder: {
    borderWidth: 1,
    borderColor: "#626A73",
    borderRadius: 4,
    padding: 16,
    paddingTop: 20,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  inputLabel: {
    position: "absolute",
    top: -10,
    left: 10,
    backgroundColor: "#0F1112",
    paddingHorizontal: 5,
    fontSize: 12,
    color: "#7F8D9A",
    fontWeight: "400",
  },
  inputLabelError: {
    color: '#FF3B30',
  },
  dobInputContainer: {
    paddingRight: 16,
  },
  dobInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dobInput: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingTop: 4,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  noteText: {
    color: "#626A73",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  buttonGroup: {
    marginTop: 24,
  },
  setupButton: {
    backgroundColor: "#4DA6FD",
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: "#6D757E",
    opacity: 0.7,
  },
  feedButton: {
    backgroundColor: "#6D757E",
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#F5EEE3",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OnboardingProfileSetup;