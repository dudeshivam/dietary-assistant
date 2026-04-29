import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/waitlist";

module {
  public func join(
    entries : Map.Map<Text, Types.WaitlistEntry>,
    email : Text,
  ) : { #ok; #alreadyExists } {
    if (entries.containsKey(email)) {
      return #alreadyExists;
    };
    let entry : Types.WaitlistEntry = {
      email;
      timestamp = Time.now();
    };
    entries.add(email, entry);
    #ok;
  };

  public func count(entries : Map.Map<Text, Types.WaitlistEntry>) : Nat {
    entries.size();
  };
};
