import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AuthTypes "../types/auth";

module {

  // ── SHA-256 round constants ───────────────────────────────────────────────
  let K : [Nat32] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  func rotr32(x : Nat32, n : Nat32) : Nat32 {
    (x >> n) | (x << (32 - n));
  };
  func cha(x : Nat32, y : Nat32, z : Nat32) : Nat32 {
    (x & y) ^ ((^x) & z);
  };
  func maj(x : Nat32, y : Nat32, z : Nat32) : Nat32 {
    (x & y) ^ (x & z) ^ (y & z);
  };
  func bsig0(x : Nat32) : Nat32 {
    rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
  };
  func bsig1(x : Nat32) : Nat32 {
    rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
  };
  func ssig0(x : Nat32) : Nat32 {
    rotr32(x, 7) ^ rotr32(x, 18) ^ (x >> 3);
  };
  func ssig1(x : Nat32) : Nat32 {
    rotr32(x, 17) ^ rotr32(x, 19) ^ (x >> 10);
  };

  func sha256Pad(msg : [Nat8]) : [Nat8] {
    let len = msg.size();
    let bitLen = len * 8;
    let afterMarker = (len + 1) % 64;
    let extra = if (afterMarker <= 56) { 56 - afterMarker } else {
      64 + 56 - afterMarker;
    };
    let total = len + 1 + extra + 8;
    Array.tabulate<Nat8>(total, func(i) {
      if (i < len) { msg[i] }
      else if (i == len) { 0x80 }
      else if (i < len + 1 + extra) { 0x00 }
      else {
        let bytePos = total - i;
        let shift = (bytePos - 1) * 8;
        Nat8.fromNat((bitLen / (2 ** shift)) % 256);
      };
    });
  };

  func processBlock(block : [Nat8], offset : Nat, h : [var Nat32]) {
    let w : [var Nat32] = Array.tabulate<Nat32>(64, func _ = (0 : Nat32)).toVarArray();
    var i : Nat = 0;
    while (i < 16) {
      let idx = offset + i * 4;
      w[i] := (Nat32.fromNat(block[idx].toNat()) << 24)
        | (Nat32.fromNat(block[idx + 1].toNat()) << 16)
        | (Nat32.fromNat(block[idx + 2].toNat()) << 8)
        | Nat32.fromNat(block[idx + 3].toNat());
      i += 1;
    };
    i := 16;
    while (i < 64) {
      w[i] := ssig1(w[i - 2]) +% w[i - 7] +% ssig0(w[i - 15]) +% w[i - 16];
      i += 1;
    };
    var a = h[0]; var b = h[1]; var c = h[2]; var d = h[3];
    var e = h[4]; var f = h[5]; var g = h[6]; var hh = h[7];
    i := 0;
    while (i < 64) {
      let t1 = hh +% bsig1(e) +% cha(e, f, g) +% K[i] +% w[i];
      let t2 = bsig0(a) +% maj(a, b, c);
      hh := g; g := f; f := e; e := d +% t1;
      d := c; c := b; b := a; a := t1 +% t2;
      i += 1;
    };
    h[0] +%= a; h[1] +%= b; h[2] +%= c; h[3] +%= d;
    h[4] +%= e; h[5] +%= f; h[6] +%= g; h[7] +%= hh;
  };

  public func sha256Bytes(msg : [Nat8]) : [Nat8] {
    let padded = sha256Pad(msg);
    let h : [var Nat32] = [var
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];
    let nBlocks = padded.size() / 64;
    var i = 0;
    while (i < nBlocks) {
      processBlock(padded, i * 64, h);
      i += 1;
    };
    Array.tabulate<Nat8>(32, func(j) {
      let word = h[j / 4];
      let shift = Nat32.fromNat((3 - j % 4) * 8);
      Nat8.fromNat(((word >> shift) & 0xff).toNat());
    });
  };

  let HEX_CHARS : [Char] = [
    '0','1','2','3','4','5','6','7','8','9',
    'a','b','c','d','e','f',
  ];

  func bytesToHex(bytes : [Nat8]) : Text {
    let chars = Array.tabulate(bytes.size() * 2, func(i) {
      let byte = bytes[i / 2].toNat();
      let nibble = if (i % 2 == 0) { byte / 16 } else { byte % 16 };
      HEX_CHARS[nibble];
    });
    Text.fromArray(chars);
  };

  /// Hash a password using SHA-256, returned as hex text.
  public func hashPassword(password : Text) : Text {
    let bytes = password.encodeUtf8().toArray();
    bytesToHex(sha256Bytes(bytes));
  };

  /// Derive a stable, deterministic Principal from an email address.
  /// Uses the first 29 bytes of SHA-256(lowercased email) as a Principal blob.
  public func principalFromEmail(email : Text) : Principal {
    let emailBytes = email.toLower().encodeUtf8().toArray();
    let hash = sha256Bytes(emailBytes);
    // Take first 29 bytes — Principal max raw bytes is 29
    let principalBytes : [Nat8] = Array.tabulate<Nat8>(29, func(i) { hash[i] });
    Blob.fromArray(principalBytes).fromBlob();
  };

  /// Generate a session token from email and a timestamp.
  public func generateSessionToken(email : Text, now : Int) : Text {
    let input = email # ":" # debug_show(now);
    let inputBytes = input.encodeUtf8().toArray();
    bytesToHex(sha256Bytes(inputBytes));
  };

  /// Resolve session token → user Principal. Returns null if invalid.
  public func resolveSession(
    sessions : Map.Map<Text, AuthTypes.Session>,
    token : Text,
  ) : ?Principal {
    switch (sessions.get(token)) {
      case (?s) { ?s.user_id };
      case null { null };
    };
  };

  /// Require a valid session token. Traps with a descriptive error if invalid.
  public func requireAuth(
    sessions : Map.Map<Text, AuthTypes.Session>,
    token : Text,
  ) : Principal {
    switch (resolveSession(sessions, token)) {
      case (?uid) { uid };
      case null {
        Runtime.trap("Not authenticated — please sign in first");
      };
    };
  };
};
