import React, {useEffect, useState} from 'react';
import {Canvas} from '@react-three/fiber'
import {MeshReflectorMaterial, Environment} from '@react-three/drei';
import Frames from './components/Frames';
import NavBar from './components/NavBar';
import Modal from './components/Modal';
import Button from "@mui/material/Button";
import {ethers} from "ethers";
import * as rainSDK from "rain-sdk";

declare var process : {
  env: {
    REACT_APP_CHAIN_ID: string
    REACT_APP_YOUR_GATEDNFT_ADDRESS: string
    REACT_APP_YOUR_TIER_ADDRESS: string
  }
}
const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID); // Mumbai (Polygon Testnet) Chain ID
const YOUR_GATEDNFT_ADDRESS = process.env.REACT_APP_YOUR_GATEDNFT_ADDRESS;
const YOUR_TIER_ADDRESS = parseInt(process.env.REACT_APP_YOUR_TIER_ADDRESS); // See here for more info: https://docs.openzeppelin.com/contracts/3.x/erc20#a-note-on-decimals

/**
 * Get Signer
 */
async function getSigner (){
  const {ethereum}: any = window;

  if (!ethereum) {
    console.log("No Web3 Wallet installed");
  }

  const provider = new ethers.providers.Web3Provider(ethereum, {
    name: 'Mumbai',
    chainId: CHAIN_ID,
  });

  // Prompt user for account connections
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  console.log("Info: Your Account Address:", address);
  console.log('------------------------------'); // separator
  return signer;
}

/**
 * App
 *
 * @param images
 * @constructor
 */
function App({images}: any) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")
  const [entryAllowed, setEntryAllowed] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  /**
   * Get UserBalance
   */
  async function getUserBalance() {
    try {
      const signer = await getSigner();
      const address = await signer.getAddress();

      const gatedNFTContract = new rainSDK.GatedNFT(YOUR_GATEDNFT_ADDRESS, signer);
      const userBalance = await gatedNFTContract.balanceOf(address);
      const balance = userBalance.toNumber();
      console.log(`Your Balance: `, balance);
      setUserBalance(balance);
    } catch(err) {
      console.log('------------------------------');
      console.log(`Info: Something went wrong:`, err);
    }
  }

  /**
   * Try to Enter the Gallery
   *
   * @param userBalance
   * @param setEntryAllowed
   */
  async function tryEntry(userBalance: number, setEntryAllowed: any) {
    if (userBalance < 1) {
      console.log('here')
      alert('You need to buy a ticket to enter');
    } else {
      setEntryAllowed(true);
    }
  }

  /**
   * Purchase Ticket
   */
  async function purchaseTicket(userBalance: number) {
    try {
      if (userBalance >= 1) {
        alert('You already have a ticket!');
      } else {
        const signer = await getSigner();
        const address = await signer.getAddress();

        alert('Minting');
        const gatedNFTContract = new rainSDK.GatedNFT(YOUR_GATEDNFT_ADDRESS, signer);
        await gatedNFTContract.mint(address); // get one of the NFTs needed to take part in the sale
        await getUserBalance(); // this will trigger useEffect and update the text in the frontend
      }
    } catch(err) {
      console.log('------------------------------');
      console.log(`Info: Something went wrong:`, err);
    }
  }

  /**
   * Get Balance on Startup
   */
  useEffect(() => {
    getUserBalance()
  }, [userBalance])

  /**
   * View
   */
  return (
    <div className="rootContainer">
      <NavBar />
      <div hidden={entryAllowed} className="gatedSection">
        <div className="gatedSection__left"></div>
        <div className="gatedSection__right">
          <div className="gatedSection__info">
            <h1>Welcome to MetaGallery</h1><p><span>Please either show or purchase an entry ticket to enter</span></p>
            <p>You currently have {userBalance < 1 ? "no ticket!" : "a ticket!"}</p>
            <br/>
            <Button onClick={() => {tryEntry(userBalance, setEntryAllowed)}} variant="outlined" color="primary">Enter</Button>&nbsp;
            <Button onClick={() => {purchaseTicket(userBalance)}} variant="outlined" color="secondary">Purchase</Button>
          </div>
        </div>
      </div>
      <div className="canvasContainer">
        <Modal open={modalOpen} setModalOpen={setModalOpen} selectedImage={selectedImage} />

        <Canvas gl={{alpha: false}} dpr={[1, 1.5]} camera={{fov: 70, position: [0, 2, 15]}}>
          <color attach="background" args={['#191920']}/>
          <fog attach="fog" args={['#191920', 0, 15]}/>
          <Environment preset="city"/>

          <group position={[0, -0.5, 0]}>
            <Frames
              images={images}
              setModalOpen={setModalOpen}
              setSelectedImage={setSelectedImage}
            />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
              <planeGeometry args={[50, 50]}/>
              <MeshReflectorMaterial
                blur={[300, 100]}
                resolution={2048}
                mixBlur={1}
                mixStrength={40}
                roughness={1}
                depthScale={1.2}
                minDepthThreshold={0.4}
                maxDepthThreshold={1.4}
                color="#101010"
                metalness={0.5}
                mirror={1}
              />
            </mesh>
          </group>
        </Canvas>
      </div>
    </div>
  );
}

export default App;
