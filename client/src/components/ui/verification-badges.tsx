import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge as BadgeType, VerificationMethod } from '@shared/schema';

interface VerificationBadgesProps {
  badges: { badge: BadgeType; earnedAt: Date }[];
  verifications: VerificationMethod[];
}

interface BadgeStrength {
  category: string;
  strength: number;
  dataContribution: string;
  verificationDepth: string;
  trustWeight: number;
}

export default function VerificationBadges({ badges, verifications }: VerificationBadgesProps) {
  
  const getBadgeStrength = (badge: BadgeType): BadgeStrength => {
    const verification = verifications.find(v => 
      (badge.requirement === "domain_ownership" && v.type === "domain_ownership") ||
      (badge.requirement === "bank_verified" && v.type === "bank_verification") ||
      (badge.requirement === "behavioral_pattern" && v.type === "behavioral_analysis") ||
      (badge.requirement === "biometric_unique" && v.type === "biometric_scan")
    );

    switch (badge.requirement) {
      case "domain_ownership":
        const domainData = verification?.data as any;
        return {
          category: "Infrastructure Trust",
          strength: domainData?.registrationAge > 1000 ? 95 : domainData?.registrationAge > 365 ? 80 : 65,
          dataContribution: "Proves organizational control and email authenticity",
          verificationDepth: `${domainData?.registrationAge ? Math.floor(domainData.registrationAge / 365) : 0} years domain history, DMARC ${domainData?.dmarcPolicy || 'unknown'}`,
          trustWeight: 0.25
        };
      
      case "bank_verified":
        const bankData = verification?.data as any;
        return {
          category: "Economic Identity",
          strength: bankData?.creditScore || 0,
          dataContribution: "Establishes financial history and economic behavior patterns",
          verificationDepth: `${bankData?.transactionHistory || 0} transactions analyzed, ${Math.floor((bankData?.accountAge || 0) / 365)} year banking history`,
          trustWeight: 0.35
        };
      
      case "behavioral_pattern":
        const behaviorData = verification?.data as any;
        const behaviorStrength = behaviorData ? (behaviorData.locationConsistency * 100 + (1 - behaviorData.botProbability) * 100) / 2 : 0;
        return {
          category: "Behavioral Consistency",
          strength: behaviorStrength,
          dataContribution: "Confirms human usage patterns and device consistency",
          verificationDepth: `${behaviorData?.deviceFingerprint || 'unknown'} device stability, ${((behaviorData?.locationConsistency || 0) * 100).toFixed(1)}% location consistency`,
          trustWeight: 0.20
        };
      
      case "biometric_unique":
        const bioData = verification?.data as any;
        return {
          category: "Physical Identity",
          strength: bioData ? bioData.livenessScore * 100 : 0,
          dataContribution: "Provides highest certainty through unique biological markers",
          verificationDepth: `${bioData?.duplicateCheck || 'unknown'}, ${((bioData?.qualityScore || 0) * 100).toFixed(1)}% image quality`,
          trustWeight: 0.40
        };
      
      default:
        return {
          category: "Unknown",
          strength: 0,
          dataContribution: "No verification data available",
          verificationDepth: "Badge without associated verification",
          trustWeight: 0
        };
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 90) return "text-emerald-500 border-emerald-500/50";
    if (strength >= 75) return "text-blue-500 border-blue-500/50";
    if (strength >= 60) return "text-yellow-500 border-yellow-500/50";
    if (strength >= 40) return "text-orange-500 border-orange-500/50";
    return "text-red-500 border-red-500/50";
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 90) return "Exceptional";
    if (strength >= 75) return "Strong";
    if (strength >= 60) return "Moderate";
    if (strength >= 40) return "Basic";
    return "Weak";
  };

  const totalTrustWeight = badges.reduce((sum, { badge }) => {
    return sum + getBadgeStrength(badge).trustWeight;
  }, 0);

  const weightedTrustScore = badges.reduce((sum, { badge }) => {
    const strength = getBadgeStrength(badge);
    return sum + (strength.strength * strength.trustWeight);
  }, 0) / (totalTrustWeight || 1);

  return (
    <Card className="bg-card border-border" data-testid="card-verification-badges">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Verification Strength Analysis</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Trust Weight:</span>
            <Badge 
              variant={weightedTrustScore > 80 ? "default" : weightedTrustScore > 60 ? "secondary" : "outline"}
              className="font-mono"
              data-testid="badge-trust-weight"
            >
              {weightedTrustScore.toFixed(1)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Trust Weight Distribution */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Composite Trust Score</span>
            <span className="font-mono">{weightedTrustScore.toFixed(1)}/100</span>
          </div>
          <Progress 
            value={weightedTrustScore} 
            className="h-3" 
            data-testid="progress-composite-trust"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Unverified</span>
            <span>Maximum Trust</span>
          </div>
        </div>

        {/* Badge Analysis */}
        <div className="space-y-4">
          {badges.map(({ badge, earnedAt }, index) => {
            const strength = getBadgeStrength(badge);
            return (
              <div 
                key={badge.id}
                className={`border-2 rounded-xl p-4 space-y-3 ${getStrengthColor(strength.strength)}`}
                data-testid={`badge-analysis-${badge.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: badge.color + '20' }}>
                      <i className={`${badge.icon} text-lg`} style={{ color: badge.color }}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground">{strength.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {getStrengthLabel(strength.strength)}
                      </Badge>
                      <span className="font-mono text-sm">{strength.strength.toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Weight: {(strength.trustWeight * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Data Contribution:</p>
                  <p className="text-xs text-muted-foreground">{strength.dataContribution}</p>
                  
                  <p className="text-sm font-medium">Verification Depth:</p>
                  <p className="text-xs font-mono bg-muted/50 rounded px-2 py-1">
                    {strength.verificationDepth}
                  </p>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-muted-foreground">
                      Earned {new Date(earnedAt).toLocaleDateString()}
                    </span>
                    {badge.isNft && (
                      <Badge variant="secondary" className="text-xs">
                        <i className="fas fa-certificate mr-1"></i>
                        NFT {badge.rarity}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {badges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <i className="fas fa-shield-alt text-2xl"></i>
            </div>
            <p className="mb-2">No verification badges earned yet</p>
            <p className="text-sm">Complete identity verifications to build trust</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              data-testid="button-start-verification"
            >
              Start Verification Process
            </Button>
          </div>
        )}

        {/* Trust Building Recommendations */}
        {badges.length > 0 && weightedTrustScore < 85 && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm flex items-center">
              <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
              Strengthen Your Identity
            </h4>
            <p className="text-xs text-muted-foreground">
              Add more verification methods to increase your trust score and unlock additional features.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}