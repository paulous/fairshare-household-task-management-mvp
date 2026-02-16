# FairShare   Household Task Management MVP

## Overview
FairShare is a household task-management and internal ledger application that helps housemates organize chores and track financial balances between members.

## Core Features

### House Management
- House Admin can create a house with a name and default currency
- House Admin can invite and remove housemates
- Each house has a shared chore registry and ledger system
- After successful house creation, the user's profile is automatically updated with the new house ID and saved to the backend via `saveCallerUserProfile`
- Automatic redirection to HomePage after successful house creation with loading indicator and success toast message
- React Query caches are refreshed to ensure accurate dashboard data display

### User Roles
- **House Admin**: Can invite/remove members, edit chore prices, and trigger settlement
- **Housemate**: Can view chores, swap assignments, and complete chores

### Chore System
- Shared chore list showing assigned person, monetary value, and frequency
- Housemates can manually swap chore assignments using a simple button interface
- Chores can be marked as completed by assigned housemates
- House Admin can edit chore prices and details

### Ledger System
- Credit/debit tracking system between housemates
- Current balance display for each user
- Transaction history showing all chore completions and adjustments
- Manual settlement system where House Admin can mark balances as paid or make adjustments to bring balances to zero

### Home Screen
- Display user's total balance
- Show assigned chores for the current user
- "Your House" overview with house information and member list

### User Experience
- `CreateHouseForm` triggers automatic navigation to HomePage after successful house creation
- Loading indicator during house creation process
- Success toast message ("House created successfully — welcome home!") confirming house creation and dashboard redirection
- Error handling for failed house creation attempts
- Automatic profile updates via `saveCallerUserProfile` and React Query cache refresh after successful house creation
- Dashboard (HomePage) immediately fetches and displays house data without requiring manual refresh
- Seamless workflow from house creation to dashboard without manual intervention
- App content language: English

## Backend Data Storage
- House information (name, currency, admin, members)
- User profiles and role assignments
- Chore definitions (name, value, frequency, current assignee)
- Ledger transactions (user, amount, description, timestamp)
- Current balances for each housemate

## Backend Operations
- Create and manage houses
- Add/remove housemates
- Create, update, and assign chores
- Record chore completions and update balances
- Process chore swaps between housemates
- Handle settlement adjustments
- Retrieve user balances and transaction history
- Save and update user profiles
