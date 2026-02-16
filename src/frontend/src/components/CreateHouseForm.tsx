import { useState } from 'react';
import { useCreateHouse } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'];

export default function CreateHouseForm() {
  const [houseName, setHouseName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const createHouse = useCreateHouse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (houseName.trim()) {
      createHouse.mutate({ name: houseName.trim(), currency });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Your House</CardTitle>
          <CardDescription>Set up your household to start managing tasks and balances</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="houseName">House Name</Label>
              <Input
                id="houseName"
                value={houseName}
                onChange={(e) => setHouseName(e.target.value)}
                placeholder="e.g., The Smith House"
                required
                disabled={createHouse.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select value={currency} onValueChange={setCurrency} disabled={createHouse.isPending}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {createHouse.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createHouse.error?.message || 'Failed to create house. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={createHouse.isPending || !houseName.trim()}>
              {createHouse.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating House...
                </>
              ) : (
                'Create House'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
