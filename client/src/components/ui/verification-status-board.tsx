import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Badge as BadgeType, VerificationMethod } from '@shared/schema';

interface VerificationStatusBoardProps {
  user: User;
  badges: BadgeType[];
  verifications: VerificationMethod[];
}

export default function VerificationStatusBoard({ user, badges, verifications }: VerificationStatusBoardProps) {

  // Calculate overall verification completeness
  const calculateVerificationStatus = () => {
    const requiredVerifications = [
      "professional_network",
      "document_attestation", 
      "social_network_validation"
    ];
    
    const completedVerifications = verifications.filter(v => 
      v.status === "completed" && requiredVerifications.includes(v.type)
    );
    
    const completionRate = (completedVerifications.length / requiredVerifications.length) * 100;
    
    return {
      completionRate: Math.round(completionRate),
      completedCount: completedVerifications.length,
      totalRequired: requiredVerifications.length,
      status: completionRate >= 100 ? "FULLY_VERIFIED" : 
              completionRate >= 66 ? "SUBSTANTIALLY_VERIFIED" :
              completionRate >= 33 ? "PARTIALLY_VERIFIED" : "INITIAL_VERIFICATION"
    };
  };

  // Define verification categories with official terminology
  const verificationCategories = {
    identity: {
      title: "Identity Authentication",
      description: "Government-issued identification and biometric verification",
      requirements: [
        {
          name: "Government ID Cross-Reference",
          description: "Driver's License, Passport, and federal database verification",
          completed: hasDocumentVerification(),
          authority: "DMV, State Department, SSA",
          level: "FEDERAL"
        },
        {
          name: "Biometric Profile Authentication", 
          description: "Facial recognition, fingerprint, and liveness detection",
          completed: hasBiometricVerification(),
          authority: "Biometric Security Systems",
          level: "ADVANCED"
        }
      ]
    },
    professional: {
      title: "Professional Standing Verification",
      description: "Employment history, licensing, and institutional membership",
      requirements: [
        {
          name: "Employment History Validation",
          description: "HR department verification of current and previous employment",
          completed: hasEmploymentVerification(),
          authority: "Corporate HR Departments",
          level: "CORPORATE"
        },
        {
          name: "Professional License Authentication",
          description: "Industry licensing board and certification verification",
          completed: hasLicenseVerification(),
          authority: "Professional Licensing Boards",
          level: "PROFESSIONAL"
        },
        {
          name: "Industry Association Membership",
          description: "Verified membership in professional organizations",
          completed: hasAssociationMembership(),
          authority: "Professional Associations",
          level: "INSTITUTIONAL"
        }
      ]
    },
    social: {
      title: "Social Network Validation",
      description: "Third-party attestation and relationship verification",
      requirements: [
        {
          name: "Professional Reference Network",
          description: "Verification by colleagues, supervisors, and business partners",
          completed: hasProfessionalReferences(),
          authority: "Professional References",
          level: "PEER_REVIEW"
        },
        {
          name: "Personal Attestation Network",
          description: "Character verification by verified family and friends",
          completed: hasPersonalReferences(),
          authority: "Personal References",
          level: "CHARACTER"
        },
        {
          name: "Community Standing Verification",
          description: "Public records and community involvement validation",
          completed: hasCommunityStanding(),
          authority: "Public Records",
          level: "COMMUNITY"
        }
      ]
    }
  };

  function hasDocumentVerification() {
    const docAttestation = verifications.find(v => v.type === "document_attestation")?.data as any;
    return docAttestation?.governmentIssuedDocs?.some((doc: any) => doc.verified) || false;
  }

  function hasBiometricVerification() {
    return verifications.some(v => v.type.includes("biometric") && v.status === "completed");
  }

  function hasEmploymentVerification() {
    const profNetwork = verifications.find(v => v.type === "professional_network")?.data as any;
    return profNetwork?.employmentHistory?.some((emp: any) => emp.verified) || false;
  }

  function hasLicenseVerification() {
    const profNetwork = verifications.find(v => v.type === "professional_network")?.data as any;
    return profNetwork?.professionalLicenses?.length > 0 || false;
  }

  function hasAssociationMembership() {
    const profNetwork = verifications.find(v => v.type === "professional_network")?.data as any;
    return profNetwork?.industryAssociations?.length > 0 || false;
  }

  function hasProfessionalReferences() {
    const socialNetwork = verifications.find(v => v.type === "social_network_validation")?.data as any;
    return socialNetwork?.trustedEndorsers?.some((e: any) => 
      e.relationship?.toLowerCase().includes("manager") || 
      e.relationship?.toLowerCase().includes("colleague") ||
      e.relationship?.toLowerCase().includes("partner")
    ) || false;
  }

  function hasPersonalReferences() {
    const socialNetwork = verifications.find(v => v.type === "social_network_validation")?.data as any;
    return socialNetwork?.trustedEndorsers?.some((e: any) => 
      e.relationship?.toLowerCase().includes("family") || 
      e.relationship?.toLowerCase().includes("friend")
    ) || false;
  }

  function hasCommunityStanding() {
    // Placeholder for community verification logic
    return false;
  }

  const verificationStatus = calculateVerificationStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FULLY_VERIFIED": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "SUBSTANTIALLY_VERIFIED": return "text-blue-600 bg-blue-50 border-blue-200";
      case "PARTIALLY_VERIFIED": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case "FULLY_VERIFIED": return "Fully Verified Identity";
      case "SUBSTANTIALLY_VERIFIED": return "Substantially Verified";
      case "PARTIALLY_VERIFIED": return "Partially Verified";
      default: return "Initial Verification";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "FEDERAL": return "bg-blue-600 text-white";
      case "ADVANCED": return "bg-purple-600 text-white";
      case "CORPORATE": return "bg-emerald-600 text-white";
      case "PROFESSIONAL": return "bg-indigo-600 text-white";
      case "INSTITUTIONAL": return "bg-violet-600 text-white";
      case "PEER_REVIEW": return "bg-cyan-600 text-white";
      case "CHARACTER": return "bg-teal-600 text-white";
      case "COMMUNITY": return "bg-orange-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  return (
    <Card className="bg-card border-border" data-testid="card-verification-status-board">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
              <i className="fas fa-clipboard-check text-slate-600 dark:text-slate-300 text-xl"></i>
            </div>
            <div>
              <span className="text-xl font-semibold">Verification Status Board</span>
              <p className="text-sm text-muted-foreground">Official identity verification progress</p>
            </div>
          </div>
          <div className="text-right">
            <Badge 
              variant="outline" 
              className={`text-sm px-3 py-1 border ${getStatusColor(verificationStatus.status)}`}
            >
              {getStatusTitle(verificationStatus.status)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Overall Verification Progress */}
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Verification Completeness</h4>
            <span className="text-sm font-mono">{verificationStatus.completedCount}/{verificationStatus.totalRequired} Categories</span>
          </div>
          <Progress 
            value={verificationStatus.completionRate} 
            className="h-3" 
            data-testid="progress-verification-completeness"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Initial Verification</span>
            <span>Fully Verified</span>
          </div>
        </div>

        {/* ChittyID Authority Level */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300">
              {user.trustLevel || 1}
            </div>
            <div className="text-xs text-muted-foreground">Authority Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300">
              {Math.round((user.trustScore || 0) / 10)}%
            </div>
            <div className="text-xs text-muted-foreground">Trust Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-300">
              {verifications.filter(v => v.status === "completed").length}
            </div>
            <div className="text-xs text-muted-foreground">Verifications</div>
          </div>
        </div>

        {/* Verification Categories */}
        <div className="space-y-6">
          {Object.entries(verificationCategories).map(([key, category]) => (
            <div key={key} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{category.title}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {category.requirements.filter(r => r.completed).length}/{category.requirements.length} Complete
                </Badge>
              </div>

              <div className="space-y-3">
                {category.requirements.map((requirement, index) => (
                  <div 
                    key={index}
                    className={`border rounded p-3 ${
                      requirement.completed 
                        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20' 
                        : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <i className={`fas ${requirement.completed ? 'fa-check-circle text-emerald-600' : 'fa-circle text-slate-400'}`}></i>
                          <h5 className="font-medium text-sm">{requirement.name}</h5>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 ml-6">
                          {requirement.description}
                        </p>
                        <div className="flex items-center justify-between ml-6">
                          <span className="text-xs text-muted-foreground">
                            Verifying Authority: {requirement.authority}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getLevelColor(requirement.level)}`}
                          >
                            {requirement.level.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Recommended Next Steps</h4>
          <div className="space-y-2">
            {verificationStatus.status !== "FULLY_VERIFIED" && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <div>
                  <p className="font-medium text-sm">Complete remaining verification categories</p>
                  <p className="text-xs text-muted-foreground">
                    Higher verification levels provide increased trust and expanded access
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Continue Verification
                </Button>
              </div>
            )}
            
            {verificationStatus.status === "FULLY_VERIFIED" && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded">
                <div>
                  <p className="font-medium text-sm">Verification Complete</p>
                  <p className="text-xs text-muted-foreground">
                    Your identity is fully verified across all categories
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <i className="fas fa-download mr-2"></i>
                  Export Certificate
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}