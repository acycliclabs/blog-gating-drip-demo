"use strict";

var provider;
var selectedAccount = null;
var signer;
var contractAddress = "";
var baseUrl = "";
var projectApiKey = "86ae03775df95278c8525626d2abeb1123bf3220";
var utilityId = "3";
var dripSDK = null;

function setBaseUrl() {
  console.log("host:", window.location.host);
  console.log("check:", window.location.host.includes("localhost"));
  if (window.location.host.includes("localhost")) {
    baseUrl = "http://localhost:3001";
  } else {
    baseUrl = "https://api.dripverse.org";
  }
}

function showData() {
  $("#content-wrap").removeClass("hidden");
  $("#connect-wallet-container").addClass("hidden");
}

function hideData() {
  $("#content-wrap").addClass("hidden");
  $("#connect-wallet-container").removeClass("hidden");
}

(async function () {
  setBaseUrl();
  console.log("baseUrl:", baseUrl);
  if (baseUrl.length > 0) {
    updateAccessState(false);
    // Check Injected Metamask
    if ((await checkMetamask()) === true) {
      console.log("Metamask Found. Checking for account access...");
      console.log("selectedAccount:", selectedAccount);
      if (selectedAccount !== null) {
        console.log("Account Selected:", selectedAccount);
        await checkNFT(selectedAccount);

        const status = await dripSDK.status();
        console.log("SDK API Status: ", status.success, status.status);
      } else {
        await connectWallet();
        console.log("selectedAccount:", selectedAccount);
        if (dripSDK === null) {
            dripSDK = new window.drip(projectApiKey);
            console.log("Connected..", await dripSDK.status());
          }
      }
    }
  } else {
    console.log("Unknown Domain. Please contact support@dripverse.org!");
    Prompt.create({
      title: "App Initialisation Failed!",
      text: "Something went wrong! Please hard refresh or clear cache and try again!",
      type: "error",
      position: "bottom-right",
      timeout: 5000,
    });
  }
})();

async function checkMetamask() {
  console.log("Checking Metamask...");
  let metamaskFound = false;
  if (window.ethereum !== undefined) {
    metamaskFound = true;
  } else {
    console.log("No Metamask Detected!");
    Prompt.create({
      title: "No Metamask Detected!",
      text: "This app works only with Metamask. Please install Metamask on this browser to continue.",
      type: "warning",
      position: "bottom-right",
      timeout: 5000,
    });
  }
  return metamaskFound;
}

async function connectWallet() {
  console.log("Connecting Metamask...", window.ethereum);
  if (window.ethereum !== undefined) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    let accounts = await provider.send("eth_requestAccounts", []);
    selectedAccount = accounts[0];
    signer = provider.getSigner();
  } else {
    console.log(
      "Please install Metamask on this browser or give access to this web page!"
    );
    Prompt.create({
      title: "No Metamask Found!",
      text: "This app works only with Metamask. Please install Metamask on this browser to continue.",
      type: "warning",
      position: "bottom-right",
      timeout: 5000,
    });
  }
  return selectedAccount;
}

async function checkNFT(account) {
  console.log("Checking NFT for...", account);
  try {
    // const utility = await dripSDK.getUtility({});
    // console.log(utility);
    console.log(utilityId)
    console.log(account)
    const res = await dripSDK.hasAccess(utilityId, account);
    console.log("Verification Status", res);
    if(res) {
        updateAccessState(true);
    } else {
        Prompt.create({
            title: "Unauthorised",
            text: "You do not have required NFT to view this post! Try switching account or wallet and trying again.",
            type: "error",
            position: "bottom-right",
            timeout: 5000,
          });
    }
  } catch (e) {
    console.error("You are not verified!!");
    Prompt.create({
        title: "Unauthorised 2",
        text: "You do not have required NFT to view this post! Try switching account or wallet and trying again.",
        type: "error",
        position: "bottom-right",
        timeout: 5000,
      });
  }
//   await callDripVerse(uri, "post", data);
  return;
}

function updateAccessState(state) {
  if (state === true) {
    showData();
  } else {
    hideData();
  }
}

$("#connect-wallet-btn").click(async function (e) {
  e.preventDefault();
  console.log("Authenticating...");
  await connectWallet();
  console.log("Metamask Conneced!");
  await checkNFT(selectedAccount);
});

// async function callDripVerse(uri, method, data) {
//   console.log("uri:", uri);
//   let url = baseUrl + uri;
//   if (method === "get") {
//     await axios({
//       method: method,
//       url: url,
//     })
//       .then(function (response) {
//         console.log("response:", response);
//         return response;
//       })
//       .catch(function (error) {
//         console.log("error:", error);
//         return null;
//       });
//   } else {
//     await axios({
//       method: method,
//       url: url,
//       data: data,
//     })
//       .then(function (response) {
//         console.log("response:", response);
//         if (response.status === 200) {
//           console.log("Success!");
//           Prompt.create({
//             title: "Verified",
//             text: "Access Granted!",
//             type: "success",
//             position: "bottom-right",
//             timeout: 5000,
//           });
//           updateAccessState(true);
//           return true;
//         } else {
//           console.log(
//             "You do not have required NFT to view this post! Try switching account or wallet and trying again."
//           );
//           Prompt.create({
//             title: "Unauthorised",
//             text: "You do not have required NFT to view this post! Try switching account or wallet and trying again.",
//             type: "error",
//             position: "bottom-right",
//             timeout: 5000,
//           });
//         }
//         console.log("status:", response.status);
//         return false;
//       })
//       .catch(function (error) {
//         console.log("error:", error);
//         console.log(
//           "You do not have required NFT to view this post! Try switching account or wallet and trying again."
//         );
//         Prompt.create({
//           title: "Unauthorised 2",
//           text: "You do not have required NFT to view this post! Try switching account or wallet and trying again.",
//           type: "error",
//           position: "bottom-right",
//           timeout: 5000,
//         });
//         return null;
//       });
//   }
// }

function parseQueryAccount(address) {
  return address.split("0x")[1];
}
