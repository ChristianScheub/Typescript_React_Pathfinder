import { useOnboardingState } from '@hooks/onboarding/useOnboardingState';
import { storageService } from '@services/storage';
import { WelcomeView } from '@views/onboarding/welcome/WelcomeView';
import { HardFactsView } from '@views/onboarding/hardFacts/HardFactsView';
import { EnergyRadarView } from '@views/onboarding/energyRadar/EnergyRadarView';
import { InnerTanksView } from '@views/onboarding/innerTanks/InnerTanksView';
import { EnergyBalanceView } from '@views/onboarding/energyBalance/EnergyBalanceView';
import { DriveView } from '@views/onboarding/drive/DriveView';

const TOTAL_STEPS = 5;

export function OnboardingContainer() {
  const ob = useOnboardingState();

  const handleFinish = () => {
    storageService.saveScoreboard(ob.buildScoreboardData());
    window.location.reload();
  };

  if (ob.step === 0) {
    return <WelcomeView onStart={() => ob.setStep(1)} />;
  }

  if (ob.step === 1) {
    return (
      <HardFactsView
        lifePhase={ob.lifePhase}
        relationshipStatus={ob.relationshipStatus}
        onLifePhaseChange={ob.setLifePhase}
        onRelationshipChange={ob.setRelationshipStatus}
        onBack={() => ob.setStep(0)}
        onNext={() => ob.setStep(2)}
        currentStep={1}
        totalSteps={TOTAL_STEPS}
      />
    );
  }

  if (ob.step === 2) {
    return (
      <EnergyRadarView
        workFinance={ob.workFinance}
        familySocial={ob.familySocial}
        healthBody={ob.healthBody}
        meaningValues={ob.meaningValues}
        total={ob.radarTotal}
        onWorkFinanceChange={ob.setWorkFinance}
        onFamilySocialChange={ob.setFamilySocial}
        onHealthBodyChange={ob.setHealthBody}
        onMeaningValuesChange={ob.setMeaningValues}
        onBack={() => ob.setStep(1)}
        onNext={() => ob.setStep(3)}
        currentStep={2}
        totalSteps={TOTAL_STEPS}
      />
    );
  }

  if (ob.step === 3) {
    return (
      <InnerTanksView
        autonomy={ob.autonomy}
        competence={ob.competence}
        relatedness={ob.relatedness}
        onAutonomyChange={ob.setAutonomy}
        onCompetenceChange={ob.setCompetence}
        onRelatednessChange={ob.setRelatedness}
        onBack={() => ob.setStep(2)}
        onNext={() => ob.setStep(4)}
        currentStep={3}
        totalSteps={TOTAL_STEPS}
      />
    );
  }

  if (ob.step === 4) {
    return (
      <EnergyBalanceView
        internalResources={ob.internalResources}
        externalResources={ob.externalResources}
        demands={ob.demands}
        onInternalResourcesChange={ob.setInternalResources}
        onExternalResourcesChange={ob.setExternalResources}
        onDemandsChange={ob.setDemands}
        onBack={() => ob.setStep(3)}
        onNext={() => ob.setStep(5)}
        currentStep={4}
        totalSteps={TOTAL_STEPS}
      />
    );
  }

  return (
    <DriveView
      selectedDriver={ob.driver}
      onDriverSelect={ob.setDriver}
      onBack={() => ob.setStep(4)}
      onFinish={handleFinish}
      currentStep={5}
      totalSteps={TOTAL_STEPS}
    />
  );
}
