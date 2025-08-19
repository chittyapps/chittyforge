import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Badge as BadgeType, VerificationMethod } from '@shared/schema';

interface ChittyIDCardProps {
  user: User;
  badges: BadgeType[];
  verifications: VerificationMethod[];
}

export default function ChittyIDCard({ user, badges, verifications }: ChittyIDCardProps) {

  // Calculate verification level for official status
  const calculateVerificationLevel = () => {
    const completedVerifications = verifications.filter(v => v.status === "completed");
    const verificationTypes = completedVerifications.map(v => v.type);
    
    // Determine official status
    let status = "PENDING";
    let level = "Level 1";
    let authority = "BASIC";
    
    if (verificationTypes.includes("document_attestation")) {
      const docData = verifications.find(v => v.type === "document_attestation")?.data as any;
      if (docData?.governmentIssuedDocs?.some((doc: any) => doc.verified)) {
        status = "VERIFIED";
        authority = "GOVERNMENT";
        level = "Level 2";
      }
    }
    
    if (verificationTypes.includes("professional_network")) {
      const profData = verifications.find(v => v.type === "professional_network")?.data as any;
      if (profData?.employmentHistory?.some((emp: any) => emp.verified)) {
        if (status === "VERIFIED") {
          authority = "INSTITUTIONAL";
          level = "Level 3";
        }
      }
    }
    
    if (verificationTypes.length >= 3) {
      status = "AUTHENTICATED";
      authority = "MULTI-FACTOR";
      level = "Level 4";
    }
    
    return { status, level, authority };
  };

  const verificationLevel = calculateVerificationLevel();
  
  // Get issuer information based on verification
  const getIssuerInfo = () => {
    const documentAttestation = verifications.find(v => v.type === "document_attestation")?.data as any;
    if (documentAttestation?.governmentIssuedDocs?.length > 0) {
      const govDoc = documentAttestation.governmentIssuedDocs[0];
      return {
        issuer: `${govDoc.state || govDoc.country} Authority`,
        reference: govDoc.documentNumber || "GOV-REF-2024",
        date: new Date().toISOString().split('T')[0]
      };
    }
    
    return {
      issuer: "ChittyID Authority",
      reference: `CID-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString().split('T')[0]
    };
  };

  const issuerInfo = getIssuerInfo();

  // Get status colors - clean, professional like real IDs
  const getStatusStyling = (status: string) => {
    switch (status) {
      case "AUTHENTICATED":
        return {
          bg: "bg-white dark:bg-slate-900",
          border: "border-slate-300 dark:border-slate-600",
          badge: "bg-slate-800 text-white",
          accent: "text-slate-800 dark:text-slate-200"
        };
      case "VERIFIED":
        return {
          bg: "bg-white dark:bg-slate-900",
          border: "border-slate-300 dark:border-slate-600",
          badge: "bg-slate-700 text-white",
          accent: "text-slate-700 dark:text-slate-300"
        };
      default:
        return {
          bg: "bg-white dark:bg-slate-900",
          border: "border-slate-300 dark:border-slate-600",
          badge: "bg-slate-600 text-white",
          accent: "text-slate-600 dark:text-slate-400"
        };
    }
  };

  const styling = getStatusStyling(verificationLevel.status);

  return (
    <div className="max-w-sm mx-auto" data-testid="card-chitty-id">
      {/* Official ID Card */}
      <Card className={`${styling.bg} ${styling.border} border-2 shadow-2xl`}>
        <CardContent className="p-0">
          
          {/* Header Bar */}
          <div className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-800">C</span>
                </div>
                <span className="font-bold text-sm">ChittyID</span>
              </div>
              <Badge className={`${styling.badge} text-xs font-mono px-2 py-1`}>
                {verificationLevel.status}
              </Badge>
            </div>
          </div>

          <div className="p-6">
            {/* ID Photo and Basic Info */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-20 h-24 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded border-2 border-slate-400 dark:border-slate-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                  {user.username?.charAt(0).toUpperCase() || 'ID'}
                </span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {user.username?.toUpperCase() || 'PENDING ASSIGNMENT'}
                </h2>
                <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">ID NUMBER</span>
                    <span className="font-mono text-xs">{user.chittyId || 'PENDING'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">LEVEL</span>
                    <span className="font-mono text-xs font-bold">{verificationLevel.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">AUTHORITY</span>
                    <span className="font-mono text-xs">{verificationLevel.authority}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Status Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                  {Math.round((user.trustScore || 0) / 10)}%
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Trust Score
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                  {verifications.filter(v => v.status === "completed").length}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Verifications
                </div>
              </div>
            </div>

            {/* Verification Stamps */}
            <div className="mb-6">
              <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-semibold">
                Official Verifications
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* Government */}
                <div className={`text-center p-2 rounded border ${
                  verifications.some(v => v.type === "document_attestation" && v.status === "completed")
                    ? 'bg-slate-200 border-slate-400 dark:bg-slate-700 dark:border-slate-500'
                    : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                }`}>
                  <div className="text-sm mb-1">🏛️</div>
                  <div className="text-xs font-mono">GOV</div>
                </div>
                
                {/* Professional */}
                <div className={`text-center p-2 rounded border ${
                  verifications.some(v => v.type === "professional_network" && v.status === "completed")
                    ? 'bg-slate-200 border-slate-400 dark:bg-slate-700 dark:border-slate-500'
                    : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                }`}>
                  <div className="text-sm mb-1">🏢</div>
                  <div className="text-xs font-mono">PROF</div>
                </div>
                
                {/* Social */}
                <div className={`text-center p-2 rounded border ${
                  verifications.some(v => v.type === "social_network_validation" && v.status === "completed")
                    ? 'bg-slate-200 border-slate-400 dark:bg-slate-700 dark:border-slate-500'
                    : 'bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                }`}>
                  <div className="text-sm mb-1">👥</div>
                  <div className="text-xs font-mono">SOC</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium"
                data-testid="button-verify-identity"
              >
                Verify Identity
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                data-testid="button-view-credentials"
              >
                View Full Credentials
              </Button>
            </div>

            {/* Footer - Issuer Information */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>ISSUED BY:</span>
                  <span className="font-mono">{issuerInfo.issuer}</span>
                </div>
                <div className="flex justify-between">
                  <span>REF:</span>
                  <span className="font-mono">{issuerInfo.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span className="font-mono">{issuerInfo.date}</span>
                </div>
              </div>
            </div>

          </div>

        </CardContent>
      </Card>

      {/* Subtle Next Step Indicator */}
      {verificationLevel.status === "PENDING" && (
        <div className="mt-3 text-center">
          <div className="text-xs text-muted-foreground">
            Complete verification to upgrade status
          </div>
        </div>
      )}
    </div>
  );
}