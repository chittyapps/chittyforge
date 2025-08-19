import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Badge as BadgeType, VerificationMethod } from '@shared/schema';

interface ProfessionalCredentialsProps {
  user: User;
  badges: BadgeType[];
  verifications: VerificationMethod[];
}

export default function ProfessionalCredentials({ user, badges, verifications }: ProfessionalCredentialsProps) {

  // Calculate Institutional Trust Rating
  const calculateInstitutionalTrust = () => {
    let trustPoints = 0;
    let maxPoints = 0;

    // Government verification carries highest weight
    const documentAttestation = verifications.find(v => v.type === "document_attestation")?.data as any;
    if (documentAttestation) {
      const govDocs = documentAttestation.governmentIssuedDocs?.filter((doc: any) => doc.verified).length || 0;
      const notaryDocs = documentAttestation.notaryVerifications?.length || 0;
      trustPoints += govDocs * 40 + notaryDocs * 25;
      maxPoints += 120; // Possible max for docs
    }

    // Professional licensing and institutional affiliation
    const professionalNetwork = verifications.find(v => v.type === "professional_network")?.data as any;
    if (professionalNetwork) {
      const verifiedEmployment = professionalNetwork.employmentHistory?.filter((emp: any) => emp.verified).length || 0;
      const licenses = professionalNetwork.professionalLicenses?.length || 0;
      const associations = professionalNetwork.industryAssociations?.length || 0;
      trustPoints += verifiedEmployment * 20 + licenses * 30 + associations * 15;
      maxPoints += 130; // Possible max for professional
    }

    // Social attestation from verified individuals
    const socialNetwork = verifications.find(v => v.type === "social_network_validation")?.data as any;
    if (socialNetwork) {
      const highTrustEndorsers = socialNetwork.trustedEndorsers?.filter((e: any) => e.trustLevel >= 4).length || 0;
      const crossValidations = socialNetwork.networkMetrics?.crossValidatedClaims || 0;
      trustPoints += highTrustEndorsers * 15 + crossValidations * 5;
      maxPoints += 100; // Possible max for social
    }

    return maxPoints > 0 ? Math.min(Math.round((trustPoints / maxPoints) * 100), 100) : 0;
  };

  // Define credential categories with institutional terminology
  const credentialCategories = {
    government: {
      title: "Government Authentication",
      description: "Official identity verification through government agencies",
      icon: "fas fa-university",
      color: "blue",
      credentials: getGovernmentCredentials(),
      authority: "State & Federal Agencies"
    },
    professional: {
      title: "Professional Certification",
      description: "Industry licensing and institutional membership verification",
      icon: "fas fa-certificate",
      color: "purple",
      credentials: getProfessionalCredentials(),
      authority: "Professional Bodies & Licensing Boards"
    },
    institutional: {
      title: "Institutional Validation",
      description: "Third-party attestation from verified organizations",
      icon: "fas fa-building",
      color: "emerald",
      credentials: getInstitutionalCredentials(),
      authority: "Verified Institutions & Notaries"
    }
  };

  function getGovernmentCredentials(): any[] {
    const documentAttestation = verifications.find(v => v.type === "document_attestation")?.data as any;
    const credentials: any[] = [];

    if (documentAttestation?.governmentIssuedDocs) {
      documentAttestation.governmentIssuedDocs.forEach((doc: any) => {
        if (doc.verified) {
          credentials.push({
            name: `${doc.type} Verification`,
            issuer: `${doc.state || doc.country} Government`,
            verificationDate: new Date().toISOString().split('T')[0],
            credentialId: `GOV-${doc.type.replace(/\s/g, '').toUpperCase()}-${Date.now().toString().slice(-6)}`,
            crossReferences: doc.crossReferenced || [],
            status: "VERIFIED",
            authority: doc.state ? "State Authority" : "Federal Authority"
          });
        }
      });
    }

    return credentials;
  }

  function getProfessionalCredentials(): any[] {
    const professionalNetwork = verifications.find(v => v.type === "professional_network")?.data as any;
    const credentials: any[] = [];

    if (professionalNetwork?.professionalLicenses) {
      professionalNetwork.professionalLicenses.forEach((license: string, index: number) => {
        credentials.push({
          name: license,
          issuer: license.includes("IEEE") ? "Institute of Electrical and Electronics Engineers" : 
                 license.includes("AWS") ? "Amazon Web Services" : "Professional Licensing Board",
          verificationDate: new Date(Date.now() - (index * 30 + 15) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          credentialId: `PROF-${license.replace(/\s/g, '').slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`,
          status: "ACTIVE",
          authority: "Professional Association"
        });
      });
    }

    if (professionalNetwork?.employmentHistory) {
      professionalNetwork.employmentHistory.forEach((emp: any) => {
        if (emp.verified) {
          credentials.push({
            name: `Employment Verification - ${emp.role}`,
            issuer: emp.company,
            verificationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            credentialId: `EMP-${emp.company.replace(/\s/g, '').slice(0, 6).toUpperCase()}-${Date.now().toString().slice(-6)}`,
            status: "VERIFIED",
            authority: "Corporate HR Department",
            tenure: `${emp.years} years`
          });
        }
      });
    }

    return credentials;
  }

  function getInstitutionalCredentials(): any[] {
    const documentAttestation = verifications.find(v => v.type === "document_attestation")?.data as any;
    const socialNetwork = verifications.find(v => v.type === "social_network_validation")?.data as any;
    const credentials: any[] = [];

    if (documentAttestation?.notaryVerifications) {
      documentAttestation.notaryVerifications.forEach((notary: any) => {
        credentials.push({
          name: `Notarized ${notary.document}`,
          issuer: notary.notaryName,
          verificationDate: notary.attestationDate,
          credentialId: `NOT-${notary.notaryId}-${Date.now().toString().slice(-6)}`,
          status: "AUTHENTICATED",
          authority: "Licensed Notary Public",
          notaryId: notary.notaryId,
          digitalSignature: notary.digitalSignature
        });
      });
    }

    if (documentAttestation?.educationVerifications) {
      documentAttestation.educationVerifications.forEach((edu: any) => {
        credentials.push({
          name: `${edu.degree} Degree Verification`,
          issuer: edu.institution,
          verificationDate: new Date().toISOString().split('T')[0],
          credentialId: `EDU-${edu.institution.replace(/\s/g, '').slice(0, 6).toUpperCase()}-${edu.year}`,
          status: "VERIFIED",
          authority: "Academic Institution",
          graduationYear: edu.year
        });
      });
    }

    return credentials;
  }

  const institutionalTrust = calculateInstitutionalTrust();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VERIFIED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "ACTIVE": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "AUTHENTICATED": return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const getCategoryColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "border-blue-500/30 bg-blue-500/5",
      purple: "border-purple-500/30 bg-purple-500/5",
      emerald: "border-emerald-500/30 bg-emerald-500/5"
    };
    return colorMap[color] || "border-gray-500/30 bg-gray-500/5";
  };

  return (
    <Card className="bg-card border-border" data-testid="card-professional-credentials">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center">
              <i className="fas fa-shield-alt text-slate-600 dark:text-slate-300 text-xl"></i>
            </div>
            <div>
              <span className="text-xl font-semibold">Professional Credentials</span>
              <p className="text-sm text-muted-foreground">Institutional verification status</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono">{institutionalTrust}%</div>
            <div className="text-xs text-muted-foreground">Institutional Trust</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Institutional Trust Rating */}
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Institutional Trust Rating</h4>
            <Badge 
              variant="outline" 
              className={`font-mono ${
                institutionalTrust >= 80 ? 'border-emerald-500/50 text-emerald-400' :
                institutionalTrust >= 60 ? 'border-blue-500/50 text-blue-400' :
                'border-yellow-500/50 text-yellow-400'
              }`}
            >
              {institutionalTrust >= 80 ? 'Highly Trusted' :
               institutionalTrust >= 60 ? 'Verified' : 'Pending Validation'}
            </Badge>
          </div>
          <Progress 
            value={institutionalTrust} 
            className="h-2" 
            data-testid="progress-institutional-trust"
          />
          <div className="text-xs text-muted-foreground">
            Based on government documentation, professional licensing, and institutional attestation
          </div>
        </div>

        {/* Credential Categories */}
        <div className="space-y-6">
          {Object.entries(credentialCategories).map(([key, category]) => (
            <div 
              key={key} 
              className={`border rounded-lg p-4 ${getCategoryColor(category.color)}`}
              data-testid={`section-${key}-credentials`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <i className={`${category.icon} text-lg`}></i>
                  <div>
                    <h4 className="font-semibold">{category.title}</h4>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {category.credentials.length} credential{category.credentials.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground mb-3 flex items-center">
                <i className="fas fa-gavel mr-2"></i>
                Issuing Authority: {category.authority}
              </div>

              <div className="space-y-3">
                {category.credentials.length > 0 ? (
                  category.credentials.map((credential: any, index: number) => (
                    <div 
                      key={index}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-3"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{credential.name}</h5>
                          <p className="text-xs text-muted-foreground mb-1">
                            Issued by: {credential.issuer}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Verification Date: {credential.verificationDate}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(credential.status)}`}
                        >
                          {credential.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                        <div className="text-xs font-mono text-muted-foreground">
                          ID: {credential.credentialId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {credential.authority}
                        </div>
                      </div>

                      {/* Additional credential details */}
                      {credential.crossReferences && credential.crossReferences.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                          <p className="text-xs text-muted-foreground mb-1">Cross-verified with:</p>
                          <div className="flex flex-wrap gap-1">
                            {credential.crossReferences.map((ref: string, refIndex: number) => (
                              <Badge key={refIndex} variant="secondary" className="text-xs">
                                {ref}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {credential.tenure && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Duration: {credential.tenure}
                        </div>
                      )}

                      {credential.notaryId && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Notary ID: {credential.notaryId} • Digital Signature: {credential.digitalSignature}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <i className="fas fa-certificate text-2xl mb-2 opacity-50"></i>
                    <p className="text-sm">No {category.title.toLowerCase()} credentials available</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Begin {category.title} Process
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pending Verifications */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3 flex items-center">
            <i className="fas fa-clock mr-2 text-yellow-500"></i>
            Pending Institutional Reviews
          </h4>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Additional verification methods available for enhanced institutional trust rating
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              <i className="fas fa-plus mr-2"></i>
              Request Additional Verification
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}