import {
  createActor as createHelloActor,
  canisterId as helloCanisterId
} from "../declarations/hello"

import {
  createActor as createImageActor,
  canisterId as imageCanisterId
} from "../declarations/image"

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

export function makeHelloActor() {
  return makeActor(helloCanisterId, createHelloActor)
}

export function makeImageActor() {
  return makeActor(imageCanisterId, createImageActor)
}

export function makeNftActor() {
  return makeActor(nftCanisterId, createNftActor)
}

export function makeDexActor() {
  return makeActor(dexCanisterId, createDexActor)
}
