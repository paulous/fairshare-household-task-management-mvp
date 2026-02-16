import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HouseholdTask {
    status: string;
    reward: bigint;
    assignedTo?: Principal;
    isRecurring: boolean;
    deadline?: string;
    taskName: string;
}
export interface UserProfile {
    name: string;
    houseId?: Principal;
}
export interface Transaction {
    user: Principal;
    description: string;
    timestamp: Time;
    amount: bigint;
}
export type Time = bigint;
export interface Chore {
    assignee: Principal;
    value: bigint;
    name: string;
    frequency: string;
}
export interface House {
    members: Array<Principal>;
    admin: Principal;
    name: string;
    currency: string;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addChore(houseId: Principal, chore: Chore): Promise<void>;
    addHousemate(houseId: Principal, member: Principal): Promise<void>;
    addTask(task: HouseholdTask): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeChore(houseId: Principal, choreName: string): Promise<void>;
    createHouse(name: string, currency: string): Promise<Principal>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllTasks(): Promise<Array<HouseholdTask>>;
    getBalance(user: Principal): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChores(houseId: Principal): Promise<Array<Chore>>;
    getHouse(houseId: Principal): Promise<House | null>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getTransactionHistory(user: Principal): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    markTaskComplete(taskId: Principal): Promise<void>;
    removeHousemate(houseId: Principal, member: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    settleBalances(houseId: Principal): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    swapChore(houseId: Principal, choreName: string, newAssignee: Principal): Promise<void>;
    updateChore(houseId: Principal, choreName: string, newValue: bigint): Promise<void>;
}
