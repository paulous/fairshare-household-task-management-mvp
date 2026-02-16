import { House } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { useGetBalance, useGetTransactionHistory, useSettleBalances } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DollarSign, History } from 'lucide-react';

interface LedgerViewProps {
  houseId: Principal;
  house: House;
  isAdmin: boolean;
}

export default function LedgerView({ houseId, house, isAdmin }: LedgerViewProps) {
  const { identity } = useInternetIdentity();
  const currentUserPrincipal = identity?.getPrincipal();
  const { data: balance } = useGetBalance(currentUserPrincipal);
  const { data: transactions, isLoading } = useGetTransactionHistory(currentUserPrincipal);
  const settleBalances = useSettleBalances();

  const balanceNumber = Number(balance || BigInt(0));
  const balanceFormatted = (balanceNumber / 100).toFixed(2);

  const handleSettle = async () => {
    await settleBalances.mutateAsync(houseId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Your Balance
              </CardTitle>
              <CardDescription>Current balance and settlement options</CardDescription>
            </div>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Settle All Balances
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Settle All Balances?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all balances to zero and clear transaction history for all housemates. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSettle} disabled={settleBalances.isPending}>
                      {settleBalances.isPending ? 'Settling...' : 'Settle Balances'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-5xl font-bold mb-2">
              {house.currency} {balanceFormatted}
            </div>
            <Badge variant={balanceNumber > 0 ? 'default' : balanceNumber < 0 ? 'destructive' : 'secondary'}>
              {balanceNumber > 0 ? 'You are owed' : balanceNumber < 0 ? 'You owe' : 'All settled up'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </CardTitle>
          <CardDescription>Your completed chores and balance changes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => {
                  const date = new Date(Number(transaction.timestamp / BigInt(1000000)));
                  const amountFormatted = (Number(transaction.amount) / 100).toFixed(2);
                  return (
                    <TableRow key={index}>
                      <TableCell>{date.toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {house.currency} {amountFormatted}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
