// components/TimeStamp.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Text, StyleSheet } from 'react-native';

type TimeStampProps = {
  createdAt: string | Date;
  style?: object;
  updateInterval?: number;
};

const TimeStamp = ({ 
  createdAt, 
  style, 
  updateInterval = 30000
}: TimeStampProps) => {
  const [formattedTime, setFormattedTime] = useState('');

  const isValidDate = (date: Date): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  const formatTime = useCallback(() => {
    try {
      let createdDate: Date;

      // Handle both string and Date inputs
      if (typeof createdAt === 'string') {
        // Remove any trailing milliseconds if they exist
        const cleanedDateString = createdAt.split('.')[0] + 'Z';
        createdDate = new Date(cleanedDateString);
      } else {
        createdDate = new Date(createdAt);
      }

      // More thorough date validation
      if (!isValidDate(createdDate)) {
        console.warn('Invalid date provided to TimeStamp:', createdAt, createdDate);
        return '';
      }

      const now = new Date();
      const seconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
      
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
      if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w`;
      if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo`;
      return `${Math.floor(seconds / 31536000)}y`;
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  }, [createdAt]);

  useEffect(() => {
    setFormattedTime(formatTime());
    
    const createdDate = typeof createdAt === 'string' 
      ? new Date(createdAt.split('.')[0] + 'Z')
      : new Date(createdAt);
      
    const isRecent = isValidDate(createdDate) && 
      (Date.now() - createdDate.getTime()) < 86400000;

    let interval: NodeJS.Timeout;
    if (isRecent) {
      interval = setInterval(() => {
        setFormattedTime(formatTime());
      }, updateInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [formatTime, updateInterval, createdAt]);

  return (
    <Text style={[styles.timeText, style]}>
      {formattedTime}
    </Text>
  );
};

const styles = StyleSheet.create({
  timeText: {
    color: '#6D757E',
    fontSize: 12,
    fontWeight: '400',
  },
});

export default TimeStamp;