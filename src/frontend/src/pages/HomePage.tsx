import { useState, useEffect } from 'react';
import { UserProfile } from '../backend';
import { useGetHouse, useIsCallerAdmin } from '../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';
import CreateHouseForm from '../components/CreateHouseForm';
import HouseOverview from '../components/HouseOverview';
import ChoresList from '../components/ChoresList';
import LedgerView from '../components/LedgerView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, ListChecks, Wallet } from 'lucide-react';

interface HomePageProps {
  userProfile: UserProfile;
}

export default function HomePage({ userProfile }: HomePageProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: house, isLoading: houseLoading } = useGetHouse(userProfile.houseId);
  const { data: isAdmin } = useIsCallerAdmin();

  // Reset to overview tab when house is first created or changes
  useEffect(() => {
    if (userProfile.houseId && house) {
      setActiveTab('overview');
    }
  }, [userProfile.houseId, house]);

  if (!userProfile.houseId) {
    return <CreateHouseForm />;
  }

  if (houseLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your house...</p>
        </div>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">House not found. Please create a new house.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {userProfile.name}!</h2>
        <p className="text-muted-foreground">Manage your household tasks and balances</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <Home className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="chores" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Chores
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-2">
            <Wallet className="w-4 h-4" />
            Ledger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <HouseOverview house={house} houseId={userProfile.houseId!} isAdmin={isAdmin || false} />
        </TabsContent>

        <TabsContent value="chores" className="space-y-6">
          <ChoresList houseId={userProfile.houseId!} house={house} isAdmin={isAdmin || false} />
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6">
          <LedgerView houseId={userProfile.houseId!} house={house} isAdmin={isAdmin || false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
