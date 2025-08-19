import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Badge as BadgeType, VerificationMethod } from '@shared/schema';

interface AchievementSystemProps {
  user: User;
  badges: BadgeType[];
  verifications: VerificationMethod[];
}

export default function AchievementSystem({ user, badges, verifications }: AchievementSystemProps) {

  // Define achievement categories and milestones
  const achievementCategories = {
    verification: {
      name: "Verification Master",
      icon: "fas fa-shield-check",
      color: "emerald",
      milestones: [
        { threshold: 1, title: "First Steps", reward: "50 XP", unlocked: verifications.length >= 1 },
        { threshold: 3, title: "Getting Serious", reward: "150 XP", unlocked: verifications.length >= 3 },
        { threshold: 5, title: "Trust Builder", reward: "300 XP", unlocked: verifications.length >= 5 },
        { threshold: 8, title: "Identity Expert", reward: "500 XP", unlocked: verifications.length >= 8 },
        { threshold: 10, title: "Verification Legend", reward: "1000 XP", unlocked: verifications.length >= 10 }
      ]
    },
    network: {
      name: "Network Builder",
      icon: "fas fa-users",
      color: "blue",
      milestones: [
        { threshold: 1, title: "First Connection", reward: "75 XP", unlocked: getNetworkSize() >= 1 },
        { threshold: 5, title: "Small Circle", reward: "200 XP", unlocked: getNetworkSize() >= 5 },
        { threshold: 15, title: "Growing Network", reward: "400 XP", unlocked: getNetworkSize() >= 15 },
        { threshold: 50, title: "Well Connected", reward: "800 XP", unlocked: getNetworkSize() >= 50 },
        { threshold: 100, title: "Network Master", reward: "1500 XP", unlocked: getNetworkSize() >= 100 }
      ]
    },
    trust: {
      name: "Trust Authority",
      icon: "fas fa-crown",
      color: "gold",
      milestones: [
        { threshold: 100, title: "Trusted Newcomer", reward: "Trust Badge", unlocked: (user.trustScore || 0) >= 100 },
        { threshold: 300, title: "Reliable Member", reward: "Reliability Badge", unlocked: (user.trustScore || 0) >= 300 },
        { threshold: 500, title: "Trust Expert", reward: "Expert Badge", unlocked: (user.trustScore || 0) >= 500 },
        { threshold: 750, title: "Trust Master", reward: "Master Badge", unlocked: (user.trustScore || 0) >= 750 },
        { threshold: 900, title: "Trust Legend", reward: "Legend Badge", unlocked: (user.trustScore || 0) >= 900 }
      ]
    },
    social: {
      name: "Social Validator",
      icon: "fas fa-handshake",
      color: "purple",
      milestones: [
        { threshold: 1, title: "First Endorser", reward: "Social Badge", unlocked: getEndorserCount() >= 1 },
        { threshold: 3, title: "Vouched For", reward: "Vouched Badge", unlocked: getEndorserCount() >= 3 },
        { threshold: 5, title: "Well Regarded", reward: "Regard Badge", unlocked: getEndorserCount() >= 5 },
        { threshold: 10, title: "Community Trusted", reward: "Community Badge", unlocked: getEndorserCount() >= 10 },
        { threshold: 20, title: "Social Authority", reward: "Authority Badge", unlocked: getEndorserCount() >= 20 }
      ]
    }
  };

  // Streak system for engagement
  const getVerificationStreak = () => {
    const sortedVerifications = verifications
      .filter(v => v.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

    let streak = 0;
    let lastDate = new Date();
    
    for (const verification of sortedVerifications) {
      const verificationDate = new Date(verification.completedAt!);
      const daysDiff = Math.floor((lastDate.getTime() - verificationDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) { // Within a week
        streak++;
        lastDate = verificationDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  function getNetworkSize() {
    const professionalNetwork = verifications.find(v => v.type === "professional_network")?.data as any;
    const socialNetwork = verifications.find(v => v.type === "social_network_validation")?.data as any;
    
    let networkSize = 0;
    if (professionalNetwork) {
      networkSize += professionalNetwork.linkedinConnections || 0;
      networkSize += (professionalNetwork.mutualConnections || 0) * 2; // Weight mutual connections more
    }
    if (socialNetwork) {
      networkSize += (socialNetwork.trustedEndorsers?.length || 0) * 5; // Weight endorsers heavily
    }
    
    return networkSize;
  }

  function getEndorserCount() {
    const socialNetwork = verifications.find(v => v.type === "social_network_validation")?.data as any;
    return socialNetwork?.trustedEndorsers?.length || 0;
  }

  const streak = getVerificationStreak();

  // Calculate overall completion percentage
  const calculateOverallProgress = () => {
    let totalMilestones = 0;
    let completedMilestones = 0;
    
    Object.values(achievementCategories).forEach(category => {
      totalMilestones += category.milestones.length;
      completedMilestones += category.milestones.filter(m => m.unlocked).length;
    });
    
    return Math.round((completedMilestones / totalMilestones) * 100);
  };

  const overallProgress = calculateOverallProgress();

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      gold: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      purple: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    };
    return colorMap[color] || "text-gray-400 bg-gray-500/10 border-gray-500/20";
  };

  return (
    <Card className="bg-card border-border" data-testid="card-achievement-system">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-trophy text-gold-400"></i>
            <span>Achievement System</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-mono">
              {overallProgress}% Complete
            </Badge>
            {streak > 0 && (
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                <i className="fas fa-fire mr-1"></i>
                {streak} streak
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(achievementCategories).map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                <i className={`${category.icon} mr-1`}></i>
                {category.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(achievementCategories).map(([key, category]) => (
            <TabsContent key={key} value={key} className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center">
                  <i className={`${category.icon} mr-2 ${getColorClasses(category.color).split(' ')[0]}`}></i>
                  {category.name}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {category.milestones.filter(m => m.unlocked).length}/{category.milestones.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {category.milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      milestone.unlocked 
                        ? getColorClasses(category.color)
                        : "border-gray-500/20 bg-gray-500/5"
                    }`}
                    data-testid={`milestone-${key}-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          milestone.unlocked 
                            ? getColorClasses(category.color).replace('text-', 'bg-').replace('bg-', 'bg-').replace('/10', '/20')
                            : "bg-gray-500/20"
                        }`}>
                          <i className={`fas ${
                            milestone.unlocked ? 'fa-check' : 'fa-lock'
                          } text-sm ${milestone.unlocked ? 'text-white' : 'text-gray-500'}`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{milestone.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Threshold: {milestone.threshold} {key === 'trust' ? 'trust score' : key === 'verification' ? 'verifications' : key === 'network' ? 'network size' : 'endorsers'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={milestone.unlocked ? "default" : "outline"}
                          className="text-xs"
                        >
                          {milestone.reward}
                        </Badge>
                        {milestone.unlocked && (
                          <p className="text-xs text-muted-foreground mt-1">Unlocked!</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Weekly Challenges */}
        <div className="mt-6 p-4 bg-gradient-to-r from-electric-blue-500/10 to-mint-green-500/10 rounded-lg border border-electric-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center">
              <i className="fas fa-calendar-week mr-2 text-electric-blue-400"></i>
              Weekly Challenge
            </h4>
            <Badge variant="outline" className="text-xs bg-electric-blue-500/10">
              5 days left
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Complete 2 network validations to earn bonus XP and unlock exclusive badges
          </p>
          <div className="flex items-center justify-between">
            <Progress value={33} className="flex-1 h-2 mr-3" />
            <span className="text-xs font-mono">1/3</span>
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span className="text-muted-foreground">Reward: 500 XP + Challenger Badge</span>
            <span className="text-electric-blue-400">+2 Trust Levels</span>
          </div>
        </div>

        {/* Level Up Incentive */}
        {(user.trustLevel || 1) < 10 && (
          <div className="mt-4 text-center p-4 bg-gradient-to-r from-mint-green-500/10 to-electric-blue-500/10 rounded-lg border border-mint-green-500/20">
            <i className="fas fa-arrow-up text-mint-green-400 text-2xl mb-2"></i>
            <p className="font-medium text-sm mb-1">Next Level Benefits</p>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock advanced verification methods, premium features, and exclusive network access
            </p>
            <Button size="sm" className="bg-mint-green-500 hover:bg-mint-green-600">
              <i className="fas fa-rocket mr-2"></i>
              Level Up Guide
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}