import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useRef, useState} from 'react';
import {useCursor, Image, Text} from '@react-three/drei';
import { ethers } from "ethers";
import * as rainSDK from "rain-sdk";
import getUuid from 'uuid-by-string';
const GOLDENRATIO = 1.61803398875;
const CHAIN_ID = 80001; // Mumbai (Polygon Testnet) Chain ID
const YOUR_SALE_ADDRESS = "0xaF428Be94548e98b85c8c0aBC166aD96cB0C8BDa"; // todo move to .env
const ERC20_DECIMALS = 18; // See here for more info: https://docs.openzeppelin.com/contracts/3.x/erc20#a-note-on-decimals

async function initiateBuy() {
  try {
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


    const saleContract = new rainSDK.Sale(YOUR_SALE_ADDRESS, signer);

    let price = await saleContract.calculatePrice(ethers.utils.parseUnits("10", ERC20_DECIMALS));
    console.log(`Info: Price of tokens in the Sale: ${price}`); // todo check the price is correct

    // configure buy for the sale (We have set this to Matic which is also used for paying gas fees, but this could easily be set to usdcc or some other token)
    // configure buy for the sale (We have set this to Matic which is also used for paying gas fees, but this could easily be set to usdcc or some other token)
    const buyConfig = {
      feeRecipient: address,
      fee: 1, // 1 percent fee for the platform // TODO IS THIS NEEDED TO BE toNumber(). no
      minimumUnits: 10, // 1 million??
      desiredUnits: 10,
      maximumPrice: 1, // 0.01 matic? // TODO VERY ARBITRARY ETHERS CONSTANT MAX AMOUNT // todo why do we set this? // TODO IS THIS NEEDED TO BE toNumber()
    }

    console.log(`Info: Buying from Sale with parameters:`, buyConfig);
    const buyStatus = await saleContract.buy(buyConfig);
    console.log(`Info: This should have passed because you do have one of the NFTs required for taking part`, buyStatus);

  } catch(err) {
    console.log(`Info: Something went wrong:`, err);
  }

}

export default function Frame({url, c = new THREE.Color(), ...props}: any) {
  const [hovered, hover] = useState(false)
  const [rnd] = useState(() => Math.random())
  const image = useRef<any>();
  const frame = useRef<any>();
  const name = getUuid(url)
  useCursor(hovered)
  useFrame((state) => {
    image.current.material.zoom = 2 + Math.sin(rnd * 10000 + state.clock.elapsedTime / 3) / 2
    image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, 0.85 * (hovered ? 0.85 : 1), 0.1)
    image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, 0.9 * (hovered ? 0.905 : 1), 0.1)
    frame.current.material.color.lerp(c.set(hovered ? 'orange' : 'white'), 0.1)
  })
  return (
    <group {...props}>
      <mesh
        name={name}
        onPointerOver={(e) => (e.stopPropagation(), hover(true))}
        onPointerOut={() => hover(false)}
        scale={[1, GOLDENRATIO, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}>
        <boxGeometry/>
        <meshStandardMaterial color="#151515" metalness={0.5} roughness={0.5} envMapIntensity={2}/>
        <mesh ref={frame} raycast={() => null} scale={[0.9, 0.93, 0.9]} position={[0, 0, 0.2]}>
          <boxGeometry/>
          <meshBasicMaterial toneMapped={false} fog={false}/>
        </mesh>
        <Image raycast={() => null} ref={image} position={[0, 0, 0.7]} url={url}/>
      </mesh>
      <Text maxWidth={0.1} anchorX="left" anchorY="top" position={[0.55, GOLDENRATIO, 0]} fontSize={0.025}>
        {name.split('-').join(' ')}
      </Text>
      <Text onClick={() => {initiateBuy()}} maxWidth={0.1} anchorX="left" anchorY="top" position={[0.55, GOLDENRATIO+-0.25, 0]} fontSize={0.05}>
        Buy
      </Text>
    </group>
  )
}
