
import { useState, useEffect } from 'react';
import { familyLinkService, type AppUsage, type TimeLimit } from '@/services/familyLink';

export function useScreenTime() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [usage, setUsage] = useState<AppUsage | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeScreenTime();
  }, []);

  const initializeScreenTime = async () => {
    try {
      setLoading(true);
      
      // Check if Family Link/Screen Time is available
      const available = await familyLinkService.isAvailable();
      setIsAvailable(available);
      
      if (available) {
        // Get current usage data
        const currentUsage = await familyLinkService.getAppUsage();
        setUsage(currentUsage);
        
        // Get remaining time
        const remaining = await familyLinkService.getRemainingTime();
        setRemainingTime(remaining);
      }
    } catch (error) {
      console.error('Error initializing screen time:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await familyLinkService.requestPermission();
      setHasPermission(granted);
      
      if (granted) {
        await initializeScreenTime();
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const setTimeLimit = async (limit: TimeLimit): Promise<boolean> => {
    try {
      const success = await familyLinkService.setTimeLimit(limit);
      
      if (success) {
        // Refresh usage data
        await initializeScreenTime();
      }
      
      return success;
    } catch (error) {
      console.error('Error setting time limit:', error);
      return false;
    }
  };

  const refreshUsage = async () => {
    try {
      const currentUsage = await familyLinkService.getAppUsage();
      setUsage(currentUsage);
      
      const remaining = await familyLinkService.getRemainingTime();
      setRemainingTime(remaining);
    } catch (error) {
      console.error('Error refreshing usage:', error);
    }
  };

  const sendUsageReport = async (parentEmail: string): Promise<boolean> => {
    if (!usage) return false;
    
    try {
      return await familyLinkService.sendUsageReport(parentEmail, usage);
    } catch (error) {
      console.error('Error sending usage report:', error);
      return false;
    }
  };

  const addScreenTime = (seconds: number) => {
    console.log(`Adding ${seconds} seconds of screen time`);
    // This is a placeholder implementation
    // In a real app, this would integrate with the actual screen time system
  };

  return {
    isAvailable,
    hasPermission,
    usage,
    remainingTime,
    loading,
    requestPermission,
    setTimeLimit,
    refreshUsage,
    sendUsageReport,
    addScreenTime,
  };
}
