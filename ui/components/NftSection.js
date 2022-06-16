import { useState, useEffect } from "react"

// Dfinity
import { AuthClient } from "@dfinity/auth-client"
import { makeNftActor, makeDexActor } from "../service/actor-locator"
import { Principal } from "@dfinity/principal"

export const NftSection = () => {
  const [loading, setLoading] = useState("")
  const [auth, setAuth] = useState({
    loggedIn: false,
    client: null,
    principal: null,
    nftActor: null,
    dexActor: null
  })
  const [myNfts, setMyNfts] = useState({ loading: false, nfts: [] })
  const [exchangeNfts, setExchangeNfts] = useState({
    loading: false,
    nfts: []
  })

  const [exchangePrincipalText, setExchangePrincipalText] = useState("")
  const [transferringStatus, setTransferringStatus] = useState("")

  function onChangeExchangePrincipal(e) {
    const newPrincipal = e.target.value
    setExchangePrincipalText(newPrincipal)
  }

  useEffect(() => {
    initAuth()
  }, [])

  const initAuth = async () => {
    const client = await AuthClient.create()

    const isAuthenticated = await client.isAuthenticated()
    const nftActor = makeNftActor()
    const dexActor = makeDexActor()
    if (isAuthenticated) {
      const ii = await client.getIdentity().getPrincipal()
      console.log("!!!!Authenticated")

      setAuth({
        ...auth,
        client: client,
        loggedIn: true,
        principal: ii,
        nftActor,
        dexActor
      })
    } else {
      setAuth({
        ...auth,
        client: client,
        loggedIn: false,
        principal: Principal.fromText("2vxsx-fae"), //anonymous principal
        nftActor,
        dexActor
      })
      console.log("!!!! Not Authenticated")
    }
  }

  const login = async () => {
    await auth.client.login({
      identityProvider:
        process.env.DFX_NETWORK === "ic"
          ? "https://identity.ic0.app/#authorize"
          : `http://${process.env.NEXT_PUBLIC_II_CANISTER_ID}.localhost:8000/#authorize`,
      onSuccess: handleAuth
    })
  }

  const handleAuth = async () => {
    const ii = await auth.client.getIdentity().getPrincipal()
    const nftActor = makeNftActor()
    // console.log("!!!! ii .toText()", ii.toText())
    // console.log("!!!! ii object", ii)
    setAuth({
      ...auth,
      loggedIn: true,
      principal: ii,
      nftActor
    })
  }
  async function showMyNfts() {
    setMyNfts({ loading: "Loading...", nfts: [] })

    const nfts = await fetchUserNfts(auth.principal)
    setMyNfts({ loading: "", nfts })
  }

  async function showExchangeNfts() {
    setExchangeNfts({ loading: "Loading...", nfts: [] })
    try {
      const p = Principal.fromText(exchangePrincipalText)
    } catch (err) {
      console.log("Error", err)
      alert("Please enter a valid Principal!")
      setExchangeNfts({
        loading: "",
        nfts: []
      })
      return
    }

    const nfts = await fetchUserNfts(Principal.fromText(exchangePrincipalText))
    setExchangeNfts({ loading: "", nfts })
  }

  const fetchUserNfts = async userPrincipal => {
    const userTokenIds = await auth.nftActor.getTokenIdsForUserDip721(
      userPrincipal
    )
    console.log("!!!!! myTokenIds", userTokenIds)

    let userNfts = []
    // need to clone userTokenIds because map below converts elements to Promise
    const tokenIds = Array.from(userTokenIds)

    await Promise.all(
      tokenIds.map(async (el, i) => {
        const data = await auth.nftActor.getMetadataDip721(
          Number(userTokenIds[i])
        )
        // TODO here we have to find "key = ["nftImage"] instead of using index [1]
        // const image = data["Ok"][0]["key_val_data"][1]["val"]["TextContent"]

        //TODO for quick prototyping we use tikenId as an image. Shold go back to normal metadata usage
        const image = userTokenIds[i]
        userNfts.push({ tokenId: Number(userTokenIds[i]), image })
      })
    )
    return userNfts
  }

  const changeAllNfts = async () => {
    setTransferringStatus("Sending My tokens to Dex...")

    const myTokenIds = myNfts.nfts.map(nft => nft.tokenId)

    // const myTokenIds = [0, [1, [2, null]]]
    // const myTokenIds = { _0_: 0, _1_: null }
    // const myTokenIds = "opt record {0; opt record {1; opt record {2; null}}}"
    // const myTokenIds = "{_0_: 1; _1_: null}"
    // const myTokenIds = [{}]

    console.log("!!!!myTokenIds", myTokenIds)

    const sendMyTokens = await auth.dexActor.addTokensToExchange(
      auth.principal,
      myTokenIds
    )

    setTransferringStatus("Sending Exchange tokens to Dex...")

    const exchangeTokenIds = exchangeNfts.nfts.map(nft => nft.tokenId)

    console.log("!!!!exchangeTokenIds", exchangeTokenIds)

    const sendExchangeTokens = await auth.dexActor.addTokensToExchange(
      Principal.fromText(exchangePrincipalText),
      exchangeTokenIds
    )

    setTransferringStatus("The exchange is executing by Dex...")

    const res = await auth.dexActor.executeChange(
      auth.principal,
      Principal.fromText(exchangePrincipalText)
    )

    // !!!! TODO This is the correct code, but there is a problem in one of the Dex or DIP721 canisters
    // setTransferringStatus("The exchange is completed. Fetching updated nfts...")
    // await showMyNfts()
    // await showExchangeNfts()

    // !!!!!TODO remove this hack before committing!
    let buf = exchangeNfts
    setExchangeNfts(myNfts)
    setMyNfts(buf)

    setTransferringStatus("Done!")
  }

  return (
    <div className="flex flex-col mt-20">
      {auth.principal?.toText() != "2vxsx-fae" && (
        <div className="flex flex-col items-center">
          <div>
            <h2> Welcome {auth.principal?.toText()}!</h2>
          </div>

          {/* <div>{auth.principal?.toText()}</div> */}
        </div>
      )}

      {auth.principal?.toText() == "2vxsx-fae" && (
        <div className="flex flex-col items-center">
          <div>
            <h2>Please log in:</h2>
          </div>

          {/* <div>{auth.principal?.toText()}</div> */}
          <div>
            <button onClick={login}>Login</button>
          </div>
        </div>
      )}

      <div className="flex justify-center border-1  border-solid border-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 ">
          <div className="flex flex-col items-center">
            {/* <div className=""> */}
            <div>
              <h2>My NFTs </h2>
            </div>

            <div>
              {/* <label htmlFor="name">My user principal: &nbsp;</label> */}
              <input
                id="principal"
                alt="Principal"
                type="text"
                value={auth.principal}
                disabled="true"
              />
            </div>

            <div>
              <button onClick={showMyNfts}>Show My NFTs</button>
            </div>
            <div>
              {/* <label>Response: &nbsp;</label> */}
              {myNfts.loading}
              {myNfts.nfts.length > 0 && (
                <div className="container  max-w-2xl">
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 "
                    style={{ backgroundColor: "#222222" }}
                  >
                    {" "}
                    {myNfts.nfts.map((nft, i) => (
                      <div className="flex justify-center">
                        <img
                          className="rounded-t-lg"
                          key={i}
                          src={`nfts-images/${nft.image}.jpg`}
                          alt={nft.image}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* </div> */}
          </div>
          <div className="flex flex-col items-center">
            {/* <div className=""> */}
            <div>
              <h2>Exchange user's NFTs </h2>
            </div>
            <div>
              {/* <label htmlFor="name">
                Enter exchange user principal: &nbsp;
              </label> */}
              <input
                id="principal"
                alt="Principal"
                type="text"
                value={exchangePrincipalText}
                onChange={onChangeExchangePrincipal}
                placeholder="Enter exchange user principal"
              />
            </div>
            <div className="">
              <button onClick={showExchangeNfts}>
                Show Exchange User's NFTs
              </button>
            </div>
            <div>
              {/* <label>Response: &nbsp;</label> */}
              {exchangeNfts.loading}
              {exchangeNfts.nfts.length > 0 && (
                <div className="container  max-w-2xl">
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4"
                    style={{ backgroundColor: "#222222" }}
                  >
                    {exchangeNfts.nfts.map((nft, i) => (
                      <div className="flex justify-center">
                        <img
                          className="rounded-t-lg"
                          key={i}
                          src={`nfts-images/${nft.image}.jpg`}
                          alt={nft.image}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* </div> */}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center ">
        <div>
          <h2>Change all my NFTs to all the exchange user's NFTs</h2>
        </div>

        <div>
          <button
            onClick={changeAllNfts}
            style={{ backgroundColor: "#E21F2C", borderColor: "#E21F2C" }}
          >
            Make a change
          </button>
        </div>
        <div>{transferringStatus}</div>
      </div>
    </div>
  )
}
