export const idlFactory = ({ IDL }) => {
  const List = IDL.Rec();
  const Principal = IDL.Principal;
  const ApiError = IDL.Variant({
    'ZeroAddress' : IDL.Null,
    'InvalidTokenId' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'Other' : IDL.Null,
  });
  const TxReceipt = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : ApiError });
  List.fill(IDL.Opt(IDL.Tuple(IDL.Nat64, List)));
  const Exchange = IDL.Record({ 'tokensOwner' : Principal, 'tokenIds' : List });
  const Dex = IDL.Service({
    'addTokensToExchange' : IDL.Func(
        [Principal, IDL.Vec(IDL.Nat64)],
        [],
        ['oneway'],
      ),
    'executeChange' : IDL.Func([Principal, Principal], [TxReceipt], []),
    'getAllExchanges' : IDL.Func([], [IDL.Vec(Exchange)], ['query']),
    'getOwnerExchanges' : IDL.Func([Principal], [IDL.Opt(List)], ['query']),
    'whoami' : IDL.Func([], [IDL.Principal], ['query']),
  });
  return Dex;
};
export const init = ({ IDL }) => { return []; };
