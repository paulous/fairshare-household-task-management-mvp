import { useState } from 'react';
import { House } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { useSwapChore } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw } from 'lucide-react';

interface SwapChoreDialogProps {
  houseId: Principal;
  choreName: string;
  house: House;
}

export default function SwapChoreDialog({ houseId, choreName, house }: SwapChoreDialogProps) {
  const [open, setOpen] = useState(false);
  const [newAssignee, setNewAssignee] = useState('');
  const swapChore = useSwapChore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await swapChore.mutateAsync({
      houseId,
      choreName,
      newAssignee: Principal.fromText(newAssignee),
    });
    setNewAssignee('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Chore Assignment</DialogTitle>
          <DialogDescription>Reassign "{choreName}" to a different housemate</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newAssignee">Assign To</Label>
            <Select value={newAssignee} onValueChange={setNewAssignee}>
              <SelectTrigger id="newAssignee">
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
          <Button type="submit" className="w-full" disabled={swapChore.isPending || !newAssignee}>
            {swapChore.isPending ? 'Swapping...' : 'Swap Assignment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
