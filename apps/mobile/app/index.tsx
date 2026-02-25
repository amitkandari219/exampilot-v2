import { useEffect, useState, useMemo } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { supabase, isDemoMode } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../constants/theme';

export default function Index() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { session, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(!isDemoMode);
  const [onboarded, setOnboarded] = useState(isDemoMode);

  useEffect(() => {
    if (isDemoMode || authLoading) return;

    if (!session) {
      setChecking(false);
      return;
    }

    // Check if onboarding is completed
    supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setOnboarded(false);
        } else {
          setOnboarded(data?.onboarding_completed === true);
        }
        setChecking(false);
      });
  }, [session, authLoading]);

  if (authLoading || checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  if (onboarded) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
