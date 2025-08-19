import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { VerificationMethod } from '@shared/schema';

interface NetworkValidationProps {
  verifications: VerificationMethod[];
}

export default function NetworkValidation({ verifications }: NetworkValidationProps) {
  
  const professionalNetwork = verifications.find(v => v.type === "professional_network")?.data as any;
  const documentAttestation = verifications.find(v => v.type === "document_attestation")?.data as any;
  const socialNetwork = verifications.find(v => v.type === "social_network_validation")?.data as any;

  const calculateNetworkTrustScore = () => {
    let score = 0;
    let maxScore = 0;

    // Professional network scoring
    if (professionalNetwork) {
      const employmentVerified = professionalNetwork.employmentHistory?.filter((emp: any) => emp.verified).length || 0;
      const licenseCount = professionalNetwork.professionalLicenses?.length || 0;
      const connectionRatio = (professionalNetwork.mutualConnections || 0) / Math.max(1, professionalNetwork.linkedinConnections || 1);
      
      score += Math.min(employmentVerified * 15, 45); // Max 45 points for employment
      score += Math.min(licenseCount * 10, 30); // Max 30 points for licenses
      score += Math.min(connectionRatio * 100 * 0.25, 25); // Max 25 points for connection quality
      maxScore += 100;
    }

    // Document attestation scoring
    if (documentAttestation) {
      const notaryVerifications = documentAttestation.notaryVerifications?.length || 0;
      const govDocs = documentAttestation.governmentIssuedDocs?.filter((doc: any) => doc.verified).length || 0;
      const educationVerified = documentAttestation.educationVerifications?.length || 0;
      
      score += Math.min(notaryVerifications * 25, 50); // Max 50 points for notary
      score += Math.min(govDocs * 20, 40); // Max 40 points for gov docs
      score += Math.min(educationVerified * 10, 10); // Max 10 points for education
      maxScore += 100;
    }

    // Social network scoring
    if (socialNetwork) {
      const endorserCount = socialNetwork.trustedEndorsers?.length || 0;
      const avgTrustLevel = socialNetwork.networkMetrics?.averageTrustLevel || 0;
      const crossValidated = socialNetwork.networkMetrics?.crossValidatedClaims || 0;
      
      score += Math.min(endorserCount * 20, 60); // Max 60 points for endorsers
      score += Math.min(avgTrustLevel * 8, 40); // Max 40 points for trust level
      score += Math.min(crossValidated * 5, 50); // Max 50 points for cross-validation
      // Penalty for conflicts
      const conflicts = socialNetwork.networkMetrics?.conflictingInformation || 0;
      score -= conflicts * 20;
      maxScore += 150;
    }

    return maxScore > 0 ? Math.max(0, (score / maxScore) * 100) : 0;
  };

  const networkTrustScore = calculateNetworkTrustScore();

  const getTrustLevelColor = (level: number) => {
    if (level >= 85) return "text-emerald-500";
    if (level >= 70) return "text-blue-500";
    if (level >= 55) return "text-yellow-500";
    return "text-orange-500";
  };

  const getEndorserIcon = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'former manager':
      case 'manager': return 'fas fa-user-tie';
      case 'business partner': return 'fas fa-handshake';
      case 'family member': return 'fas fa-users';
      case 'colleague': return 'fas fa-user-friends';
      default: return 'fas fa-user';
    }
  };

  return (
    <Card className="bg-card border-border" data-testid="card-network-validation">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Network Validation Trust</span>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={networkTrustScore > 80 ? "default" : networkTrustScore > 60 ? "secondary" : "outline"}
              className="font-mono"
            >
              {networkTrustScore.toFixed(1)}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Network Trust Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Composite Network Trust</span>
            <span className={`font-mono ${getTrustLevelColor(networkTrustScore)}`}>
              {networkTrustScore.toFixed(1)}/100
            </span>
          </div>
          <Progress 
            value={networkTrustScore} 
            className="h-3" 
            data-testid="progress-network-trust"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Unvalidated</span>
            <span>Fully Validated Network</span>
          </div>
        </div>

        <Separator />

        {/* Professional Network Section */}
        {professionalNetwork && (
          <div className="space-y-4" data-testid="section-professional-network">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center">
                <i className="fas fa-briefcase mr-2 text-indigo-500"></i>
                Professional Network Authority
              </h4>
              <Badge variant="outline" className="text-xs">
                {professionalNetwork.employmentHistory?.filter((emp: any) => emp.verified).length || 0} verified positions
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Employment History</p>
                {professionalNetwork.employmentHistory?.map((emp: any, index: number) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded text-xs ${emp.verified ? 'bg-green-500/10 border border-green-500/20' : 'bg-gray-500/10 border border-gray-500/20'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{emp.company}</span>
                      {emp.verified ? (
                        <i className="fas fa-check-circle text-green-500"></i>
                      ) : (
                        <i className="fas fa-clock text-gray-500"></i>
                      )}
                    </div>
                    <div className="text-muted-foreground">
                      {emp.role} • {emp.years} years
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Professional Credentials</p>
                {professionalNetwork.professionalLicenses?.map((license: string, index: number) => (
                  <div key={index} className="p-2 rounded text-xs bg-blue-500/10 border border-blue-500/20">
                    <i className="fas fa-certificate mr-2 text-blue-500"></i>
                    {license}
                  </div>
                ))}
                
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="font-mono font-bold text-indigo-500">
                      {professionalNetwork.linkedinConnections || 0}
                    </div>
                    <div className="text-muted-foreground">LinkedIn Connections</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <div className="font-mono font-bold text-indigo-500">
                      {professionalNetwork.mutualConnections || 0}
                    </div>
                    <div className="text-muted-foreground">Mutual Connections</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Attestation Section */}
        {documentAttestation && (
          <div className="space-y-4" data-testid="section-document-attestation">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center">
                <i className="fas fa-stamp mr-2 text-amber-600"></i>
                Document Attestation Network
              </h4>
              <Badge variant="outline" className="text-xs">
                {documentAttestation.notaryVerifications?.length || 0} notarized documents
              </Badge>
            </div>
            
            <div className="space-y-3">
              {documentAttestation.notaryVerifications?.map((notary: any, index: number) => (
                <div key={index} className="border border-amber-500/20 rounded-lg p-3 bg-amber-500/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{notary.document}</p>
                      <p className="text-xs text-muted-foreground">
                        Notarized by {notary.notaryName} (ID: {notary.notaryId})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Date: {notary.attestationDate}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        <i className="fas fa-signature mr-1"></i>
                        {notary.digitalSignature}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <i className="fas fa-certificate mr-1"></i>
                        {notary.sealAuthenticity}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {documentAttestation.governmentIssuedDocs && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Government Cross-References</p>
                  <div className="grid grid-cols-1 gap-2">
                    {documentAttestation.governmentIssuedDocs.map((doc: any, index: number) => (
                      <div key={index} className="p-2 rounded text-xs border border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center justify-between">
                          <span>{doc.type} ({doc.state || doc.country})</span>
                          <div className="flex space-x-1">
                            {doc.crossReferenced?.map((ref: string, refIndex: number) => (
                              <Badge key={refIndex} variant="outline" className="text-xs">
                                {ref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Network Validation Section */}
        {socialNetwork && (
          <div className="space-y-4" data-testid="section-social-network">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center">
                <i className="fas fa-users-cog mr-2 text-green-500"></i>
                Social Trust Network
              </h4>
              <Badge variant="outline" className="text-xs">
                {socialNetwork.trustedEndorsers?.length || 0} trusted endorsers
              </Badge>
            </div>
            
            <div className="space-y-3">
              {socialNetwork.trustedEndorsers?.map((endorser: any, index: number) => (
                <div 
                  key={index} 
                  className="border border-green-500/20 rounded-lg p-4 bg-green-500/5"
                  data-testid={`endorser-${index}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <i className={`${getEndorserIcon(endorser.relationship)} text-green-500`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{endorser.name}</h5>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            L{endorser.trustLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(endorser.endorsementStrength * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {endorser.relationship} • Known for {endorser.yearsKnown} years
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {endorser.verificationMethods?.map((method: string, methodIndex: number) => (
                          <Badge key={methodIndex} variant="outline" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-xs italic text-muted-foreground bg-muted/30 rounded p-2">
                        "{endorser.endorsementNote}"
                      </p>
                      
                      <div className="mt-2 text-xs text-muted-foreground font-mono">
                        ChittyID: {endorser.chittyId}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Network Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="p-3 bg-muted/50 rounded text-center">
                <div className="font-mono font-bold text-green-500 text-lg">
                  {socialNetwork.networkMetrics?.totalEndorsers || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Endorsers</div>
              </div>
              <div className="p-3 bg-muted/50 rounded text-center">
                <div className="font-mono font-bold text-green-500 text-lg">
                  {(socialNetwork.networkMetrics?.averageTrustLevel || 0).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Trust Level</div>
              </div>
              <div className="p-3 bg-muted/50 rounded text-center">
                <div className="font-mono font-bold text-green-500 text-lg">
                  {(socialNetwork.networkMetrics?.networkReach || 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Network Reach</div>
              </div>
              <div className="p-3 bg-muted/50 rounded text-center">
                <div className="font-mono font-bold text-green-500 text-lg">
                  {socialNetwork.networkMetrics?.crossValidatedClaims || 0}
                </div>
                <div className="text-xs text-muted-foreground">Cross-Validated</div>
              </div>
            </div>
          </div>
        )}

        {!professionalNetwork && !documentAttestation && !socialNetwork && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <i className="fas fa-network-wired text-2xl"></i>
            </div>
            <p className="mb-2">No network validation data available</p>
            <p className="text-sm">Connect with verified individuals and organizations to build network trust</p>
            <Button variant="outline" size="sm" className="mt-4">
              <i className="fas fa-plus mr-2"></i>
              Start Network Verification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}