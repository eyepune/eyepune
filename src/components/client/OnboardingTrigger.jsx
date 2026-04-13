import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';
import OnboardingAssistant from './OnboardingAssistant';

export default function OnboardingTrigger({ user }) {
    const [showAssistant, setShowAssistant] = useState(false);

    return (
        <>
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAssistant(true)}
                className="gap-2"
            >
                <Sparkles className="w-4 h-4" />
                Help & Onboarding
            </Button>

            <OnboardingAssistant 
                user={user}
                forceOpen={showAssistant}
                onComplete={() => setShowAssistant(false)}
            />
        </>
    );
}