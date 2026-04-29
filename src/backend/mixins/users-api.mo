import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import UserTypes "../types/users";
import AuthTypes "../types/auth";
import UsersLib "../lib/users";
import AuthLib "../lib/auth";

mixin (
  users : List.List<UserTypes.User>,
  credentials : Map.Map<Text, AuthTypes.Credential>,
  sessions : Map.Map<Text, AuthTypes.Session>,
) {

  /// Register a new user with email and password.
  /// Creates a credential record and a user profile, returns a session token.
  public shared func registerUser(req : UserTypes.RegisterUserRequest) : async { #ok : AuthTypes.AuthResponse; #err : Text } {
    let email = req.email.toLower();

    // Email already registered?
    if (credentials.containsKey(email)) {
      return #err("Email already registered — please sign in instead");
    };

    // Derive deterministic Principal from email
    let userId = AuthLib.principalFromEmail(email);

    // Hash password
    let passwordHash = AuthLib.hashPassword(req.password);

    // Store credential
    let cred : AuthTypes.Credential = {
      user_id = userId;
      password_hash = passwordHash;
    };
    credentials.add(email, cred);

    // Create user profile (password is stored in credentials, not in user record)
    ignore UsersLib.register(users, userId, req);

    // Issue session token
    let token = AuthLib.generateSessionToken(email, Time.now());
    let session : AuthTypes.Session = {
      user_id = userId;
      created_at = Time.now();
    };
    sessions.add(token, session);

    #ok({ session_token = token; user_id = userId });
  };

  /// Sign in with email and password. Returns a session token on success.
  public shared func loginUser(email : Text, password : Text) : async { #ok : AuthTypes.AuthResponse; #err : Text } {
    let normalizedEmail = email.toLower();
    switch (credentials.get(normalizedEmail)) {
      case null {
        return #err("No account found with this email — please register first");
      };
      case (?cred) {
        let hash = AuthLib.hashPassword(password);
        if (cred.password_hash != hash) {
          return #err("Incorrect password — please try again");
        };
        // Issue new session token
        let token = AuthLib.generateSessionToken(normalizedEmail, Time.now());
        let session : AuthTypes.Session = {
          user_id = cred.user_id;
          created_at = Time.now();
        };
        sessions.add(token, session);
        #ok({ session_token = token; user_id = cred.user_id });
      };
    };
  };

  /// Sign out — invalidate the session token.
  public shared func logoutUser(sessionToken : Text) : async () {
    sessions.remove(sessionToken);
  };

  /// Fetch the caller's own profile using their session token.
  /// Automatically transitions expired trials to #free plan_status.
  public shared func getMyProfile(sessionToken : Text) : async { #ok : UserTypes.UserPublic; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?userId) {
        // Auto-expire trial if 30 days have passed
        switch (users.find(func(u : UserTypes.User) : Bool = u.id == userId)) {
          case (?u) {
            if (UsersLib.isTrialExpired(u)) {
              u.plan_status := #free;
            };
          };
          case null {};
        };
        switch (UsersLib.getById(users, userId)) {
          case (?profile) { #ok(profile) };
          case null { #err("Profile not found — please register first") };
        };
      };
    };
  };

  /// Update the caller's profile fields using their session token.
  public shared func updateMyProfile(sessionToken : Text, req : UserTypes.UpdateUserRequest) : async { #ok : UserTypes.UserPublic; #err : Text } {
    switch (AuthLib.resolveSession(sessions, sessionToken)) {
      case null { #err("Not authenticated — please sign in") };
      case (?userId) {
        switch (UsersLib.update(users, userId, req)) {
          case (?profile) { #ok(profile) };
          case null { #err("Profile not found — please register first") };
        };
      };
    };
  };
};
