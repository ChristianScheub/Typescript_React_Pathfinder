import { storageService } from '@services/storage';
import { OnboardingContainer } from '@container/onboarding/OnboardingContainer';
import { HomeView } from '@views/home/HomeView';
import './App.css';

function App() {
  const hasOnboarded = storageService.hasCompletedOnboarding();

  if (!hasOnboarded) {
    return <OnboardingContainer />;
  }

  return <HomeView />;
}

export default App;
