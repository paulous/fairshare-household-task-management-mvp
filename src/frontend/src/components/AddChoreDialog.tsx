import { useState } from 'react';
import { House } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { useAddChore } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface AddChoreDialogProps {
  houseId: Principal;
  house: House;
}

const FREQUENCIES = ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'One-time'];

export default function AddChoreDialog({ houseId, house }: AddChoreDialogProps) {
  const [open, setOpen] = useState(false);
  const [choreName, setChoreName] = useState('');
  const [choreValue, setChoreValue] = useState('');
  const [frequency, setFrequency] = useState('Weekly');
  const [assignee, setAssignee] = useState('');
  const addChore = useAddChore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valueInCents = Math.round(parseFloat(choreValue) * 100);
    await addChore.mutateAsync({
      houseId,
      chore: {
        name: choreName.trim(),
        value: BigInt(valueInCents),
        frequency,
        assignee: Principal.fromText(assignee),
      },
    });
    setChoreName('');
    setChoreValue('');
    setFrequency('Weekly');
    setAssignee('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Chore
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Chore</DialogTitle>
          <DialogDescription>Create a new task for your household</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="choreName">Chore Name</Label>
            <Input
              id="choreName"
              value={choreName}
              onChange={(e) => setChoreName(e.target.value)}
              placeholder="e.g., Wash dishes"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="choreValue">Value ({house.currency})</Label>
            <Input
              id="choreValue"
              type="number"
              step="0.01"
              min="0"
              value={choreValue}
              onChange={(e) => setChoreValue(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {freq}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignee">Assign To</Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Select a housemate" />
              </SelectTrigger>
              <SelectContent>
                {house.members.map((member) => (
                  <SelectItem key={member.toString()} value={member.toString()}>
                    {member.toString().slice(0, 20)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={addChore.isPending || !choreName.trim() || !choreValue || !assignee}>
            {addChore.isPending ? 'Adding...' : 'Add Chore'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
