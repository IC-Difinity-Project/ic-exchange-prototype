import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type ApiError = { 'ZeroAddress' : null } |
  { 'InvalidTokenId' : null } |
  { 'Unauthorized' : null } |
  { 'Other' : null };
export interface Dex {
  'addTokensToExchange' : ActorMethod<[Principal, Array<bigint>], undefined>,
  'executeChange' : ActorMethod<[Principal, Principal], TxReceipt>,
  'getAllExchanges' : ActorMethod<[], Array<Exchange>>,
  'getOwnerExchanges' : ActorMethod<[Principal], [] | [List]>,
  'whoami' : ActorMethod<[], Principal>,
}
export interface Exchange { 'tokensOwner' : Principal, 'tokenIds' : List }
export type List = [] | [[bigint, List]];
export type Principal = Principal;
export type TxReceipt = { 'Ok' : bigint } |
  { 'Err' : ApiError };
export interface _SERVICE extends Dex {}
