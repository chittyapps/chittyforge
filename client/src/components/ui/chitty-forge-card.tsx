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

  // Get forge level display with full blacksmith terminology
  const getForgeDisplay = (level: string) => {
    switch (level) {
      case "MASTER_FORGED": 
        return { 
          title: "Master Forged", 
          subtitle: "Tempered in the fires of verification",
          icon: "🔥", 
          color: "from-yellow-400 via-red-500 to-pink-500",
          bgColor: "bg-gradient-to-br from-yellow-50 to-red-50 dark:from-yellow-900/20 dark:to-red-900/20",
          temp: "White Hot",
          process: "Quenched & Tempered"
        };
      case "WELL_FORGED": 
        return { 
          title: "Well Forged", 
          subtitle: "Hardened through the anvil of trust",
          icon: "⚡", 
          color: "from-blue-400 via-purple-500 to-indigo-600",
          bgColor: "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20",
          temp: "Orange Heat",
          process: "Shaped & Hardened"
        };
      case "HALF_FORGED": 
        return { 
          title: "Half Forged", 
          subtitle: "Taking shape on the anvil of verification",
          icon: "🔨", 
          color: "from-orange-400 to-amber-500",
          bgColor: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
          temp: "Red Heat",
          process: "Hammering"
        };
      case "ROUGH_FORGED": 
        return { 
          title: "Rough Forged", 
          subtitle: "First strikes upon the anvil",
          icon: "⚒️", 
          color: "from-gray-400 to-slate-500",
          bgColor: "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20",
          temp: "Cherry Red",
          process: "Initial Forming"
        };
      default: 
        return { 
          title: "Raw Steel", 
          subtitle: "Awaiting the blacksmith's flame",
          icon: "🪨", 
          color: "from-stone-400 to-gray-500",
          bgColor: "bg-gradient-to-br from-stone-50 to-gray-50 dark:from-stone-900/20 dark:to-gray-900/20",
          temp: "Cold Iron",
          process: "Unworked"
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
            <div className="flex items-center justify-center mb-2 space-x-2">
              <span className="text-lg">🔥</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent">
                ChittyForge
              </span>
              <span className="text-lg">🔨</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase border-b border-dotted border-slate-300 dark:border-slate-600 pb-1">
              FORGE YOUR IDENTITY
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
              "From raw steel to masterwork"
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <span className="text-2xl">{forgeDisplay.icon}</span>
                  {forgeStatus.progress > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold">{forgeDisplay.title}</h3>
                  <p className="text-xs text-muted-foreground">{forgeDisplay.subtitle}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {forgeDisplay.temp}
                    </Badge>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground italic">{forgeDisplay.process}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Forge Heat Indicator */}
            <div className="mb-3 p-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">FORGE HEAT</span>
                <Badge variant="outline" className="text-xs font-mono">
                  {forgeStatus.progress}% Complete
                </Badge>
              </div>
              <Progress 
                value={forgeStatus.progress} 
                className="h-2"
                data-testid="progress-forge-completion"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>🪨 Cold Iron</span>
                <span>🔥 Master Work</span>
              </div>
            </div>
          </div>

          {/* Smithing Progress - Verification Highlights */}
          {verificationHighlights.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm">⚒️</span>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Smithing Progress
                </h4>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3">
                <div className="space-y-2">
                  {verificationHighlights.map((highlight, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 text-sm"
                    >
                      <span className="text-amber-600">🔨</span>
                      <span className="text-amber-800 dark:text-amber-200 font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Blacksmith Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100 dark:from-slate-800 dark:via-slate-700 dark:to-stone-800 rounded-lg border-2 border-slate-300 dark:border-slate-600">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <span className="text-xs mr-1">🏆</span>
                <div className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
                  {user.trustLevel || 1}
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-medium">Smith Level</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <span className="text-xs mr-1">⚡</span>
                <div className="text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
                  {Math.round((user.trustScore || 0) / 10)}%
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-medium">Steel Purity</div>
            </div>
          </div>

          {/* Blacksmith Action */}
          <div className="space-y-3">
            {forgeStatus.progress < 100 ? (
              <Button 
                className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white font-bold shadow-lg border border-red-700"
                data-testid="button-continue-forging"
              >
                <span className="mr-2">🔥</span>
                Return to the Forge
                <span className="ml-2">⚒️</span>
              </Button>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold shadow-lg border border-emerald-700"
                data-testid="button-share-forged-id"
              >
                <span className="mr-2">✨</span>
                Display Masterwork
                <span className="ml-2">🏆</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              data-testid="button-view-forge-details"
            >
              <span className="mr-1">📜</span>
              Forge Journal
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Next Smithing Task */}
      {forgeStatus.progress < 100 && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-orange-500">🔥</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Next at the Anvil
            </span>
            <span className="text-orange-500">🔨</span>
          </div>
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {forgeStatus.completedCount === 0 ? "Heat Government Documents" :
             forgeStatus.completedCount === 1 ? "Hammer Professional Networks" :
             "Temper Social Trust Bonds"}
          </div>
          <div className="text-xs text-muted-foreground mt-1 italic">
            {forgeStatus.completedCount === 0 ? "Bring official papers to white heat" :
             forgeStatus.completedCount === 1 ? "Shape connections on the anvil" :
             "Quench bonds in trust"}
          </div>
        </div>
      )}
    </div>
  );
}