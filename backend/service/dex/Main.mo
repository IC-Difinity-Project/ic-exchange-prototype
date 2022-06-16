import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Bool "mo:base/Debug";
import Float "mo:base/Float";
import Int "mo:base/Int";
import Int64 "mo:base/Int64";
import Iter "mo:base/Iter";
import M "mo:base/HashMap";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import List "mo:base/List";

// import T "Types";


shared(init_msg) actor class Dex() = this {

// TODO here it is an import from  dip721 canister, should be re-thinked
type ApiError = {
    #Unauthorized;
    #InvalidTokenId;
    #ZeroAddress;
    #Other;
  };

type Result<S, E> = {
    #Ok : S;
    #Err : E;
  };

type TxReceipt = Result<Nat, ApiError>;

type Exchange = {
  tokensOwner: Principal.Principal; 
  tokenIds: List.List<Nat64>;
};



  //////////////////////////////


    stable var lastId : Nat32 = 0;
    var exchanges = M.HashMap<Principal.Principal, List.List<Nat64>>(10, 
      func (k1: Principal.Principal,k2: Principal.Principal): Bool {
          Principal.equal(k1,k2)
      }, 
      func (k : Principal.Principal) {
          Text.hash(Principal.toText(k))
      });

    public shared func addTokensToExchange(tokenOwner: Principal.Principal, tokenIds: [Nat64]) {
      exchanges.put(tokenOwner, List.fromArray(tokenIds));
   
    };

    public shared func executeChange(tokenOwner1: Principal.Principal, tokenOwner2: Principal.Principal): async TxReceipt {

      let dip721 = actor("ewrph-5qaaa-aaaap-aagma-cai"): actor { transferFromDip721: (from: Principal, to: Principal, token_id: Nat64) -> async TxReceipt  };         

      switch (exchanges.get(tokenOwner1)) {
        case (?tokenIds1) {
         for (item in Iter.fromList(tokenIds1) ) {
           switch(await dip721.transferFromDip721(tokenOwner1,tokenOwner2,item)) {
             case (_) {} //TODO make a proper error handling
           }};
        //  return #Ok(0);
        };
        case (null) {
          // return #Err(#Other);
        };
      };

      exchanges.delete(tokenOwner1);

      switch (exchanges.get(tokenOwner2)) {
        case (?tokenIds2) {
         for (item in Iter.fromList(tokenIds2) ) {
           switch(await dip721.transferFromDip721(tokenOwner2,tokenOwner1,item)) {
             case (_) {} //TODO make a proper error handling
           }};
        //  return #Ok(0);
        };
        case (null) {
          // return #Err(#Other);
        };
      };

      exchanges.delete(tokenOwner2);

      return #Ok(0);
    };



    public shared query (msg) func getOwnerExchanges(tokenOwner: Principal.Principal) : async ?List.List<Nat64>{
        exchanges.get(tokenOwner);
    };

    public shared query (msg) func getAllExchanges() : async [Exchange]{
      let buff : Buffer.Buffer<Exchange> = Buffer.Buffer(10);

      // Iter.toArray<(Principal.Principal, List.List<Nat64>)>(hashMap.entries());
      for( (a,b) in exchanges.entries()) {


         Debug.print("!!!");
        Debug.print("!!! "# Principal.toText(a)  # Nat.toText(List.size(b)));
       
            
                buff.add({
                  tokensOwner=a;
                  tokenIds = b;
                });
            
        };
        buff.toArray();
    };


    // ===== ORDER FUNCTIONS =====


    // private func getAllOrders() : [T.Order] {
    //     let buff : Buffer.Buffer<T.Order> = Buffer.Buffer(10);
    //     for(e in exchanges.vals()) {
    //         for(o in e.getOrders().vals()) {
    //             buff.add(o);
    //         };
    //     };
    //     buff.toArray();
    // };

    // private func nextId() : Nat32 {
    //     lastId += 1;
    //     lastId;
    // };




    // ===== DEX STATE FUNCTIONS =====

    public shared query (msg) func whoami() : async Principal {
        return msg.caller;
    };


    // ===== DEPOSIT FUNCTIONS =====



    // ===== INTERNAL FUNCTIONS =====
  

    // !!!! UPGRADES ONLY USED FOR DEVELOPMENT !!!!
 

}
