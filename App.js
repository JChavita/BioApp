

/**
 * Student Profile Mobile Application
 * 
 * Jose Salgado
 * 
 * This React Native application allows students to manage their personal profiles,
 * including the ability to view and edit their information, upload a profile picture,
 * and persist data across app restarts.
 * 
 * Features:
 * - Profile picture upload
 * - Personal information management
 * - Form validation
 * - Data persistence using AsyncStorage
 * - optimized UI/UX
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  TextInput,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
//imports for functionality
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

//key for storing profile data in AsyncStorage
const PROFILE_STORAGE_KEY = 'student_profile';

//nitial profile state
const initialProfile = {
  picture: null,
  firstName: 'Jose',
  lastName: 'Salgado',
  dateOfBirth: new Date(),
  nationality: 'Nicaraguan',
  bio: 'here is the Bio',
};

const App = () => {
  // State Management
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load saved profile data when app starts
  useEffect(() => {
    loadProfile();
  }, []);

  /**
   * Loads the saved profile data from AsyncStorage
   * Converts the stored date string back to a Date object
   */
  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        parsedProfile.dateOfBirth = new Date(parsedProfile.dateOfBirth);
        setProfile(parsedProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  /**
   * Saves the profile data to AsyncStorage
   * @param {Object} updatedProfile - The profile object to be saved
   */
  const saveProfile = async (updatedProfile) => {
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  /**
   * Handles image selection from the device's media library
   * Requests permissions if needed and updates the profile picture
   */
  const pickImage = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to update your picture!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile picture
      quality: 1,
    });

    if (!result.canceled) {
      const updatedProfile = { ...profile, picture: result.assets[0].uri };
      setProfile(updatedProfile);
      await saveProfile(updatedProfile);
    }
  };

  /**
   * Handles form submission
   * Validates required fields and saves the profile data
   */
  const handleSubmit = async () => {
    // Validate required fields
    if (!profile.firstName || !profile.lastName || !profile.nationality) {
      alert('Please fill in all required fields');
      return;
    }

    await saveProfile(profile);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Main Profile Display Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.profileContainer}>
          {/* Profile Picture Section */}
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {profile.picture ? (
              <Image source={{ uri: profile.picture }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Information Display */}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>
              {profile.firstName} {profile.lastName}
            </Text>
            <Text style={styles.info}>
              Date of Birth: {profile.dateOfBirth.toLocaleDateString()}
            </Text>
            <Text style={styles.info}>Nationality: {profile.nationality}</Text>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>

          {/* Edit Profile Button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditing} animationType="slide">
        <SafeAreaView style={styles.modalSafeArea}>
          {/* Keyboard Avoiding View for iOS form handling */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollViewContent}
            >
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Edit Profile</Text>

                {/* Form Input Fields */}
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  value={profile.firstName}
                  onChangeText={(text) => setProfile({ ...profile, firstName: text })}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  value={profile.lastName}
                  onChangeText={(text) => setProfile({ ...profile, lastName: text })}
                />

                {/* Date Picker Trigger */}
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>
                    Date of Birth: {profile.dateOfBirth.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                {/* iOS Date Picker */}
                {showDatePicker && (
                  <DateTimePicker
                    value={profile.dateOfBirth}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setProfile({ ...profile, dateOfBirth: selectedDate });
                      }
                    }}
                  />
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Nationality"
                  value={profile.nationality}
                  onChangeText={(text) => setProfile({ ...profile, nationality: text })}
                />

                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Bio"
                  value={profile.bio}
                  onChangeText={(text) => setProfile({ ...profile, bio: text })}
                  multiline
                  numberOfLines={4}
                />

                {/* Form Action Buttons */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

//Styles
const styles = StyleSheet.create({
  // Main container styles
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light background for better contrast
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center', // Centers content vertically
  },

  // Profile section styles
  profileContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },

  // Profile image styles
  imageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90, // Makes image circular
    borderWidth: 3,
    borderColor: '#fff',
    // iOS shadow properties
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android shadow
  },
  placeholderImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },

  // Profile information styles
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  info: {
    fontSize: 17, // iOS standard font size
    marginBottom: 8,
    color: '#666',
    textAlign: 'center',
  },
  bio: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 15,
    color: '#666',
    lineHeight: 24,
  },

  // Button styles
  editButton: {
    backgroundColor: '#007AFF', // iOS blue
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 30,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },

  // Modal styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollViewContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
    paddingTop: 40,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#000',
  },

  // Form input styles
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    fontSize: 17,
    backgroundColor: '#fff',
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },

  // Form button container
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingBottom: 30,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelButton: {
    backgroundColor: '#ff3b30', // iOS red
  },
  saveButton: {
    backgroundColor: '#34c759', // iOS green
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default App;