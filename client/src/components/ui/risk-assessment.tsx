import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { VerificationMethod } from '@shared/schema';

interface RiskAssessmentProps {
  verifications: VerificationMethod[];
  trustScore: number;
}

interface RiskFactor {
  name: string;
  score: number;
  status: 'high' | 'medium' | 'low' | 'verified';
  description: string;
  dataPoints: string[];
}

export default function RiskAssessment({ verifications, trustScore }: RiskAssessmentProps) {
  
  const calculateRiskFactors = (): RiskFactor[] => {
    const factors: RiskFactor[] = [];

    // Domain verification analysis
    const domainVerification = verifications.find(v => v.type === "domain_ownership");
    if (domainVerification?.data) {
      const data = domainVerification.data as any;
      factors.push({
        name: "Domain Authority",
        score: data.registrationAge > 365 ? 95 : 60,
        status: data.dnsVerified && data.dmarcPolicy === "p=reject" ? "verified" : "medium",
        description: "Corporate email domain verified through DNS records",
        dataPoints: [
          `Domain age: ${Math.floor(data.registrationAge / 365)} years`,
          `DMARC policy: ${data.dmarcPolicy}`,
          `SSL certificate: ${data.sslCertificate}`,
          `Employee directory: ${data.employeeDirectory ? 'Verified' : 'Not found'}`
        ]
      });
    }

    // Financial verification analysis
    const financialVerification = verifications.find(v => v.type === "bank_verification");
    if (financialVerification?.data) {
      const data = financialVerification.data as any;
      factors.push({
        name: "Financial Stability",
        score: data.creditScore,
        status: data.riskScore < 0.2 ? "verified" : data.riskScore < 0.5 ? "low" : "medium",
        description: "Banking history and credit profile analysis",
        dataPoints: [
          `Credit score: ${data.creditScore}`,
          `Account age: ${Math.floor(data.accountAge / 365)} years`,
          `Transaction history: ${data.transactionHistory} analyzed`,
          `Risk flags: ${data.fraudFlags}`,
          `Employment verified: ${data.employmentVerified ? 'Yes' : 'No'}`
        ]
      });
    }

    // Behavioral analysis
    const behavioralVerification = verifications.find(v => v.type === "behavioral_analysis");
    if (behavioralVerification?.data) {
      const data = behavioralVerification.data as any;
      const behaviorScore = (data.locationConsistency * 100 + (1 - data.botProbability) * 100) / 2;
      factors.push({
        name: "Behavioral Patterns",
        score: behaviorScore,
        status: data.suspiciousActivity ? "medium" : "verified",
        description: "Device fingerprinting and usage pattern analysis",
        dataPoints: [
          `Device consistency: ${data.deviceFingerprint}`,
          `Location consistency: ${(data.locationConsistency * 100).toFixed(1)}%`,
          `Bot probability: ${(data.botProbability * 100).toFixed(1)}%`,
          `Timing patterns: ${data.timingPatterns}`,
          `VPN usage: ${data.vpnUsage ? 'Detected' : 'None'}`
        ]
      });
    }

    // Biometric analysis
    const biometricVerification = verifications.find(v => v.type === "biometric_scan");
    if (biometricVerification?.data) {
      const data = biometricVerification.data as any;
      factors.push({
        name: "Biometric Uniqueness",
        score: data.livenessScore * 100,
        status: data.duplicateCheck === "no-matches-found" ? "verified" : "medium",
        description: "Facial geometry and liveness detection analysis",
        dataPoints: [
          `Liveness score: ${(data.livenessScore * 100).toFixed(1)}%`,
          `Quality score: ${(data.qualityScore * 100).toFixed(1)}%`,
          `Duplicate check: ${data.duplicateCheck}`,
          `Deepfake detection: ${data.deepfakeDetection}`,
          `Photos analyzed: ${data.photosAnalyzed}`
        ]
      });
    }

    return factors;
  };

  const riskFactors = calculateRiskFactors();
  const overallRiskScore = riskFactors.length > 0 
    ? riskFactors.reduce((sum, factor) => sum + factor.score, 0) / riskFactors.length 
    : 0;

  const getRiskColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLabel = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'low': return 'Low Risk';
      case 'medium': return 'Moderate';
      case 'high': return 'High Risk';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="bg-card border-border" data-testid="card-risk-assessment">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Identity Risk Assessment</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Overall Score:</span>
            <Badge 
              variant={overallRiskScore > 85 ? "default" : overallRiskScore > 70 ? "secondary" : "destructive"}
              className="font-mono"
              data-testid="badge-overall-score"
            >
              {overallRiskScore.toFixed(0)}/100
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Overall Risk Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Trust Level</span>
            <span className="font-mono">{overallRiskScore.toFixed(1)}%</span>
          </div>
          <Progress 
            value={overallRiskScore} 
            className="h-3" 
            data-testid="progress-trust-level"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>High Risk</span>
            <span>Verified Identity</span>
          </div>
        </div>

        <Separator />

        {/* Individual Risk Factors */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Verification Components</h4>
          
          {riskFactors.map((factor, index) => (
            <div 
              key={index} 
              className="border border-border rounded-lg p-4 space-y-3"
              data-testid={`risk-factor-${factor.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getRiskColor(factor.status)}`}></div>
                  <h5 className="font-medium">{factor.name}</h5>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={factor.status === 'verified' ? "default" : factor.status === 'low' ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {getRiskLabel(factor.status)}
                  </Badge>
                  <span className="text-sm font-mono text-muted-foreground">
                    {factor.score.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{factor.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {factor.dataPoints.map((point, pointIndex) => (
                  <div 
                    key={pointIndex} 
                    className="flex items-center space-x-2 font-mono bg-muted/50 rounded px-2 py-1"
                  >
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {riskFactors.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <i className="fas fa-chart-bar text-2xl"></i>
            </div>
            <p>No verification data available for risk assessment</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}