import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function Index() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return <LoadingSpinner fullScreen message="Loading CricAR..." />;
  }

  if (user) {
    return <Redirect href="/(tabs)/scan" />;
  }

  return <Redirect href="/(auth)/login" />;
}
