import { House } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { useGetBalance, useGetChores } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Coins, ListChecks } from 'lucide-react';
import ManageHousematesDialog from './ManageHousematesDialog';

interface HouseOverviewProps {
  house: House;
  houseId: Principal;
  isAdmin: boolean;
}

export default function HouseOverview({ house, houseId, isAdmin }: HouseOverviewProps) {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const { data: balance } = useGetBalance(currentUserPrincipal);
  const { data: chores } = useGetChores(houseId);

  const myChores = chores?.filter((chore) => chore.assignee.toString() === currentUserPrincipal?.toString()) || [];
  const balanceNumber = Number(balance || BigInt(0));
  const balanceFormatted = (balanceNumber / 100).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {house.currency} {balanceFormatted}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {balanceNumber > 0 ? 'You are owed' : balanceNumber < 0 ? 'You owe' : 'All settled up'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Chores</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myChores.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Housemates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{house.members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total members</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{house.name}</CardTitle>
              <CardDescription>House information and members</CardDescription>
            </div>
            {isAdmin && <ManageHousematesDialog houseId={houseId} house={house} />}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Currency</p>
              <Badge variant="secondary">{house.currency}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Members ({house.members.length})</p>
              <div className="space-y-2">
                {house.members.map((member) => (
                  <div
                    key={member.toString()}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.toString().slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.toString().slice(0, 10)}...</p>
                        {member.toString() === house.admin.toString() && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
