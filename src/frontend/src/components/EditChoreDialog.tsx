import { useState } from 'react';
import { Chore } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { useUpdateChore } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';

interface EditChoreDialogProps {
  houseId: Principal;
  chore: Chore;
  currency: string;
}

export default function EditChoreDialog({ houseId, chore, currency }: EditChoreDialogProps) {
  const [open, setOpen] = useState(false);
  const [newValue, setNewValue] = useState((Number(chore.value) / 100).toFixed(2));
  const updateChore = useUpdateChore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valueInCents = Math.round(parseFloat(newValue) * 100);
    await updateChore.mutateAsync({
      houseId,
      choreName: chore.name,
      newValue: BigInt(valueInCents),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Chore Value</DialogTitle>
          <DialogDescription>Update the value for "{chore.name}"</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newValue">New Value ({currency})</Label>
            <Input
              id="newValue"
              type="number"
              step="0.01"
              min="0"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={updateChore.isPending}>
            {updateChore.isPending ? 'Updating...' : 'Update Value'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
