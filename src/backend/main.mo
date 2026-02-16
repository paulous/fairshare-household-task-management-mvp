import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

actor {
  type House = {
    name : Text;
    currency : Text;
    admin : Principal;
    members : [Principal];
  };

  module House {
    public func compare(house1 : House, house2 : House) : Order.Order {
      Text.compare(house1.name, house2.name);
    };
  };

  type Chore = {
    name : Text;
    value : Int;
    frequency : Text;
    assignee : Principal;
  };

  module Chore {
    public func compare(chore1 : Chore, chore2 : Chore) : Order.Order {
      Text.compare(chore1.name, chore2.name);
    };
  };

  type Transaction = {
    user : Principal;
    amount : Int;
    description : Text;
    timestamp : Time.Time;
  };

  module Transaction {
    public func compare(transaction1 : Transaction, transaction2 : Transaction) : Order.Order {
      if (transaction1.timestamp < transaction2.timestamp) { return #less };
      if (transaction1.timestamp > transaction2.timestamp) { return #greater };
      #equal;
    };
  };

  type HouseholdTask = {
    taskName : Text;
    assignedTo : ?Principal;
    status : Text;
    reward : Nat;
    deadline : ?Text;
    isRecurring : Bool;
  };

  module HouseholdTask {
    public func compare(task1 : HouseholdTask, task2 : HouseholdTask) : Order.Order {
      switch (Text.compare(task1.taskName, task2.taskName)) {
        case (#equal) {
          if (task1.reward < task2.reward) { return #less };
          if (task1.reward > task2.reward) { return #greater };
          #equal;
        };
        case (order) { order };
      };
    };
  };

  public type UserProfile = {
    name : Text;
    houseId : ?Principal;
  };

  // Data stores
  let houses = Map.empty<Principal, House>();
  let chores = Map.empty<Principal, [Chore]>();
  let transactions = Map.empty<Principal, [Transaction]>();
  let balances = Map.empty<Principal, Int>();
  let householdTasks = Map.empty<Principal, HouseholdTask>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to check if caller is house admin
  private func isHouseAdmin(caller : Principal, houseId : Principal) : Bool {
    switch (houses.get(houseId)) {
      case (null) { false };
      case (?house) { caller == house.admin };
    };
  };

  // Helper function to check if caller is house member
  private func isHouseMember(caller : Principal, houseId : Principal) : Bool {
    switch (houses.get(houseId)) {
      case (null) { false };
      case (?house) {
        house.members.find(func(m) { m == caller }) != null;
      };
    };
  };

  // House Management
  public shared ({ caller }) func createHouse(name : Text, currency : Text) : async Principal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create a house");
    };
    let house : House = {
      name;
      currency;
      admin = caller;
      members = [caller];
    };
    houses.add(caller, house);
    caller;
  };

  public shared ({ caller }) func addHousemate(houseId : Principal, member : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add housemates");
    };
    switch (houses.get(houseId)) {
      case (null) { Runtime.trap("House does not exist") };
      case (?house) {
        if (caller != house.admin) { Runtime.trap("Unauthorized: Only house admin can add members") };
        let updatedMembers = house.members.concat([member]);
        let updatedHouse = {
          name = house.name;
          currency = house.currency;
          admin = house.admin;
          members = updatedMembers;
        };
        houses.add(houseId, updatedHouse);
      };
    };
  };

  public shared ({ caller }) func removeHousemate(houseId : Principal, member : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove housemates");
    };
    switch (houses.get(houseId)) {
      case (null) { Runtime.trap("House does not exist") };
      case (?house) {
        if (caller != house.admin) { Runtime.trap("Unauthorized: Only house admin can remove members") };
        let updatedMembers = house.members.filter(func(m) { m != member });
        let updatedHouse = {
          name = house.name;
          currency = house.currency;
          admin = house.admin;
          members = updatedMembers;
        };
        houses.add(houseId, updatedHouse);
      };
    };
  };

  // Chore Management
  public shared ({ caller }) func addChore(houseId : Principal, chore : Chore) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add chores");
    };
    switch (houses.get(houseId)) {
      case (null) { Runtime.trap("House does not exist") };
      case (?house) {
        if (caller != house.admin) { Runtime.trap("Unauthorized: Only house admin can add chores") };
        let existingChores = switch (chores.get(houseId)) {
          case (null) { [] };
          case (?c) { c };
        };
        chores.add(houseId, existingChores.concat([chore]));
      };
    };
  };

  public shared ({ caller }) func swapChore(houseId : Principal, choreName : Text, newAssignee : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can swap chores");
    };
    if (not isHouseMember(caller, houseId)) {
      Runtime.trap("Unauthorized: Only house members can swap chores");
    };
    switch (chores.get(houseId)) {
      case (null) { Runtime.trap("Chores not found for this house") };
      case (?choreList) {
        let updatedChores = choreList.map(
          func(chore) {
            if (chore.name == choreName) {
              {
                name = chore.name;
                value = chore.value;
                frequency = chore.frequency;
                assignee = newAssignee;
              };
            } else {
              chore;
            };
          }
        );
        chores.add(houseId, updatedChores);
      };
    };
  };

  public shared ({ caller }) func updateChore(houseId : Principal, choreName : Text, newValue : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update chores");
    };
    switch (houses.get(houseId)) {
      case (null) { Runtime.trap("House does not exist") };
      case (?house) {
        if (caller != house.admin) { Runtime.trap("Unauthorized: Only house admin can update chore prices") };
        switch (chores.get(houseId)) {
          case (null) { Runtime.trap("Chores not found for this house") };
          case (?choreList) {
            let updatedChores = choreList.map(
              func(chore) {
                if (chore.name == choreName) {
                  {
                    name = chore.name;
                    value = newValue;
                    frequency = chore.frequency;
                    assignee = chore.assignee;
                  };
                } else {
                  chore;
                };
              }
            );
            chores.add(houseId, updatedChores);
          };
        };
      };
    };
  };

  // Ledger System
  public shared ({ caller }) func completeChore(houseId : Principal, choreName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete chores");
    };
    if (not isHouseMember(caller, houseId)) {
      Runtime.trap("Unauthorized: Only house members can complete chores");
    };
    switch (chores.get(houseId)) {
      case (null) { Runtime.trap("Chores not found for this house") };
      case (?choreList) {
        let completedChore = choreList.filter(func(chore) { chore.name == choreName });
        switch (completedChore.size()) {
          case (0) { Runtime.trap("Chore not found") };
          case (_) {
            let chore = completedChore[0];
            if (chore.assignee != caller) {
              Runtime.trap("Unauthorized: Only the assigned housemate can complete this chore");
            };
            let newTransaction : Transaction = {
              user = caller;
              amount = chore.value;
              description = "Completed chore: " # chore.name;
              timestamp = Time.now();
            };
            let existingTransactions = switch (transactions.get(caller)) {
              case (null) { [] : [Transaction] };
              case (?t) { t };
            };
            transactions.add(caller, existingTransactions.concat([newTransaction]));
            let currentBalance = switch (balances.get(caller)) {
              case (null) { 0 };
              case (?b) { b };
            };
            balances.add(caller, currentBalance + chore.value);
          };
        };
      };
    };
  };

  public shared ({ caller }) func settleBalances(houseId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can settle balances");
    };
    switch (houses.get(houseId)) {
      case (null) { Runtime.trap("House does not exist") };
      case (?house) {
        if (caller != house.admin) { Runtime.trap("Unauthorized: Only house admin can settle balances") };
        for (member in house.members.vals()) {
          transactions.add(member, []);
          balances.add(member, 0);
        };
      };
    };
  };

  public query ({ caller }) func getBalance(user : Principal) : async Int {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view balances");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own balance");
    };
    switch (balances.get(user)) {
      case (null) { 0 };
      case (?balance) { balance };
    };
  };

  public query ({ caller }) func getTransactionHistory(user : Principal) : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view transaction history");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transaction history");
    };
    switch (transactions.get(user)) {
      case (null) { [] };
      case (?t) { t };
    };
  };

  public query ({ caller }) func getHouse(houseId : Principal) : async ?House {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view house information");
    };
    if (not isHouseMember(caller, houseId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only house members can view house information");
    };
    houses.get(houseId);
  };

  public query ({ caller }) func getChores(houseId : Principal) : async [Chore] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view chores");
    };
    if (not isHouseMember(caller, houseId) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only house members can view chores");
    };
    switch (chores.get(houseId)) {
      case (null) { [] };
      case (?c) { c };
    };
  };

  // Household Tasks
  public shared ({ caller }) func addTask(task : HouseholdTask) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };
    householdTasks.add(caller, task);
  };

  public query ({ caller }) func getAllTasks() : async [HouseholdTask] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    householdTasks.values().toArray().sort();
  };

  public shared ({ caller }) func markTaskComplete(taskId : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark tasks complete");
    };
    switch (householdTasks.get(taskId)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        switch (task.assignedTo) {
          case (null) { };
          case (?assignee) {
            if (assignee != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only the assigned user can complete this task");
            };
          };
        };
        let updatedTask = {
          taskName = task.taskName;
          assignedTo = task.assignedTo;
          status = "completed";
          reward = task.reward;
          deadline = task.deadline;
          isRecurring = task.isRecurring;
        };
        householdTasks.add(taskId, updatedTask);
      };
    };
  };

  // Invite Links / RSVP System
  let inviteState = InviteLinksModule.initState();

  // Generate invite code (admin only)
  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  // Submit RSVP (public, but requires valid invite code)
  public func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  // Get all RSVPs (admin only)
  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  // Get all invite codes (admin only)
  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };
};
