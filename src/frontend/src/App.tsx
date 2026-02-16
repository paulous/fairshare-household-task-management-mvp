import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import HomePage from './pages/HomePage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    } else {
      setShowProfileSetup(false);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  const handleProfileSave = async (name: string) => {
    await saveProfile.mutateAsync({ name, houseId: undefined });
    setShowProfileSetup(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading FairShare...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          {isAuthenticated && userProfile ? (
            <HomePage userProfile={userProfile} />
          ) : (
            <div className="max-w-2xl mx-auto text-center py-20">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome to FairShare
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Manage household tasks and track balances fairly among housemates
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h3 className="font-semibold mb-2">Create Your House</h3>
                  <p className="text-sm text-muted-foreground">Set up your household with a name and currency</p>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="font-semibold mb-2">Manage Chores</h3>
                  <p className="text-sm text-muted-foreground">Assign tasks, set values, and track completion</p>
                </div>
                <div className="p-6 rounded-lg bg-card border border-border">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="font-semibold mb-2">Track Balances</h3>
                  <p className="text-sm text-muted-foreground">Keep fair ledgers and settle up easily</p>
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
        <ProfileSetupModal
          open={showProfileSetup}
          onSave={handleProfileSave}
          isSaving={saveProfile.isPending}
        />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
