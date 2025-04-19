// components/TimeStamp.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Text, StyleSheet } from 'react-native';

type TimeStampProps = {
  createdAt: string;
  style?: object;
};

const TimeStamp = ({ createdAt, style }: TimeStampProps) => {
  const [formattedTime, setFormattedTime] = useState('');

  const formatTime = useCallback(() => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const seconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }, [createdAt]);

  useEffect(() => {
    // Initial format
    setFormattedTime(formatTime());
    
    // Update more frequently for the "Just now" -> "1m" transition
    const interval = setInterval(() => {
      setFormattedTime(formatTime());
    }, 60000); // Update every minute (you could make this 30000 for 30s updates)

    return () => clearInterval(interval);
  }, [formatTime]); // Add formatTime to dependencies

  return (
    <Text style={[styles.timeText, style]}>
      {formattedTime}
    </Text>
  );
};

const styles = StyleSheet.create({
  timeText: {
    color: '#6D757E',
    fontSize: 10,
  },
});

export default TimeStamp;