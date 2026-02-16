import { useState } from 'react';
import { House } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { useAddHousemate, useRemoveHousemate } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ManageHousematesDialogProps {
  houseId: Principal;
  house: House;
}

export default function ManageHousematesDialog({ houseId, house }: ManageHousematesDialogProps) {
  const [open, setOpen] = useState(false);
  const [principalId, setPrincipalId] = useState('');
  const addHousemate = useAddHousemate();
  const removeHousemate = useRemoveHousemate();

  const handleAddHousemate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const principal = Principal.fromText(principalId.trim());
      await addHousemate.mutateAsync({ houseId, member: principal });
      setPrincipalId('');
    } catch (error) {
      toast.error('Invalid Principal ID format');
    }
  };

  const handleRemoveHousemate = async (member: Principal) => {
    if (member.toString() === house.admin.toString()) {
      toast.error('Cannot remove the house admin');
      return;
    }
    await removeHousemate.mutateAsync({ houseId, member });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Manage Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Housemates</DialogTitle>
          <DialogDescription>Add or remove members from your house</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <form onSubmit={handleAddHousemate} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="principalId">Add Housemate (Principal ID)</Label>
              <Input
                id="principalId"
                value={principalId}
                onChange={(e) => setPrincipalId(e.target.value)}
                placeholder="Enter Principal ID"
              />
            </div>
            <Button type="submit" className="w-full" disabled={addHousemate.isPending || !principalId.trim()}>
              {addHousemate.isPending ? 'Adding...' : 'Add Housemate'}
            </Button>
          </form>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Current Members</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {house.members.map((member) => (
                <div key={member.toString()} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm truncate flex-1">{member.toString().slice(0, 20)}...</span>
                  {member.toString() !== house.admin.toString() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHousemate(member)}
                      disabled={removeHousemate.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
