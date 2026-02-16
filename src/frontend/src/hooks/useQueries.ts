import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, House, Chore, Transaction } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

// House Queries
export function useCreateHouse() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, currency }: { name: string; currency: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Create the house
      const houseId = await actor.createHouse(name, currency);
      
      // Get current user profile
      const currentProfile = await actor.getCallerUserProfile();
      if (!currentProfile) {
        throw new Error('User profile not found');
      }
      
      // Update profile with new house ID
      const updatedProfile: UserProfile = {
        name: currentProfile.name,
        houseId: houseId,
      };
      
      // Save updated profile
      await actor.saveCallerUserProfile(updatedProfile);
      
      return houseId;
    },
    onSuccess: async (houseId) => {
      // Invalidate all relevant queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['house', houseId.toString()] });
      await queryClient.invalidateQueries({ queryKey: ['chores', houseId.toString()] });
      await queryClient.invalidateQueries({ queryKey: ['balance'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      
      // Show success message
      toast.success('House created successfully! Welcome to your new dashboard.', {
        duration: 4000,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create house: ${error.message}`);
    },
  });
}

export function useGetHouse(houseId: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<House | null>({
    queryKey: ['house', houseId?.toString()],
    queryFn: async () => {
      if (!actor || !houseId) return null;
      return actor.getHouse(houseId);
    },
    enabled: !!actor && !actorFetching && !!houseId,
  });
}

export function useAddHousemate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ houseId, member }: { houseId: Principal; member: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHousemate(houseId, member);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['house', variables.houseId.toString()] });
      toast.success('Housemate added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add housemate: ${error.message}`);
    },
  });
}

export function useRemoveHousemate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ houseId, member }: { houseId: Principal; member: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeHousemate(houseId, member);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['house', variables.houseId.toString()] });
      toast.success('Housemate removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove housemate: ${error.message}`);
    },
  });
}

// Chore Queries
export function useGetChores(houseId: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Chore[]>({
    queryKey: ['chores', houseId?.toString()],
    queryFn: async () => {
      if (!actor || !houseId) return [];
      return actor.getChores(houseId);
    },
    enabled: !!actor && !actorFetching && !!houseId,
  });
}

export function useAddChore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ houseId, chore }: { houseId: Principal; chore: Chore }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addChore(houseId, chore);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chores', variables.houseId.toString()] });
      toast.success('Chore added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add chore: ${error.message}`);
    },
  });
}

export function useUpdateChore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ houseId, choreName, newValue }: { houseId: Principal; choreName: string; newValue: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateChore(houseId, choreName, newValue);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chores', variables.houseId.toString()] });
      toast.success('Chore updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update chore: ${error.message}`);
    },
  });
}

export function useSwapChore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ houseId, choreName, newAssignee }: { houseId: Principal; choreName: string; newAssignee: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.swapChore(houseId, choreName, newAssignee);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chores', variables.houseId.toString()] });
      toast.success('Chore swapped successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to swap chore: ${error.message}`);
    },
  });
}

export function useCompleteChore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ houseId, choreName }: { houseId: Principal; choreName: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeChore(houseId, choreName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chores', variables.houseId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Chore completed! Balance updated.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to complete chore: ${error.message}`);
    },
  });
}

// Ledger Queries
export function useGetBalance(user: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['balance', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return BigInt(0);
      return actor.getBalance(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

export function useGetTransactionHistory(user: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      return actor.getTransactionHistory(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

export function useSettleBalances() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (houseId: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.settleBalances(houseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Balances settled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to settle balances: ${error.message}`);
    },
  });
}

// Admin check
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}
