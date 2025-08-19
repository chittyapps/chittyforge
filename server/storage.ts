import { 
  type User, type InsertUser, type VerificationMethod, type InsertVerification, 
  type Badge, type UserBadge, type ActivityLog, type InsertActivityLog, 
  type IdentityShare, type BlockchainVerification, type SocialEndorsement, 
  type BiometricData 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByChittyId(chittyId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Verification Methods
  getVerificationMethods(userId: string): Promise<VerificationMethod[]>;
  createVerificationMethod(verification: InsertVerification): Promise<VerificationMethod>;
  updateVerificationMethod(id: string, updates: Partial<VerificationMethod>): Promise<VerificationMethod>;

  // Badges
  getAllBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(userId: string, badgeId: string): Promise<UserBadge>;

  // Activity Logs
  getActivityLogs(userId: string, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;

  // Identity Shares
  createIdentityShare(userId: string, isPublic: boolean, expiresAt?: Date): Promise<IdentityShare>;
  getIdentityShare(shareToken: string): Promise<(IdentityShare & { user: User }) | undefined>;

  // Stats
  getNetworkStats(): Promise<{
    activeUsers: number;
    verificationsToday: number;
    trustTransactions: number;
  }>;

  // Blockchain Verifications
  createBlockchainVerification(data: Omit<BlockchainVerification, 'id' | 'createdAt'>): Promise<BlockchainVerification>;
  getBlockchainVerifications(userId: string): Promise<BlockchainVerification[]>;
  verifyBlockchainAddress(walletAddress: string, signature: string): Promise<boolean>;

  // Social Endorsements
  createEndorsement(data: Omit<SocialEndorsement, 'id' | 'createdAt'>): Promise<SocialEndorsement>;
  getEndorsementsFor(userId: string): Promise<SocialEndorsement[]>;
  getEndorsementsBy(userId: string): Promise<SocialEndorsement[]>;

  // Biometric Data
  createBiometricRecord(data: Omit<BiometricData, 'id' | 'createdAt'>): Promise<BiometricData>;
  getBiometricData(userId: string): Promise<BiometricData[]>;
  verifyBiometric(userId: string, templateData: string, type: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private verificationMethods: Map<string, VerificationMethod>;
  private badges: Map<string, Badge>;
  private userBadges: Map<string, UserBadge>;
  private activityLogs: Map<string, ActivityLog>;
  private identityShares: Map<string, IdentityShare>;
  private blockchainVerifications: Map<string, BlockchainVerification>;
  private socialEndorsements: Map<string, SocialEndorsement>;
  private biometricData: Map<string, BiometricData>;

  constructor() {
    this.users = new Map();
    this.verificationMethods = new Map();
    this.badges = new Map();
    this.userBadges = new Map();
    this.activityLogs = new Map();
    this.identityShares = new Map();
    this.blockchainVerifications = new Map();
    this.socialEndorsements = new Map();
    this.biometricData = new Map();
    
    this.initializeBadges();
    this.initializeDemoUser();
  }

  private initializeBadges() {
    // Real verification badges that represent actual data points and trust levels
    const verificationBadges: Omit<Badge, 'id'>[] = [
      { 
        name: "Domain Authority", 
        description: "Email domain verified through SPF, DKIM, and DMARC records", 
        icon: "fas fa-shield-alt", 
        color: "#2563eb", // Blue - institutional trust
        requirement: "domain_ownership", 
        category: "infrastructure", 
        isNft: false, 
        contractAddress: null, 
        tokenId: null, 
        rarity: "rare" 
      },
      { 
        name: "Financial Footprint", 
        description: "Bank account verified with 6+ months transaction history", 
        icon: "fas fa-university", 
        color: "#059669", // Green - economic stability
        requirement: "bank_verified", 
        category: "financial", 
        isNft: true, 
        contractAddress: null, 
        tokenId: null, 
        rarity: "epic" 
      },
      { 
        name: "Behavioral Consistency", 
        description: "Device fingerprint consistent for 90+ days, stable location patterns", 
        icon: "fas fa-chart-line", 
        color: "#0891b2", // Cyan - behavioral data
        requirement: "behavioral_pattern", 
        category: "behavioral", 
        isNft: false, 
        contractAddress: null, 
        tokenId: null, 
        rarity: "common" 
      },
      { 
        name: "Multi-Source Verification", 
        description: "Identity cross-referenced across 5+ independent databases", 
        icon: "fas fa-network-wired", 
        color: "#7c3aed", // Purple - network validation
        requirement: "multi_source", 
        category: "cross-reference", 
        isNft: true, 
        contractAddress: null, 
        tokenId: null, 
        rarity: "legendary" 
      },
      { 
        name: "Biometric Uniqueness", 
        description: "Facial geometry scanned, liveness detected, no duplicates found", 
        icon: "fas fa-eye", 
        color: "#dc2626", // Red - biometric certainty
        requirement: "biometric_unique", 
        category: "biometric", 
        isNft: true, 
        contractAddress: null, 
        tokenId: null, 
        rarity: "epic" 
      },
      { 
        name: "Physical Presence", 
        description: "Address verified through utility bills, mail interception, GPS check-ins", 
        icon: "fas fa-map-marker-alt", 
        color: "#ea580c", // Orange - physical verification
        requirement: "address_verified", 
        category: "physical", 
        isNft: false, 
        contractAddress: null, 
        tokenId: null, 
        rarity: "rare" 
      },
      { 
        name: "Social Graph Validation", 
        description: "Identity confirmed by 3+ verified individuals with established histories", 
        icon: "fas fa-users-cog", 
        color: "#059669", // Green - social proof
        requirement: "social_validated", 
        category: "social", 
        isNft: true, 
        contractAddress: null, 
        tokenId: null, 
        rarity: "rare" 
      },
      { 
        name: "Professional Network Authority", 
        description: "Employment verified, professional licenses checked, industry associations confirmed", 
        icon: "fas fa-briefcase", 
        color: "#4338ca", // Indigo - professional verification
        requirement: "professional_network", 
        category: "professional", 
        isNft: true, 
        contractAddress: null, 
        tokenId: null, 
        rarity: "epic" 
      },
      { 
        name: "Document Attestation Network", 
        description: "Documents verified by notaries, government agencies, and educational institutions", 
        icon: "fas fa-stamp", 
        color: "#7c2d12", // Brown - official attestation
        requirement: "document_attestation", 
        category: "legal", 
        isNft: true, 
        contractAddress: null, 
        tokenId: null, 
        rarity: "legendary" 
      },
      { 
        name: "Social Trust Network", 
        description: "Identity validated by verified friends, colleagues, and family members", 
        icon: "fas fa-users-cog", 
        color: "#059669", // Green - social validation
        requirement: "social_network_validation", 
        category: "social", 
        isNft: true, 
        contractAddress: null, 
        tokenId: null, 
        rarity: "rare" 
      }
    ];

    verificationBadges.forEach(badge => {
      const id = randomUUID();
      this.badges.set(id, { ...badge, id });
    });
  }

  private async initializeDemoUser() {
    const demoUser: User = {
      id: "demo-user-123",
      username: "alex.rodriguez.verified",
      password: "demo123", // This would be hashed in real app
      chittyId: "25-P-USR-DEMO-V-08-7-K",
      email: "alex.rodriguez@techcorp-industries.com",
      phone: "+1-555-0123",
      fullName: "Alexander J. Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      trustLevel: 4,
      trustScore: 850, // High trust from multiple verification sources
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago for behavioral consistency
    };
    
    this.users.set("demo-user-123", demoUser);

    // Professional Network Verification
    const professionalNetworkVerification: VerificationMethod = {
      id: randomUUID(),
      userId: "demo-user-123",
      type: "professional_network",
      status: "completed",
      data: { 
        linkedinProfile: "alex-rodriguez-techcorp",
        linkedinConnections: 847,
        mutualConnections: 23,
        endorsements: 15,
        recommendations: 8,
        companyVerified: true,
        employmentHistory: [
          { company: "TechCorp Industries", role: "Senior Engineer", years: 3.2, verified: true },
          { company: "StartupXYZ", role: "Lead Developer", years: 2.1, verified: true },
          { company: "BigCorp", role: "Software Engineer", years: 1.8, verified: false }
        ],
        professionalLicenses: ["IEEE Member #12847", "AWS Certified Solutions Architect"],
        industryAssociations: ["IEEE Computer Society", "ACM Professional Member"]
      },
      completedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
    };

    // Document Attestation Network
    const documentAttestationVerification: VerificationMethod = {
      id: randomUUID(),
      userId: "demo-user-123",
      type: "document_attestation",
      status: "completed",
      data: { 
        notaryVerifications: [
          { 
            document: "Identity Certificate", 
            notaryId: "NY-47281", 
            notaryName: "Sarah Chen, Esq.", 
            attestationDate: "2024-06-15",
            digitalSignature: "verified",
            sealAuthenticity: "confirmed"
          },
          { 
            document: "Address Verification", 
            notaryId: "NY-47281", 
            notaryName: "Sarah Chen, Esq.", 
            attestationDate: "2024-06-15",
            digitalSignature: "verified",
            sealAuthenticity: "confirmed"
          }
        ],
        apostilleVerifications: [],
        governmentIssuedDocs: [
          { type: "Driver License", state: "NY", verified: true, crossReferenced: ["DMV", "SSA"] },
          { type: "Passport", country: "USA", verified: true, crossReferenced: ["State Dept", "TSA"] }
        ],
        educationVerifications: [
          { institution: "MIT", degree: "BS Computer Science", year: 2018, verified: true }
        ]
      },
      completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
    };

    // Social Network Cross-Validation
    const socialNetworkVerification: VerificationMethod = {
      id: randomUUID(),
      userId: "demo-user-123",
      type: "social_network_validation",
      status: "completed",
      data: { 
        trustedEndorsers: [
          { 
            name: "Dr. Jennifer Park", 
            relationship: "Former Manager", 
            chittyId: "47-V-MGR-PARK-A-11-3-F", 
            trustLevel: 5,
            endorsementStrength: 0.95,
            yearsKnown: 4,
            verificationMethods: ["professional", "biometric", "financial"],
            endorsementNote: "Worked directly with Alex for 3 years. Highly trusted engineer."
          },
          { 
            name: "Michael Thompson", 
            relationship: "Business Partner", 
            chittyId: "52-V-BIZ-THMP-B-09-8-D", 
            trustLevel: 4,
            endorsementStrength: 0.87,
            yearsKnown: 5,
            verificationMethods: ["professional", "financial", "network"],
            endorsementNote: "Co-founded StartupXYZ together. Known personally and professionally."
          },
          { 
            name: "Lisa Rodriguez", 
            relationship: "Family Member", 
            chittyId: "31-V-FAM-LISA-C-12-1-H", 
            trustLevel: 3,
            endorsementStrength: 0.78,
            yearsKnown: 28,
            verificationMethods: ["biometric", "address", "family"],
            endorsementNote: "Sister. Can confirm identity and family relationships."
          }
        ],
        networkMetrics: {
          totalEndorsers: 3,
          averageTrustLevel: 4.0,
          networkReach: 2847, // people reachable through endorsers
          crossValidatedClaims: 12,
          conflictingInformation: 0
        }
      },
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    };

    const financialVerification: VerificationMethod = {
      id: randomUUID(),
      userId: "demo-user-123",
      type: "bank_verification",
      status: "completed",
      data: { 
        bankName: "Chase Bank",
        accountAge: 1247, // days
        transactionHistory: 387, // number of transactions analyzed
        averageBalance: 12500,
        creditScore: 742,
        employmentVerified: true,
        salaryConsistent: true,
        riskScore: 0.15, // low risk
        fraudFlags: 0
      },
      completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
    };

    const behavioralVerification: VerificationMethod = {
      id: randomUUID(),
      userId: "demo-user-123",
      type: "behavioral_analysis",
      status: "completed",
      data: { 
        deviceFingerprint: "stable-180-days",
        locationConsistency: 0.94,
        timingPatterns: "human-like",
        keyboardDynamics: "consistent",
        mouseMovement: "natural",
        sessionDuration: "normal-range",
        suspiciousActivity: false,
        botProbability: 0.02,
        vpnUsage: false
      },
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    };

    const biometricVerification: VerificationMethod = {
      id: randomUUID(),
      userId: "demo-user-123",
      type: "biometric_scan",
      status: "completed",
      data: { 
        facialGeometry: "unique-confirmed",
        livenessScore: 0.98,
        duplicateCheck: "no-matches-found",
        qualityScore: 0.95,
        ageEstimate: 34,
        genderConsistent: true,
        photosAnalyzed: 3,
        videoLiveness: true,
        deepfakeDetection: "human-confirmed"
      },
      completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 47 * 24 * 60 * 60 * 1000),
    };

    this.verificationMethods.set(professionalNetworkVerification.id, professionalNetworkVerification);
    this.verificationMethods.set(documentAttestationVerification.id, documentAttestationVerification);
    this.verificationMethods.set(socialNetworkVerification.id, socialNetworkVerification);

    // Award badges based on completed verifications
    const professionalBadge = Array.from(this.badges.values()).find(b => b.requirement === "professional_network");
    const documentBadge = Array.from(this.badges.values()).find(b => b.requirement === "document_attestation");
    const socialBadge = Array.from(this.badges.values()).find(b => b.requirement === "social_network_validation");

    if (professionalBadge) {
      const userBadge: UserBadge = {
        id: randomUUID(),
        userId: "demo-user-123",
        badgeId: professionalBadge.id,
        earnedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        mintedAt: null,
        transactionHash: null,
      };
      this.userBadges.set(userBadge.id, userBadge);
    }

    if (documentBadge) {
      const userBadge: UserBadge = {
        id: randomUUID(),
        userId: "demo-user-123",
        badgeId: documentBadge.id,
        earnedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        mintedAt: null,
        transactionHash: null,
      };
      this.userBadges.set(userBadge.id, userBadge);
    }

    if (socialBadge) {
      const userBadge: UserBadge = {
        id: randomUUID(),
        userId: "demo-user-123",
        badgeId: socialBadge.id,
        earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        mintedAt: null,
        transactionHash: null,
      };
      this.userBadges.set(userBadge.id, userBadge);
    }

    // Add demo activities
    const activities: Omit<ActivityLog, 'id' | 'createdAt'>[] = [
      {
        userId: "demo-user-123",
        action: "account_created",
        description: "Account created successfully",
        metadata: { chittyId: demoUser.chittyId },
      },
      {
        userId: "demo-user-123",
        action: "verification_completed",
        description: "Email verification completed",
        metadata: { verificationType: "email" },
      },
      {
        userId: "demo-user-123",
        action: "badge_earned",
        description: 'Earned "Email Pro" badge',
        metadata: { badgeName: "Email Pro" },
      },
      {
        userId: "demo-user-123",
        action: "verification_completed",
        description: "Phone verification completed",
        metadata: { verificationType: "phone" },
      },
      {
        userId: "demo-user-123",
        action: "badge_earned",
        description: 'Earned "Phone Master" badge',
        metadata: { badgeName: "Phone Master" },
      },
      {
        userId: "demo-user-123",
        action: "verification_started",
        description: "Started government_id verification",
        metadata: { verificationType: "government_id" },
      }
    ];

    activities.forEach((activity, index) => {
      const activityLog: ActivityLog = {
        ...activity,
        id: randomUUID(),
        metadata: activity.metadata || null,
        createdAt: new Date(Date.now() - (activities.length - index) * 5 * 24 * 60 * 60 * 1000),
      };
      this.activityLogs.set(activityLog.id, activityLog);
    });
  }

  private generateChittyId(): string {
    const version = "25";
    const type = "P";
    const category = "USR";
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const variant = "V";
    const timestamp = new Date().getMonth().toString().padStart(2, '0');
    const check = Math.floor(Math.random() * 10);
    const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    
    return `${version}-${type}-${category}-${random}-${variant}-${timestamp}-${check}-${suffix}`;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByChittyId(chittyId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.chittyId === chittyId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const chittyId = this.generateChittyId();
    const user: User = { 
      id, 
      username: insertUser.username,
      password: insertUser.password,
      chittyId,
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      fullName: insertUser.fullName || null,
      avatar: null,
      trustLevel: 1,
      trustScore: 100,
      createdAt: new Date(),
    };
    this.users.set(id, user);

    // Award early adopter badge
    const earlyAdopterBadge = Array.from(this.badges.values()).find(b => b.requirement === "early_adopter");
    if (earlyAdopterBadge) {
      await this.awardBadge(id, earlyAdopterBadge.id);
    }

    await this.createActivityLog({
      userId: id,
      action: "account_created",
      description: "Account created successfully",
      metadata: { chittyId },
    });

    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getVerificationMethods(userId: string): Promise<VerificationMethod[]> {
    return Array.from(this.verificationMethods.values())
      .filter(vm => vm.userId === userId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createVerificationMethod(verification: InsertVerification): Promise<VerificationMethod> {
    const id = randomUUID();
    const method: VerificationMethod = {
      id,
      userId: verification.userId,
      type: verification.type,
      data: verification.data || null,
      status: "pending",
      completedAt: null,
      createdAt: new Date(),
    };
    this.verificationMethods.set(id, method);

    await this.createActivityLog({
      userId: verification.userId,
      action: "verification_started",
      description: `Started ${verification.type} verification`,
      metadata: { verificationType: verification.type },
    });

    return method;
  }

  async updateVerificationMethod(id: string, updates: Partial<VerificationMethod>): Promise<VerificationMethod> {
    const method = this.verificationMethods.get(id);
    if (!method) throw new Error("Verification method not found");
    
    const updatedMethod = { ...method, ...updates };
    if (updates.status === "completed") {
      updatedMethod.completedAt = new Date();
    }
    this.verificationMethods.set(id, updatedMethod);

    // Award badges and update trust score
    if (updates.status === "completed") {
      await this.handleVerificationCompletion(method.userId, method.type);
    }

    return updatedMethod;
  }

  private async handleVerificationCompletion(userId: string, type: string) {
    const badgeMap: Record<string, string> = {
      email: "email_verified",
      phone: "phone_verified",
      government_id: "government_id_verified",
      biometric: "biometric_verified",
    };

    const requirement = badgeMap[type];
    if (requirement) {
      const badge = Array.from(this.badges.values()).find(b => b.requirement === requirement);
      if (badge) {
        await this.awardBadge(userId, badge.id);
      }
    }

    // Update trust score and level
    const user = await this.getUser(userId);
    if (user) {
      const scoreIncrease = type === "biometric" ? 100 : type === "government_id" ? 80 : 50;
      const currentScore = user.trustScore || 0;
      const newScore = Math.min(1000, currentScore + scoreIncrease);
      const newLevel = Math.min(5, Math.floor(newScore / 200) + 1);
      
      await this.updateUser(userId, { 
        trustScore: newScore, 
        trustLevel: newLevel 
      });
    }

    await this.createActivityLog({
      userId,
      action: "verification_completed",
      description: `${type} verification completed`,
      metadata: { verificationType: type },
    });
  }

  async getAllBadges(): Promise<Badge[]> {
    return Array.from(this.badges.values());
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    const userBadges = Array.from(this.userBadges.values())
      .filter(ub => ub.userId === userId);
    
    return userBadges.map(ub => {
      const badge = this.badges.get(ub.badgeId)!;
      return { ...ub, badge };
    });
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    // Check if badge already awarded
    const existing = Array.from(this.userBadges.values())
      .find(ub => ub.userId === userId && ub.badgeId === badgeId);
    
    if (existing) return existing;

    const id = randomUUID();
    const userBadge: UserBadge = {
      id,
      userId,
      badgeId,
      earnedAt: new Date(),
      mintedAt: null,
      transactionHash: null,
    };
    this.userBadges.set(id, userBadge);

    const badge = this.badges.get(badgeId);
    await this.createActivityLog({
      userId,
      action: "badge_earned",
      description: `Earned "${badge?.name}" badge`,
      metadata: { badgeId, badgeName: badge?.name },
    });

    return userBadge;
  }

  async getActivityLogs(userId: string, limit = 10): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const activityLog: ActivityLog = {
      ...log,
      id,
      metadata: log.metadata || null,
      createdAt: new Date(),
    };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }

  async createIdentityShare(userId: string, isPublic: boolean, expiresAt?: Date): Promise<IdentityShare> {
    const id = randomUUID();
    const shareToken = randomUUID();
    const share: IdentityShare = {
      id,
      userId,
      shareToken,
      isPublic,
      expiresAt: expiresAt || null,
      createdAt: new Date(),
    };
    this.identityShares.set(id, share);

    await this.createActivityLog({
      userId,
      action: "identity_shared",
      description: "Created identity share link",
      metadata: { isPublic, shareToken },
    });

    return share;
  }

  async getIdentityShare(shareToken: string): Promise<(IdentityShare & { user: User }) | undefined> {
    const share = Array.from(this.identityShares.values())
      .find(s => s.shareToken === shareToken);
    
    if (!share) return undefined;
    
    // Check if expired
    if (share.expiresAt && share.expiresAt < new Date()) {
      return undefined;
    }

    const user = this.users.get(share.userId);
    if (!user) return undefined;

    return { ...share, user };
  }

  async getNetworkStats(): Promise<{
    activeUsers: number;
    verificationsToday: number;
    trustTransactions: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const verificationsToday = Array.from(this.verificationMethods.values())
      .filter(vm => vm.completedAt && vm.completedAt >= today).length;

    return {
      activeUsers: 24573, // Simulated network stat
      verificationsToday: verificationsToday + 15800, // Add to simulated base
      trustTransactions: 892000, // Simulated
    };
  }

  // Blockchain Verification Methods
  async createBlockchainVerification(data: Omit<BlockchainVerification, 'id' | 'createdAt'>): Promise<BlockchainVerification> {
    const id = randomUUID();
    const verification: BlockchainVerification = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.blockchainVerifications.set(id, verification);

    // Create verification method record
    await this.createVerificationMethod({
      userId: data.userId,
      type: "blockchain",
      data: { walletAddress: data.walletAddress, chainId: data.chainId },
    });

    // Award blockchain badge if verified
    if (data.verified) {
      const blockchainBadge = Array.from(this.badges.values()).find(b => b.requirement === "blockchain_verified");
      if (blockchainBadge) {
        await this.awardBadge(data.userId, blockchainBadge.id);
      }
    }

    return verification;
  }

  async getBlockchainVerifications(userId: string): Promise<BlockchainVerification[]> {
    return Array.from(this.blockchainVerifications.values())
      .filter(bv => bv.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async verifyBlockchainAddress(walletAddress: string, signature: string): Promise<boolean> {
    // Simulate blockchain signature verification
    // In production, this would verify the signature against the wallet address
    return signature.length > 0 && walletAddress.startsWith("0x");
  }

  // Social Endorsement Methods
  async createEndorsement(data: Omit<SocialEndorsement, 'id' | 'createdAt'>): Promise<SocialEndorsement> {
    const id = randomUUID();
    const endorsement: SocialEndorsement = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.socialEndorsements.set(id, endorsement);

    // Update trust score for endorsed user
    const endorsedUser = await this.getUser(data.endorsedId);
    if (endorsedUser) {
      const newTrustScore = (endorsedUser.trustScore || 0) + (data.trustWeight || 1) * 10;
      await this.updateUser(data.endorsedId, { trustScore: newTrustScore });
    }

    // Check if user qualifies for community endorsed badge
    const endorsements = await this.getEndorsementsFor(data.endorsedId);
    if (endorsements.length >= 5) {
      const socialBadge = Array.from(this.badges.values()).find(b => b.requirement === "social_endorsed");
      if (socialBadge) {
        await this.awardBadge(data.endorsedId, socialBadge.id);
      }
    }

    await this.createActivityLog({
      userId: data.endorsedId,
      action: "endorsement_received",
      description: `Received ${data.endorsementType} endorsement`,
      metadata: { endorserId: data.endorserId, type: data.endorsementType },
    });

    return endorsement;
  }

  async getEndorsementsFor(userId: string): Promise<SocialEndorsement[]> {
    return Array.from(this.socialEndorsements.values())
      .filter(se => se.endorsedId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getEndorsementsBy(userId: string): Promise<SocialEndorsement[]> {
    return Array.from(this.socialEndorsements.values())
      .filter(se => se.endorserId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  // Biometric Methods
  async createBiometricRecord(data: Omit<BiometricData, 'id' | 'createdAt'>): Promise<BiometricData> {
    const id = randomUUID();
    const biometric: BiometricData = {
      ...data,
      id,
      createdAt: new Date(),
    };
    this.biometricData.set(id, biometric);

    // Create verification method record
    await this.createVerificationMethod({
      userId: data.userId,
      type: "biometric",
      data: { type: data.biometricType, provider: data.provider },
    });

    // Award biometric badge if verified
    if (data.verified) {
      const biometricBadge = Array.from(this.badges.values()).find(b => b.requirement === "biometric_verified");
      if (biometricBadge) {
        await this.awardBadge(data.userId, biometricBadge.id);
      }
    }

    return biometric;
  }

  async getBiometricData(userId: string): Promise<BiometricData[]> {
    return Array.from(this.biometricData.values())
      .filter(bd => bd.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async verifyBiometric(userId: string, templateData: string, type: string): Promise<boolean> {
    // Simulate biometric verification
    // In production, this would compare against stored biometric templates
    const existingBiometric = Array.from(this.biometricData.values())
      .find(bd => bd.userId === userId && bd.biometricType === type);
    
    if (existingBiometric) {
      // Simulate template matching
      return templateData.length > 0;
    }
    
    return false;
  }
}

export const storage = new MemStorage();
