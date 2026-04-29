import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/users";
import CommonTypes "../types/common";

module {
  // 30 days in nanoseconds (30 * 24 * 3600 * 1_000_000_000)
  let TRIAL_DURATION_NS : Int = 2_592_000_000_000_000;

  public func register(
    users : List.List<Types.User>,
    id : Principal,
    req : Types.RegisterUserRequest,
  ) : Types.UserPublic {
    let dietType : Types.DietType = switch (req.diet_type) {
      case (?dt) { dt };
      case null { #non_veg };
    };
    let user : Types.User = {
      id;
      var name = req.name;
      var email = req.email;
      var goal = req.goal;
      var height = req.height;
      var weight = req.weight;
      var age = req.age;
      var activity_level = req.activity_level;
      var dietary_preference = req.dietary_preference;
      var diet_type = dietType;
      var lifestyle_description = req.lifestyle_description;
      created_at = Time.now();
      var subscription_plan = #free;
      var plan_status = #trial;
      var trial_start_date = ?Time.now();
      var balance = 0.0;
    };
    users.add(user);
    toPublic(user);
  };

  public func getById(
    users : List.List<Types.User>,
    id : Principal,
  ) : ?Types.UserPublic {
    switch (users.find(func(u : Types.User) : Bool = u.id == id)) {
      case (?u) { ?toPublic(u) };
      case null { null };
    };
  };

  public func update(
    users : List.List<Types.User>,
    id : Principal,
    req : Types.UpdateUserRequest,
  ) : ?Types.UserPublic {
    switch (users.find(func(u : Types.User) : Bool = u.id == id)) {
      case (?u) {
        switch (req.name) { case (?n) { u.name := n }; case null {} };
        switch (req.email) { case (?e) { u.email := e }; case null {} };
        switch (req.goal) { case (?g) { u.goal := ?g }; case null {} };
        switch (req.height) { case (?h) { u.height := ?h }; case null {} };
        switch (req.weight) { case (?w) { u.weight := ?w }; case null {} };
        switch (req.age) { case (?a) { u.age := a }; case null {} };
        switch (req.activity_level) { case (?al) { u.activity_level := al }; case null {} };
        switch (req.dietary_preference) { case (?dp) { u.dietary_preference := dp }; case null {} };
        switch (req.diet_type) { case (?dt) { u.diet_type := dt }; case null {} };
        switch (req.lifestyle_description) { case (?ld) { u.lifestyle_description := ?ld }; case null {} };
        ?toPublic(u);
      };
      case null { null };
    };
  };

  public func setPlan(
    users : List.List<Types.User>,
    id : Principal,
    plan : CommonTypes.SubscriptionPlan,
  ) : Bool {
    switch (users.find(func(u : Types.User) : Bool = u.id == id)) {
      case (?u) { u.subscription_plan := plan; true };
      case null { false };
    };
  };

  public func toPublic(user : Types.User) : Types.UserPublic {
    {
      id = user.id;
      name = user.name;
      email = user.email;
      goal = user.goal;
      height = user.height;
      weight = user.weight;
      age = user.age;
      activity_level = user.activity_level;
      dietary_preference = user.dietary_preference;
      diet_type = user.diet_type;
      lifestyle_description = user.lifestyle_description;
      created_at = user.created_at;
      subscription_plan = user.subscription_plan;
      plan_status = user.plan_status;
      trial_start_date = user.trial_start_date;
      balance = user.balance;
    };
  };

  /// Returns true if the user's 30-day trial has expired.
  public func isTrialExpired(user : Types.User) : Bool {
    if (user.plan_status != #trial) { return false };
    switch (user.trial_start_date) {
      case null { false };
      case (?start) { Time.now() - start > TRIAL_DURATION_NS };
    };
  };

  public func count(users : List.List<Types.User>) : Nat {
    users.size();
  };

  public func countPremium(users : List.List<Types.User>) : Nat {
    users.foldLeft<Nat, Types.User>(
      0,
      func(acc, u) {
        switch (u.subscription_plan) { case (#premium) { acc + 1 }; case _ { acc } };
      },
    );
  };

  public func exists(users : List.List<Types.User>, id : Principal) : Bool {
    switch (users.find(func(u : Types.User) : Bool = u.id == id)) {
      case (?_) { true };
      case null { false };
    };
  };
};
