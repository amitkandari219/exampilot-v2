import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Platform, TextInput, Image, Alert, Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Theme } from '../../constants/theme';
import { toDateString } from '../../lib/dateUtils';
import { supabase } from '../../lib/supabase';

function getInitials(name: string, email?: string) {
  if (name) {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  }
  return (email || '?')[0].toUpperCase();
}

interface ProfileSectionProps {
  theme: Theme;
  user: { id?: string; email?: string } | null;
  profileData: { name?: string | null; exam_date?: string | null; avatar_url?: string | null } | null | undefined;
  updateProfile: {
    mutate: (updates: { name?: string; exam_date?: string; avatar_url?: string }) => void;
    isPending: boolean;
  };
}

export function ProfileSection({ theme, user, profileData, updateProfile }: ProfileSectionProps) {
  const styles = createStyles(theme);

  const [profileName, setProfileName] = useState('');
  const [profileExamDate, setProfileExamDate] = useState<Date | null>(null);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (profileData) {
      setProfileName(profileData.name || '');
      setProfileExamDate(profileData.exam_date ? new Date(profileData.exam_date) : null);
      setProfileAvatarUrl(profileData.avatar_url ?? null);
    }
  }, [profileData]);

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;

    setUploadingAvatar(true);
    try {
      const asset = result.assets[0];
      const ext = asset.uri.split('.').pop() || 'jpg';
      const fileName = `${user?.id || 'avatar'}_${Date.now()}.${ext}`;

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: asset.mimeType || 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      setProfileAvatarUrl(publicUrl);
      updateProfile.mutate({ avatar_url: publicUrl });
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = () => {
    const updates: { name?: string; exam_date?: string } = {};
    if (profileName !== (profileData?.name || '')) updates.name = profileName;
    if (profileExamDate) {
      const dateStr = toDateString(profileExamDate);
      if (dateStr !== profileData?.exam_date) updates.exam_date = dateStr;
    }
    if (Object.keys(updates).length > 0) {
      updateProfile.mutate(updates);
      setProfileDirty(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profile</Text>

      <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar} disabled={uploadingAvatar}>
        {profileAvatarUrl ? (
          <Image source={{ uri: profileAvatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>{getInitials(profileName, user?.email)}</Text>
          </View>
        )}
        {uploadingAvatar && (
          <View style={styles.avatarOverlay}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
        <Text style={styles.avatarHint}>Tap to change</Text>
      </TouchableOpacity>

      <View style={styles.profileField}>
        <Text style={styles.paramLabel}>Name</Text>
        <TextInput
          style={styles.profileInput}
          value={profileName}
          onChangeText={(text) => { setProfileName(text); setProfileDirty(true); }}
          placeholder="Your name"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.paramRow}>
        <Text style={styles.paramLabel}>Email</Text>
        <Text style={styles.paramValue}>{user?.email || 'N/A'}</Text>
      </View>

      <TouchableOpacity style={styles.profileField} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.paramLabel}>Exam Date</Text>
        <Text style={styles.profileDateText}>
          {profileExamDate ? profileExamDate.toLocaleDateString() : 'Not set'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={profileExamDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (date) { setProfileExamDate(date); setProfileDirty(true); }
          }}
        />
      )}

      {profileDirty && (
        <TouchableOpacity
          style={styles.saveProfileButton}
          onPress={handleSaveProfile}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={styles.saveProfileText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  paramLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  paramValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary + '30',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarInitials: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.primary,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 72,
    height: 72,
    alignSelf: 'center' as const,
    position: 'absolute' as const,
    top: 0,
  },
  avatarHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  profileField: {
    paddingVertical: theme.spacing.xs,
  },
  profileInput: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.xs,
  },
  profileDateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600' as const,
    paddingVertical: theme.spacing.xs,
  },
  saveProfileButton: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center' as const,
    marginTop: theme.spacing.sm,
  },
  saveProfileText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
  },
});
