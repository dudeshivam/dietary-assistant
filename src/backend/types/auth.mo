module {
  /// Stored credential record per email
  public type Credential = {
    user_id : Principal;
    password_hash : Text; // SHA-256 hex of password
  };

  /// Active session record
  public type Session = {
    user_id : Principal;
    created_at : Int;
  };

  /// Login request
  public type LoginRequest = {
    email : Text;
    password : Text;
  };

  /// Login / register response
  public type AuthResponse = {
    session_token : Text;
    user_id : Principal;
  };
};
