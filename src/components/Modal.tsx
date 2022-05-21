import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Modal as ModalMaterial } from '@mui/material';
import {ethers} from "ethers";
import * as rainSDK from "rain-sdk";
import {useEffect, useState} from "react";

declare var process : {
  env: {
    REACT_APP_CHAIN_ID: string
    REACT_APP_YOUR_SALE_ADDRESS: string
    REACT_APP_ERC20_DECIMALS: string
  }
}
const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID); // Mumbai (Polygon Testnet) Chain ID
const YOUR_SALE_ADDRESS = process.env.REACT_APP_YOUR_SALE_ADDRESS;
const ERC20_DECIMALS = parseInt(process.env.REACT_APP_ERC20_DECIMALS); // See here for more info: https://docs.openzeppelin.com/contracts/3.x/erc20#a-note-on-decimals

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

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

export default function Modal({open, setModalOpen, selectedImage}: any) {
  console.log(selectedImage)
  const [displayedImage, setDisplayedImage] = useState("");

  useEffect(() => {
    setDisplayedImage(selectedImage);
  }, [selectedImage])

  return (
    <div>
      <ModalMaterial
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box component="div" sx={style}>
          <img className="modalImage" src={displayedImage} alt="#" /><br/>
          <Typography className="modalText">Demo, see console for data. Please also be aware (for now), you aren't currently buying individual NFTs, but rTKN.</Typography>
          <Button onClick={initiateBuy}>Buy NFT</Button><br/>
          <Button onClick={() => {setModalOpen(false)}}>Close</Button>
        </Box>
      </ModalMaterial>
    </div>
  );
}
