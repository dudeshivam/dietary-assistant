import List "mo:core/List";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Runtime "mo:core/Runtime";
import Types "../types/payments";
import CommonTypes "../types/common";

module {

  // ── Razorpay credentials (replace before going live) ─────────────────────
  let RAZORPAY_KEY_ID : Text = "rzp_test_placeholder";
  let RAZORPAY_KEY_SECRET : Text = "placeholder_secret";
  let RAZORPAY_ORDERS_URL : Text = "https://api.razorpay.com/v1/orders";

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

  // ── SHA-256 primitives ────────────────────────────────────────────────────
  func rotr32(x : Nat32, n : Nat32) : Nat32 {
    (x >> n) | (x << (32 - n));
  };

  func ch(x : Nat32, y : Nat32, z : Nat32) : Nat32 {
    (x & y) ^ (^x & z);
  };

  func maj(x : Nat32, y : Nat32, z : Nat32) : Nat32 {
    (x & y) ^ (x & z) ^ (y & z);
  };

  func sig0(x : Nat32) : Nat32 {
    rotr32(x, 2) ^ rotr32(x, 13) ^ rotr32(x, 22);
  };

  func sig1(x : Nat32) : Nat32 {
    rotr32(x, 6) ^ rotr32(x, 11) ^ rotr32(x, 25);
  };

  func gam0(x : Nat32) : Nat32 {
    rotr32(x, 7) ^ rotr32(x, 18) ^ (x >> 3);
  };

  func gam1(x : Nat32) : Nat32 {
    rotr32(x, 17) ^ rotr32(x, 19) ^ (x >> 10);
  };

  // SHA-256 message padding — appends 0x80, zero bytes, then 64-bit big-endian bit length
  func sha256Pad(msg : [Nat8]) : [Nat8] {
    let len = msg.size();
    let bitLen = len * 8;
    // We need (len + 1 + extra) ≡ 56 (mod 64), i.e. extra = (56 - (len+1)%64 + 64) % 64
    let afterMarker = (len + 1) % 64;
    let extra = if (afterMarker <= 56) { 56 - afterMarker } else { 64 + 56 - afterMarker };
    let total = len + 1 + extra + 8;
    Array.tabulate<Nat8>(total, func(i) {
      if (i < len) {
        msg[i];
      } else if (i == len) {
        0x80;
      } else if (i < len + 1 + extra) {
        0x00;
      } else {
        // last 8 bytes: big-endian 64-bit representation of bitLen
        // bytePos counts from 8 (most significant) down to 1 (least significant)
        let bytePos = total - i; // 8..1
        let shift = (bytePos - 1) * 8;
        Nat8.fromNat((bitLen / (2 ** shift)) % 256);
      };
    });
  };

  // Process one 64-byte SHA-256 block; mutates h in place
  func processBlock(block : [Nat8], offset : Nat, h : [var Nat32]) {
    // Message schedule: 64 words
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
      w[i] := gam1(w[i - 2]) +% w[i - 7] +% gam0(w[i - 15]) +% w[i - 16];
      i += 1;
    };
    var a = h[0]; var b = h[1]; var c = h[2]; var d = h[3];
    var e = h[4]; var f = h[5]; var g = h[6]; var hh = h[7];
    i := 0;
    while (i < 64) {
      let t1 = hh +% sig1(e) +% ch(e, f, g) +% K[i] +% w[i];
      let t2 = sig0(a) +% maj(a, b, c);
      hh := g; g := f; f := e; e := d +% t1;
      d := c; c := b; b := a; a := t1 +% t2;
      i += 1;
    };
    h[0] +%= a; h[1] +%= b; h[2] +%= c; h[3] +%= d;
    h[4] +%= e; h[5] +%= f; h[6] +%= g; h[7] +%= hh;
  };

  // Full SHA-256 hash over a byte array; returns 32-byte digest
  func sha256Bytes(msg : [Nat8]) : [Nat8] {
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
      ((word >> shift) & 0xff).toNat() |> Nat8.fromNat(_);
    });
  };

  // HMAC-SHA256(key, message) — per RFC 2104
  func hmacSha256(key : [Nat8], message : [Nat8]) : [Nat8] {
    let blockSize = 64;
    let normKey : [Nat8] = if (key.size() > blockSize) {
      sha256Bytes(key);
    } else { key };
    let paddedKey = Array.tabulate<Nat8>(blockSize, func(i) {
      if (i < normKey.size()) { normKey[i] } else { 0x00 };
    });
    let ipad = Array.tabulate(blockSize, func(i) { paddedKey[i] ^ 0x36 });
    let opad = Array.tabulate(blockSize, func(i) { paddedKey[i] ^ 0x5c });
    let innerInput = Array.tabulate(blockSize + message.size(), func(i) {
      if (i < blockSize) { ipad[i] } else { message[i - blockSize] };
    });
    let innerHash = sha256Bytes(innerInput);
    let outerInput = Array.tabulate(blockSize + innerHash.size(), func(i) {
      if (i < blockSize) { opad[i] } else { innerHash[i - blockSize] };
    });
    sha256Bytes(outerInput);
  };

  // Convert byte array to lowercase hex text
  func bytesToHex(bytes : [Nat8]) : Text {
    let hexChars : [Char] = [
      '0','1','2','3','4','5','6','7','8','9',
      'a','b','c','d','e','f',
    ];
    let chars = Array.tabulate(bytes.size() * 2, func(i) {
      let byte = bytes[i / 2].toNat();
      let nibble = if (i % 2 == 0) { byte / 16 } else { byte % 16 };
      hexChars[nibble];
    });
    Text.fromArray(chars);
  };

  // Encode Text to UTF-8 byte array
  func textToBytes(t : Text) : [Nat8] {
    t.encodeUtf8().toArray();
  };

  // Standard base64 alphabet
  let BASE64_CHARS : [Char] = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M',
    'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'a','b','c','d','e','f','g','h','i','j','k','l','m',
    'n','o','p','q','r','s','t','u','v','w','x','y','z',
    '0','1','2','3','4','5','6','7','8','9','+','/',
  ];

  func base64Encode(input : [Nat8]) : Text {
    let len = input.size();
    var result = "";
    var i = 0;
    while (i < len) {
      let b0 = Nat32.fromNat(input[i].toNat());
      let b1 : Nat32 = if (i + 1 < len) Nat32.fromNat(input[i + 1].toNat()) else 0;
      let b2 : Nat32 = if (i + 2 < len) Nat32.fromNat(input[i + 2].toNat()) else 0;
      let c0 = (b0 >> 2) & 0x3f;
      let c1 = ((b0 & 0x03) << 4) | ((b1 >> 4) & 0x0f);
      let c2 = ((b1 & 0x0f) << 2) | ((b2 >> 6) & 0x03);
      let c3 = b2 & 0x3f;
      result := result # Text.fromChar(BASE64_CHARS[c0.toNat()]);
      result := result # Text.fromChar(BASE64_CHARS[c1.toNat()]);
      result := result # (if (i + 1 < len) Text.fromChar(BASE64_CHARS[c2.toNat()]) else "=");
      result := result # (if (i + 2 < len) Text.fromChar(BASE64_CHARS[c3.toNat()]) else "=");
      i += 3;
    };
    result;
  };

  // Build HTTP Basic Auth header value: "Basic base64(key_id:key_secret)"
  func basicAuthHeader() : Text {
    let credentials = RAZORPAY_KEY_ID # ":" # RAZORPAY_KEY_SECRET;
    "Basic " # base64Encode(textToBytes(credentials));
  };

  // Minimal JSON string-field extractor: finds first "fieldName":"value" and returns value
  func parseJsonStringField(json : Text, fieldName : Text) : ?Text {
    let needle = "\"" # fieldName # "\":\"";
    let parts = json.split(#text needle);
    ignore parts.next(); // skip content before the field
    switch (parts.next()) {
      case null { null };
      case (?after) {
        let valueParts = after.split(#char '\u{22}');
        valueParts.next();
      };
    };
  };

  // ── Public API ────────────────────────────────────────────────────────────

  // Verify Razorpay HMAC-SHA256 payment signature.
  // Razorpay signs: HMAC-SHA256(order_id + "|" + payment_id, key_secret)
  public func verifySignature(orderId : Text, paymentId : Text, signature : Text) : Bool {
    let payload = orderId # "|" # paymentId;
    let keyBytes = textToBytes(RAZORPAY_KEY_SECRET);
    let msgBytes = textToBytes(payload);
    let computed = hmacSha256(keyBytes, msgBytes);
    bytesToHex(computed) == signature;
  };

  // HTTP outcall to Razorpay: create a payment order
  public func createRazorpayOrder(amount : Nat) : async Types.CreateOrderResponse {
    let ic : actor {
      http_request : shared {
        url : Text;
        max_response_bytes : ?Nat64;
        method : { #get; #head; #post };
        headers : [{ name : Text; value : Text }];
        body : ?Blob;
        transform : ?{
          function : shared query {
            response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
            context : Blob;
          } -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
          context : Blob;
        };
        is_replicated : ?Bool;
      } -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
    } = actor ("aaaaa-aa");

    let jsonBody = "{\"amount\":" # amount.toText()
      # ",\"currency\":\"INR\",\"receipt\":\"dietary_premium_99\"}";
    let bodyBlob = jsonBody.encodeUtf8();

    let response = await ic.http_request({
      url = RAZORPAY_ORDERS_URL;
      max_response_bytes = ?4096;
      method = #post;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "Authorization"; value = basicAuthHeader() },
      ];
      body = ?bodyBlob;
      transform = null;
      is_replicated = ?true;
    });

    if (response.status != 200) {
      Runtime.trap("Razorpay order creation failed, status: " # response.status.toText());
    };

    let responseText = switch (response.body.decodeUtf8()) {
      case (?t) { t };
      case null { Runtime.trap("Invalid UTF-8 in Razorpay response") };
    };

    let orderId = switch (parseJsonStringField(responseText, "id")) {
      case (?id) { id };
      case null { Runtime.trap("Could not parse order id from Razorpay response") };
    };

    { order_id = orderId; amount; currency = "INR" };
  };

  // Store a payment record in the list
  public func record(
    payments : List.List<Types.Payment>,
    payload : Types.WebhookPayload,
    plan : ?CommonTypes.SubscriptionPlan,
  ) : Types.Payment {
    let payment : Types.Payment = {
      payment_id = payload.payment_id;
      order_id = payload.order_id;
      user_id = payload.user_id;
      amount = payload.amount;
      status = payload.status;
      plan;
      date = Time.now();
    };
    payments.add(payment);
    payment;
  };

  public func getByUser(
    payments : List.List<Types.Payment>,
    user_id : Principal,
  ) : [Types.Payment] {
    payments.filter(func(p : Types.Payment) : Bool = p.user_id == user_id).toArray();
  };

  public func isSuccessful(payment : Types.Payment) : Bool {
    switch (payment.status) {
      case (#success) { true };
      case _ { false };
    };
  };
};
