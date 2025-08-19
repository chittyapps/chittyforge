import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ChittyIDGrowthCenter from "@/components/ui/chitty-id-growth-center";
import AchievementSystem from "@/components/ui/achievement-system";
import NetworkValidation from "@/components/ui/network-validation";
import VerificationBadges from "@/components/ui/verification-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock user ID for demo - in a real app this would come from auth context
const DEMO_USER_ID = "demo-user-123";

export default function Dashboard() {

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/user", DEMO_USER_ID, "dashboard"],
    enabled: !!DEMO_USER_ID,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg-950">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <Skeleton className="h-32 w-full bg-dark-bg-800" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full bg-dark-bg-800" />
                <Skeleton className="h-48 w-full bg-dark-bg-800" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-48 w-full bg-dark-bg-800" />
                <Skeleton className="h-64 w-full bg-dark-bg-800" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg-950">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-dark-bg-800 border-red-500/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Dashboard</h2>
                <p className="text-slate-400">Unable to load your ChittyID dashboard. Please try again later.</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-dark-bg-950">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-dark-bg-800 border-slate-700/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
                <p className="text-slate-400 mb-4">Your ChittyID dashboard is not ready yet.</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-electric-blue-500 hover:bg-electric-blue-600"
                  data-testid="button-reload"
                >
                  Reload Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const { user, verifications = [], badges = [], activities = [], networkStats = {} } = data || {};

  return (
    <div className="min-h-screen bg-dark-bg-950">
      <Header user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8 animate-fade-in">
          <div className="bg-gradient-to-r from-electric-blue-600/20 to-mint-green-600/20 rounded-2xl p-6 border border-electric-blue-500/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-2" data-testid="text-welcome">
                  Welcome back, {user.fullName || user.username}!
                </h1>
                <p className="text-slate-400">
                  Your ChittyID: <span className="text-electric-blue-400 font-mono" data-testid="text-chitty-id">{user.chittyId}</span>
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-mint-green-400" data-testid="text-trust-level">
                    L{user.trustLevel}
                  </div>
                  <div className="text-xs text-slate-400">Trust Level</div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeDasharray={`${Math.min(user.trustScore / 10, 100)}, 100`}
                      className="animate-pulse-slow"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold" data-testid="text-trust-percentage">
                      {Math.min(Math.round(user.trustScore / 10), 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ChittyID Growth Center - Primary Focus */}
        <section className="mb-8">
          <ChittyIDGrowthCenter user={user} badges={badges} verifications={verifications} />
        </section>

        {/* Gamified Experience Tabs */}
        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements" className="flex items-center space-x-2">
              <i className="fas fa-trophy"></i>
              <span>Achievements</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center space-x-2">
              <i className="fas fa-users-cog"></i>
              <span>Network</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center space-x-2">
              <i className="fas fa-shield-check"></i>
              <span>Badges</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="achievements" className="mt-6">
            <AchievementSystem user={user} badges={badges} verifications={verifications} />
          </TabsContent>
          
          <TabsContent value="network" className="mt-6">
            <NetworkValidation verifications={verifications} />
          </TabsContent>
          
          <TabsContent value="badges" className="mt-6">
            <VerificationBadges badges={badges} verifications={verifications} />
          </TabsContent>
        </Tabs>
      </main>


    </div>
  );
}
