import { storageService } from '@services/storage';
import { OnboardingContainer } from '@container/onboarding/OnboardingContainer';
import HomeContainer from '@container/home/HomeContainer';
import './App.css';

function App() {
  const hasOnboarded = storageService.hasCompletedOnboarding();

  if (!hasOnboarded) {
    return <OnboardingContainer />;
  }

  return <HomeContainer />;
}

export default App;
