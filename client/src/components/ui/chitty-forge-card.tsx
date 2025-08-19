import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { User, Badge as BadgeType, VerificationMethod } from '@shared/schema';

interface ChittyForgeCardProps {
  user: User;
  badges: BadgeType[];
  verifications: VerificationMethod[];
}

export default function ChittyForgeCard({ user, badges, verifications }: ChittyForgeCardProps) {

  // Calculate forge completion - how much of their identity is "forged"
  const calculateForgeCompletion = () => {
    const essentialVerifications = [
      "professional_network",
      "document_attestation", 
      "social_network_validation"
    ];
    
    const completedVerifications = verifications.filter(v => 
      v.status === "completed" && essentialVerifications.includes(v.type)
    );
    
    const forgeProgress = (completedVerifications.length / essentialVerifications.length) * 100;
    
    return {
      progress: Math.round(forgeProgress),
      completedCount: completedVerifications.length,
      totalRequired: essentialVerifications.length,
      forgeLevel: forgeProgress >= 100 ? "MASTER_FORGED" : 
                  forgeProgress >= 75 ? "WELL_FORGED" :
                  forgeProgress >= 50 ? "HALF_FORGED" :
                  forgeProgress >= 25 ? "ROUGH_FORGED" : "RAW_MATERIAL"
    };
  };

  const forgeStatus = calculateForgeCompletion();

  // Get forge level display
  const getForgeDisplay = (level: string) => {
    switch (level) {
      case "MASTER_FORGED": 
        return { 
          title: "Master Forged", 
          subtitle: "Identity fully tempered and verified",
          icon: "🔥", 
          color: "from-yellow-400 via-red-500 to-pink-500",
          bgColor: "bg-gradient-to-br from-yellow-50 to-red-50 dark:from-yellow-900/20 dark:to-red-900/20"
        };
      case "WELL_FORGED": 
        return { 
          title: "Well Forged", 
          subtitle: "Identity hardened with strong verification",
          icon: "⚡", 
          color: "from-blue-400 via-purple-500 to-indigo-600",
          bgColor: "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
        };
      case "HALF_FORGED": 
        return { 
          title: "Half Forged", 
          subtitle: "Identity taking shape through verification",
          icon: "🔨", 
          color: "from-orange-400 to-amber-500",
          bgColor: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
        };
      case "ROUGH_FORGED": 
        return { 
          title: "Rough Forged", 
          subtitle: "Initial identity framework established",
          icon: "⚒️", 
          color: "from-gray-400 to-slate-500",
          bgColor: "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20"
        };
      default: 
        return { 
          title: "Raw Material", 
          subtitle: "Identity awaiting the forge",
          icon: "🪨", 
          color: "from-stone-400 to-gray-500",
          bgColor: "bg-gradient-to-br from-stone-50 to-gray-50 dark:from-stone-900/20 dark:to-gray-900/20"
        };
    }
  };

  const forgeDisplay = getForgeDisplay(forgeStatus.forgeLevel);

  // Get key verification highlights
  const getVerificationHighlights = () => {
    const highlights = [];
    
    // Professional verification
    const profNetwork = verifications.find(v => v.type === "professional_network")?.data as any;
    if (profNetwork?.employmentHistory?.some((emp: any) => emp.verified)) {
      highlights.push("Professional Employment Verified");
    }
    
    // Government documentation
    const docAttestation = verifications.find(v => v.type === "document_attestation")?.data as any;
    if (docAttestation?.governmentIssuedDocs?.some((doc: any) => doc.verified)) {
      highlights.push("Government ID Authenticated");
    }
    
    // Social network
    const socialNetwork = verifications.find(v => v.type === "social_network_validation")?.data as any;
    if (socialNetwork?.trustedEndorsers?.length > 0) {
      highlights.push(`${socialNetwork.trustedEndorsers.length} Network Endorsements`);
    }
    
    return highlights.slice(0, 3); // Maximum 3 highlights for clean display
  };

  const verificationHighlights = getVerificationHighlights();

  return (
    <div className="max-w-sm mx-auto" data-testid="card-chitty-forge">
      {/* Main Identity Card */}
      <Card className={`${forgeDisplay.bgColor} border-2 border-slate-200 dark:border-slate-700 shadow-xl`}>
        <CardContent className="p-6">
          
          {/* ChittyForge Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
                ChittyForge
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
              FORGE YOUR ID
            </p>
          </div>

          {/* User Identity */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center text-2xl font-bold text-slate-700 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-500">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {user.username || 'Anonymous'}
            </h2>
            <p className="text-sm text-muted-foreground">
              ChittyID: {user.chittyId || 'Pending Assignment'}
            </p>
          </div>

          {/* Forge Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{forgeDisplay.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold">{forgeDisplay.title}</h3>
                  <p className="text-xs text-muted-foreground">{forgeDisplay.subtitle}</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="text-xs font-mono"
              >
                {forgeStatus.progress}%
              </Badge>
            </div>
            
            {/* Forge Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={forgeStatus.progress} 
                className="h-3"
                data-testid="progress-forge-completion"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Raw Material</span>
                <span>Master Forged</span>
              </div>
            </div>
          </div>

          {/* Verification Highlights */}
          {verificationHighlights.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Identity Elements
              </h4>
              <div className="space-y-2">
                {verificationHighlights.map((highlight, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                    <span className="text-slate-700 dark:text-slate-300">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
                {user.trustLevel || 1}
              </div>
              <div className="text-xs text-muted-foreground">Forge Level</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
                {Math.round((user.trustScore || 0) / 10)}%
              </div>
              <div className="text-xs text-muted-foreground">Trust Score</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-2">
            {forgeStatus.progress < 100 ? (
              <Button 
                className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white"
                data-testid="button-continue-forging"
              >
                <i className="fas fa-hammer mr-2"></i>
                Continue Forging
              </Button>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                data-testid="button-share-forged-id"
              >
                <i className="fas fa-share-alt mr-2"></i>
                Share Forged ID
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              data-testid="button-view-forge-details"
            >
              View Forge Details
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Next Forging Step */}
      {forgeStatus.progress < 100 && (
        <div className="mt-4 text-center">
          <div className="text-xs text-muted-foreground mb-2">
            Next in the forge:
          </div>
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {forgeStatus.completedCount === 0 ? "Government Document Verification" :
             forgeStatus.completedCount === 1 ? "Professional Network Validation" :
             "Social Trust Network Building"}
          </div>
        </div>
      )}
    </div>
  );
}