import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Badge as BadgeType, VerificationMethod } from '@shared/schema';

interface ChittyIDGrowthCenterProps {
  user: User;
  badges: BadgeType[];
  verifications: VerificationMethod[];
}

export default function ChittyIDGrowthCenter({ user, badges, verifications }: ChittyIDGrowthCenterProps) {
  
  // Calculate ChittyID Evolution Progress
  const calculateEvolutionProgress = () => {
    const maxLevel = 10;
    const currentLevel = user.trustLevel || 1;
    const nextLevel = Math.min(currentLevel + 1, maxLevel);
    const progressInLevel = ((user.trustScore || 0) % 100) || 0;
    
    return {
      currentLevel,
      nextLevel,
      progressInLevel,
      isMaxLevel: currentLevel >= maxLevel
    };
  };

  // Calculate Network Power Score
  const calculateNetworkPower = () => {
    const professionalNetwork = verifications.find(v => v.type === "professional_network")?.data as any;
    const socialNetwork = verifications.find(v => v.type === "social_network_validation")?.data as any;
    
    let networkPower = 0;
    
    if (professionalNetwork) {
      networkPower += (professionalNetwork.linkedinConnections || 0) * 0.1;
      networkPower += (professionalNetwork.mutualConnections || 0) * 2;
      networkPower += (professionalNetwork.endorsements || 0) * 5;
    }
    
    if (socialNetwork) {
      const endorsers = socialNetwork.trustedEndorsers?.length || 0;
      const avgTrustLevel = socialNetwork.networkMetrics?.averageTrustLevel || 0;
      networkPower += endorsers * avgTrustLevel * 10;
      networkPower += (socialNetwork.networkMetrics?.networkReach || 0) * 0.01;
    }
    
    return Math.round(networkPower);
  };

  // Calculate Verification Momentum
  const calculateMomentum = () => {
    const completedVerifications = verifications.filter(v => v.status === "completed").length;
    const recentVerifications = verifications.filter(v => {
      const completedAt = v.completedAt ? new Date(v.completedAt) : null;
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return completedAt && completedAt > thirtyDaysAgo;
    }).length;
    
    const momentum = (recentVerifications / Math.max(1, completedVerifications)) * 100;
    return Math.round(momentum);
  };

  // Get Next Growth Opportunities
  const getGrowthOpportunities = () => {
    const opportunities = [];
    const verificationTypes = verifications.map(v => v.type);
    
    if (!verificationTypes.includes("professional_network")) {
      opportunities.push({
        type: "professional_network",
        title: "Connect Professional Network",
        description: "Link LinkedIn, verify employment, add professional licenses",
        xpReward: 250,
        trustBoost: 15,
        icon: "fas fa-briefcase",
        difficulty: "medium"
      });
    }
    
    if (!verificationTypes.includes("document_attestation")) {
      opportunities.push({
        type: "document_attestation",
        title: "Notarize Identity Documents",
        description: "Get official documents notarized and government cross-verified",
        xpReward: 400,
        trustBoost: 25,
        icon: "fas fa-stamp",
        difficulty: "hard"
      });
    }
    
    if (!verificationTypes.includes("social_network_validation")) {
      opportunities.push({
        type: "social_network_validation",
        title: "Build Trust Network",
        description: "Get endorsed by verified friends, colleagues, and family",
        xpReward: 300,
        trustBoost: 20,
        icon: "fas fa-users-cog",
        difficulty: "medium"
      });
    }
    
    // Advanced opportunities for high-level users
    if ((user.trustLevel || 1) >= 3) {
      opportunities.push({
        type: "biometric_advanced",
        title: "Advanced Biometric Scan",
        description: "Iris scan, voiceprint, and behavioral biometrics",
        xpReward: 500,
        trustBoost: 30,
        icon: "fas fa-eye",
        difficulty: "expert"
      });
      
      opportunities.push({
        type: "cross_platform_validation",
        title: "Cross-Platform Identity Sync",
        description: "Verify identity across multiple platforms and services",
        xpReward: 350,
        trustBoost: 18,
        icon: "fas fa-link",
        difficulty: "hard"
      });
    }
    
    return opportunities.slice(0, 3); // Show top 3 opportunities
  };

  const evolution = calculateEvolutionProgress();
  const networkPower = calculateNetworkPower();
  const momentum = calculateMomentum();
  const growthOpportunities = getGrowthOpportunities();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "hard": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "expert": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getLevelTitle = (level: number) => {
    if (level >= 9) return "ChittyID Legend";
    if (level >= 7) return "ChittyID Master";
    if (level >= 5) return "ChittyID Expert";
    if (level >= 3) return "ChittyID Verified";
    return "ChittyID Apprentice";
  };

  return (
    <Card className="bg-gradient-to-br from-electric-blue-900/20 to-mint-green-900/20 border-electric-blue-500/30" data-testid="card-chitty-id-growth">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-electric-blue-500/20 rounded-full flex items-center justify-center">
              <i className="fas fa-id-card text-electric-blue-400 text-xl"></i>
            </div>
            <div>
              <span className="text-xl">ChittyID Growth Center</span>
              <p className="text-sm text-muted-foreground font-mono">{user.chittyId}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className="text-sm px-3 py-1 bg-electric-blue-500/10 border-electric-blue-500/30"
          >
            {getLevelTitle(user.trustLevel || 1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* ChittyID Evolution Progress */}
        <div className="space-y-4" data-testid="section-evolution">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">ChittyID Evolution</h4>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="font-mono">
                Level {evolution.currentLevel}
              </Badge>
              {!evolution.isMaxLevel && (
                <Badge variant="outline" className="font-mono text-xs">
                  → L{evolution.nextLevel}
                </Badge>
              )}
            </div>
          </div>
          
          {!evolution.isMaxLevel ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {evolution.nextLevel}</span>
                <span className="font-mono text-mint-green-400">
                  {evolution.progressInLevel}/100 XP
                </span>
              </div>
              <Progress 
                value={evolution.progressInLevel} 
                className="h-4 bg-dark-bg-800" 
                data-testid="progress-level"
              />
            </div>
          ) : (
            <div className="text-center py-4 bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg border border-gold-500/20">
              <i className="fas fa-crown text-gold-400 text-2xl mb-2"></i>
              <p className="font-medium text-gold-400">Maximum Level Achieved!</p>
              <p className="text-xs text-muted-foreground">You are a ChittyID Legend</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Power Metrics */}
        <div className="grid grid-cols-3 gap-4" data-testid="section-power-metrics">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-electric-blue-400 font-mono">
              {user.trustScore || 0}
            </div>
            <div className="text-xs text-muted-foreground">Trust Score</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-mint-green-400 font-mono">
              {networkPower}
            </div>
            <div className="text-xs text-muted-foreground">Network Power</div>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400 font-mono">
              {momentum}%
            </div>
            <div className="text-xs text-muted-foreground">Momentum</div>
          </div>
        </div>

        <Separator />

        {/* Growth Opportunities */}
        <div className="space-y-4" data-testid="section-growth-opportunities">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Growth Opportunities</h4>
            <Badge variant="outline" className="text-xs">
              {growthOpportunities.length} available
            </Badge>
          </div>
          
          <div className="space-y-3">
            {growthOpportunities.map((opportunity, index) => (
              <div 
                key={index} 
                className="border border-border rounded-lg p-4 hover:border-electric-blue-500/50 transition-colors cursor-pointer group"
                data-testid={`opportunity-${opportunity.type}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-electric-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-electric-blue-500/30 transition-colors">
                      <i className={`${opportunity.icon} text-electric-blue-400`}></i>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{opportunity.title}</h5>
                      <p className="text-xs text-muted-foreground mb-2">
                        {opportunity.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getDifficultyColor(opportunity.difficulty)}`}
                        >
                          {opportunity.difficulty}
                        </Badge>
                        <span className="text-xs text-mint-green-400">
                          +{opportunity.xpReward} XP
                        </span>
                        <span className="text-xs text-electric-blue-400">
                          +{opportunity.trustBoost} Trust
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="group-hover:bg-electric-blue-500 group-hover:text-white transition-colors"
                  >
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {growthOpportunities.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <i className="fas fa-check-circle text-3xl mb-3 text-mint-green-400"></i>
              <p className="font-medium">All Available Verifications Complete!</p>
              <p className="text-sm">New growth opportunities unlock as you level up</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            className="flex-1 bg-electric-blue-500 hover:bg-electric-blue-600"
            data-testid="button-boost-network"
          >
            <i className="fas fa-rocket mr-2"></i>
            Boost Network
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            data-testid="button-view-leaderboard"
          >
            <i className="fas fa-trophy mr-2"></i>
            Leaderboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}