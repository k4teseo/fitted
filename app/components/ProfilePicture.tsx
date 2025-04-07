import React, { useEffect, useState } from 'react';
import { 
  Image, 
  View, 
  StyleSheet, 
  ActivityIndicator,
  Text
} from 'react-native';
import { supabase } from '@/lib/supabase';

type ProfilePictureProps = {
  userId?: string;
  size?: number;
};

export const ProfilePicture = ({ 
  userId, 
  size = 40 
}: ProfilePictureProps) => {
  const [profile, setProfile] = useState<{
    pfp: string | null;
    username: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setError(true);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const { data, error: supabaseError } = await supabase
          .from('profiles')
          .select('pfp, username')
          .eq('id', userId)
          .maybeSingle();

        if (supabaseError) throw supabaseError;
        
        setProfile(data || { pfp: null, username: null });
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(true);
        setProfile({ pfp: null, username: null });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[
          styles.avatar, 
          { 
            width: size, 
            height: size,
            borderRadius: size / 2
          }
        ]}>
          <ActivityIndicator size="small" color="#A5C6E8" />
        </View>
        <Text style={styles.username}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[
        styles.avatar, 
        { 
          width: size, 
          height: size,
          borderRadius: size / 2,
          backgroundColor: profile?.pfp ? 'transparent' : '#FFFFFF'
        }
      ]}>
        {profile?.pfp ? (
          <Image
            source={{ uri: profile.pfp }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
            }}
          />
        ) : null}
      </View>
      
      <Text style={styles.username}>
        {error ? 'User' : profile?.username || 'User'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  username: {
    fontFamily: 'Raleway',
    fontWeight: '600',
    fontSize: 14,
    color: '#F5EEE3',
  },
});