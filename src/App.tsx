import React, {useEffect, useState} from 'react';
import {Canvas} from '@react-three/fiber'
import {MeshReflectorMaterial, Environment} from '@react-three/drei';
import NavBar from './components/NavBar';
import Button from "@mui/material/Button";
import {ethers} from "ethers";
import * as rainSDK from "rain-sdk";
import DoneIcon from '@mui/icons-material/Done';
import {Divider, Icon} from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';

declare var process : {
  env: {
    REACT_APP_CHAIN_ID: string,
    REACT_APP_YOUR_VERIFY_ADDRESS: string
  }
}
const CHAIN_ID = parseInt(process.env.REACT_APP_CHAIN_ID); // Mumbai (Polygon Testnet) Chain ID
const YOUR_VERIFY_ADDRESS = process.env.REACT_APP_YOUR_VERIFY_ADDRESS; // Mumbai (Polygon Testnet) Chain ID
const APPROVED_CONSTANT = rainSDK.Verify.status.APPROVED;

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
  const [entryAllowed, setEntryAllowed] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [hacking, setHacking] = useState(false);

  /**
   * Get UserBalance
   */
  async function checkIfUserVerified(setIsApproved: any) {
    try {
      const signer = await getSigner();
      const address = await signer.getAddress();
      const verifyContract = new rainSDK.Verify(YOUR_VERIFY_ADDRESS, signer);

      const userState = await verifyContract.state(address);
      const currentBlock = await signer.provider.getBlockNumber();
      const userVerified = await verifyContract.statusAtBlock(userState, currentBlock)
      // const intValueOfVerified = parseInt(ethers.utils.formatEther(userVerified));
      const intValueOfVerified = userVerified.toNumber();
      console.log(`User Verification Status:`, intValueOfVerified);

      if (intValueOfVerified === APPROVED_CONSTANT) {
        setIsApproved(true);
      }
    } catch(err) {
      console.log('------------------------------');
      console.log(`Info: Something went wrong:`, err);
    }
  }

  async function hackEntryPoint(setHacking: any) {
    setHacking(true);
    console.log(`Hacking Entry Point.`);

    try {
      const signer = await getSigner();
      const address = await signer.getAddress();
      const verifyContract = new rainSDK.Verify(YOUR_VERIFY_ADDRESS, signer);

      console.log(`Granting you the APPROVER role.`);
      const approverRoleHash = await verifyContract.APPROVER();
      // https://docs.ethers.io/v5/api/providers/types/#types--transactions
      const grantTransaction = await verifyContract.grantRole(approverRoleHash, address); // todo may need to give self approver role
      const grantTransactionReceipt = await grantTransaction.wait();
      console.log(`Info: Grant Transaction Receipt:`, grantTransactionReceipt);

      console.log(`Info: Approving You:`);

      const approvalTransaction = await verifyContract.approve([{
        account: address,
        data: []
      }])
      const approvalTransactionReceipt = await approvalTransaction.wait();
      console.log(`Result: of Approval Transaction Receipt:`, approvalTransactionReceipt);
      console.log("Info: Done");
      setHacking(false);
    } catch(err) {
      console.log(err);
      setHacking(false);
    }
  }

  /**
   * Try to Enter the Concert
   *
   * @param setEntryAllowed
   */
  async function tryEntry(setEntryAllowed: any) {
    if (!isApproved) {
      alert('You need to be approved to enter');
    } else {
      setEntryAllowed(true);
    }
  }

  /**
   * Check if approved on Startup
   */
  useEffect(() => {
    checkIfUserVerified(setIsApproved)
  }, [isApproved])

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
            <h1>Welcome to MetaConcert</h1><p><span>We need to Verify that you are on the Guest list.<br/><br/>
            You will need to connect to Polygon Mumbai Testnet, and have some Testnet Matic. <br/><br/>
            You might also want to check the console in your browser (works best in Chrome).</span></p>

            <br/>
            <Divider color="white" variant="fullWidth"/>
            <br/>

            <p>You are currently {!isApproved ? "not verified!" : "verified!"}</p><div className="ticket" hidden={!entryAllowed}><DoneIcon/></div>
            <br/>
            <Button onClick={() => {tryEntry(setEntryAllowed)}} variant="outlined" color="primary">Enter</Button>&nbsp;
            { !hacking && (
              <Button onClick={() => {hackEntryPoint(setHacking)}} variant="outlined" color="primary">Hack Entry Point</Button>
            )}
            { hacking && (
              <div>Hacking: <CircularProgress /></div>
            )}
          </div>
        </div>
      </div>
      <div className="canvasContainer">

      </div>
    </div>
  );
}

export default App;
