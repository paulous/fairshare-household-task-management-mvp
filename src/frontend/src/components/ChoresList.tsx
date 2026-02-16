import { House } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { useGetChores, useCompleteChore, useSwapChore } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import AddChoreDialog from './AddChoreDialog';
import EditChoreDialog from './EditChoreDialog';
import SwapChoreDialog from './SwapChoreDialog';

interface ChoresListProps {
  houseId: Principal;
  house: House;
  isAdmin: boolean;
}

export default function ChoresList({ houseId, house, isAdmin }: ChoresListProps) {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const { data: chores, isLoading } = useGetChores(houseId);
  const completeChore = useCompleteChore();

  const handleCompleteChore = async (choreName: string) => {
    await completeChore.mutateAsync({ houseId, choreName });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Chores</CardTitle>
            <CardDescription>Manage and complete household tasks</CardDescription>
          </div>
          {isAdmin && <AddChoreDialog houseId={houseId} house={house} />}
        </div>
      </CardHeader>
      <CardContent>
        {!chores || chores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No chores yet. Add your first chore to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chores.map((chore) => {
              const isAssignedToMe = chore.assignee.toString() === currentUserPrincipal?.toString();
              const valueFormatted = (Number(chore.value) / 100).toFixed(2);

              return (
                <div
                  key={chore.name}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{chore.name}</h4>
                      {isAssignedToMe && (
                        <Badge variant="default" className="text-xs">
                          Your Task
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Value: {house.currency} {valueFormatted}</span>
                      <span>•</span>
                      <span>Frequency: {chore.frequency}</span>
                      <span>•</span>
                      <span>Assigned: {chore.assignee.toString().slice(0, 10)}...</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SwapChoreDialog houseId={houseId} choreName={chore.name} house={house} />
                    {isAdmin && <EditChoreDialog houseId={houseId} chore={chore} currency={house.currency} />}
                    {isAssignedToMe && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteChore(chore.name)}
                        disabled={completeChore.isPending}
                        className="gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
