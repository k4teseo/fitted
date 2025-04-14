import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  useWindowDimensions
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import ProfilePictureSelector from "../components/ProfilePictureSelector";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function EditProfilePage() {
    const { width, height } = useWindowDimensions();
    const router = useRouter();
    const { userId, name: initialName, username: initialUsername, pfp: initialPfp } = useLocalSearchParams();
    
    const [name, setName] = useState(initialName?.toString() || "");
    const [username, setUsername] = useState(initialUsername?.toString().replace('@', '') || "");
    const [dob, setDob] = useState("");
    const [profilePictureUri, setProfilePictureUri] = useState(initialPfp?.toString() || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isValidDate, setIsValidDate] = useState(true);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const currentYear = new Date().getFullYear();

    // Fetch profile data from Supabase
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!userId) return;
            
            try {
                setLoadingProfile(true);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('name, username, pfp, dob')
                    .eq('id', userId)
                    .single();

                if (error) throw error;

                if (data) {
                    setName(data.name || '');
                    setUsername(data.username?.replace('@', '') || '');
                    setProfilePictureUri(data.pfp || null);
                    // Set dob if it exists in the database
                    if (data.dob) {
                        setDob(data.dob);
                        // Parse the dob string into a Date object
                        const [month, day, year] = data.dob.split('/').map(Number);
                        setDate(new Date(year, month - 1, day));
                    }
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('Failed to load profile data');
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfileData();
    }, [userId]);

    const styles = StyleSheet.create({
        container: { 
            flex: 1, 
            backgroundColor: "#0F1112",
            width: width,
            height: height,
        },
        headerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: height * 0.08,
            paddingHorizontal: width * 0.05,
            marginBottom: height * 0.06,
        },
        backButton: {
            marginRight: width * 0.04,
        },
        header: {
            fontSize: width * 0.06,
            fontWeight: "700",
            color: "#B9CADB",
        },
        uploadContainer: {
            alignItems: "center",
            marginBottom: height * 0.03,
        },
        uploadText: {
            color: "#4DA6FD",
            fontSize: width * 0.035,
            fontWeight: "600",
            marginTop: height * 0.01,
        },
        inputContainer: {
            marginBottom: height * 0.03,
            position: "relative",
        },
        inputBorder: {
            borderWidth: 1,
            borderColor: "#626A73",
            borderRadius: width * 0.01,
            padding: width * 0.04,
            paddingTop: height * 0.02,
        },
        inputError: {
            borderColor: "#FF3B30",
        },
        inputLabel: {
            position: "absolute",
            top: -height * 0.012,
            left: width * 0.02,
            backgroundColor: "#0F1112",
            paddingHorizontal: width * 0.01,
            fontSize: width * 0.03,
            color: "#7F8D9A",
            fontWeight: "400",
        },
        inputLabelError: {
            color: "#FF3B30",
        },
        dobInputContainer: {
            paddingRight: width * 0.04,
        },
        dobInputWrapper: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        dobInput: {
            flex: 1,
            marginRight: width * 0.02,
        },
        input: {
            color: "#FFFFFF",
            fontSize: width * 0.04,
            paddingTop: height * 0.005,
        },
        errorText: {
            color: "#FF6B6B",
            fontSize: width * 0.03,
            marginTop: height * 0.01,
            marginLeft: width * 0.005,
            textAlign: 'left',
        },
        saveButton: {
            backgroundColor: "#4DA6FD",
            padding: height * 0.02,
            borderRadius: width * 0.02,
            alignItems: "center",
            marginTop: height * 0.02,
        },
        disabledButton: {
            opacity: 0.7,
        },
        saveButtonText: {
            color: "#F5EEE3",
            fontSize: width * 0.04,
            fontWeight: "600",
        },
        datePicker: {
            backgroundColor: '#0F1112',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    });

    const handleBack = () => {
        router.back();
    };

    const formatDate = (input: string) => {
        const cleaned = input.replace(/\D/g, "");

        let month = "";
        let day = "";
        let year = "";

        if (cleaned.length > 0) {
            month = cleaned.slice(0, 2);
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
            if (year.length === 4) {
                const yearNum = parseInt(year, 10);
                if (yearNum > currentYear) {
                    setIsValidDate(false);
                } else {
                    const monthNum = parseInt(month, 10);
                    const dayNum = parseInt(day, 10);
                    setIsValidDate(validateDate(monthNum, dayNum, yearNum));
                }
            }
        }

        if (cleaned.length <= 2) {
            return cleaned;
        } else if (cleaned.length <= 4) {
            return `${month}/${day}`;
        } else {
            return `${month}/${day}/${year.slice(0, 4)}`;
        }
    };

    const validateDate = (month: number, day: number, year: number) => {
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;
        if (year > currentYear) return false;

        const daysInMonth = new Date(year, month, 0).getDate();
        return day <= daysInMonth;
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
            const day = selectedDate.getDate().toString().padStart(2, "0");
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
            const year = selectedDate.getFullYear();
            setDob(`${month}/${day}/${year}`);
            setIsValidDate(true);
        }
    };

    const handleSaveProfile = async () => {
        if (!userId) return;
        setError(null);

        // Validate inputs
        if (!name.trim()) {
            setError('Name cannot be empty');
            return;
        }

        if (!username.trim()) {
            setError('Username cannot be empty');
            return;
        }

        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        if (dob && !isValidDate) {
            setError('Please enter a valid date of birth');
            return;
        }

        try {
            setUploading(true);
            
            // Check username availability (only if changed)
            const currentUsername = initialUsername?.toString().replace('@', '') || "";
            if (username !== currentUsername) {
                const { data: existingUsers, error: checkError } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("username", username);

                if (checkError) throw checkError;
                if (existingUsers && existingUsers.length > 0) {
                    setError('Username is already taken');
                    return;
                }
            }

            // Upload profile picture if changed
            let profilePictureUrl = profilePictureUri;
            if (profilePictureUri && profilePictureUri !== initialPfp && profilePictureUri.startsWith('file:')) {
                const fileExt = profilePictureUri.split('.').pop() || 'jpg';
                const fileName = `${userId}-${Date.now()}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                    .from("pfp")
                    .upload(fileName, {
                        uri: profilePictureUri,
                        name: fileName,
                        type: `image/${fileExt}`,
                    } as any);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from("pfp")
                    .getPublicUrl(fileName);

                profilePictureUrl = publicUrl;
            }

            // Update profile
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    name,
                    username,
                    dob: dob || null,
                    pfp: profilePictureUrl
                })
                .eq("id", userId);

            if (updateError) throw updateError;

            Alert.alert("Success", "Profile updated successfully");
            router.back();
        } catch (error: any) {
            console.error("Error updating profile:", error);
            setError(error.message || "Failed to update profile. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (loadingProfile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4DA6FD" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <MaterialIcons name="navigate-before" size={30} color="white" />
                </TouchableOpacity>
                <Text style={styles.header}>Edit Profile</Text>
            </View>
            
            <View style={{ paddingHorizontal: width * 0.08 }}>
                <View style={styles.uploadContainer}>
                    <ProfilePictureSelector 
                        onImageSelect={setProfilePictureUri} 
                        imageUri={profilePictureUri}
                        showImagePicker={showImagePicker}
                        setShowImagePicker={setShowImagePicker}
                    />
                    <TouchableOpacity onPress={() => setShowImagePicker(true)}>
                        <Text style={styles.uploadText}>Upload New Profile Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputBorder}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#383C40"
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.inputBorder}>
                        <Text style={styles.inputLabel}>Username</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter username (without @)"
                            placeholderTextColor="#383C40"
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View
                        style={[
                            styles.inputBorder,
                            styles.dobInputContainer,
                            !isValidDate && styles.inputError,
                        ]}
                    >
                        <Text
                            style={[
                                styles.inputLabel,
                                !isValidDate && styles.inputLabelError,
                            ]}
                        >
                            Date of Birth
                        </Text>
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
                                <MaterialIcons
                                    name="calendar-today"
                                    size={24}
                                    color="#4DA6FD"
                                />
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
                        textColor="#4DA6FD" 
                        themeVariant="dark"
                    />
                )}

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                    style={[styles.saveButton, uploading && styles.disabledButton]}
                    onPress={handleSaveProfile}
                    disabled={uploading}
                >
                    {uploading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}