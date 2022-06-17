import {
  createActor as createNftActor,
  canisterId as nftCanisterId
} from "../declarations/dip721_nft_container"

import {
  createActor as createDexActor,
  canisterId as dexCanisterId
} from "../declarations/dex"

export const makeActor = (canisterId, createActor) => {
  return createActor(canisterId, {
    agentOptions: {
      host: process.env.NEXT_PUBLIC_IC_HOST
    }
  })
}

export function makeNftActor() {
  return makeActor(nftCanisterId, createNftActor)
}

export function makeDexActor() {
  return makeActor(dexCanisterId, createDexActor)
}
