'use strict';

var provider;
var selectedAccount = null;
var signer;

function showData() {
    $('#content-wrap').removeClass('hidden');
    $('#connect-wallet-container').addClass('hidden');
}

function hideData() {
    $('#content-wrap').addClass('hidden');
    $('#connect-wallet-container').removeClass('hidden');
}

(async function () {
    hideData();
    // Check Injected Metamask
    if (await checkMetamask() === true) {
        console.log('Metamask Found. Checking for account access...');
        console.log('selectedAccount:', selectedAccount);
        if(selectedAccount !== null) {
            console.log('Account Selected:', selectedAccount);
            await checkNFT(selectedAccount);
            // if (checkNFT(account)) {
            //     showData();
            // }
        }
    }
})();

async function checkMetamask() {
    console.log('Checking Metamask...');
    let metamaskFound = false;
    if (window.ethereum !== undefined) {
        metamaskFound = true;
    } else {
        console.log('No Metamask Detected!');
    }
    return metamaskFound;
}

async function connectWallet() {
    console.log('Connecting Metamask...', window.ethereum);
    if(window.ethereum !== undefined) {
        provider = new ethers.providers.Web3Provider(window.ethereum)
        let accounts = await provider.send("eth_requestAccounts", []);
        selectedAccount = accounts[0];
        signer = provider.getSigner();
    } else {
        console.log('Please install Metamask on this browser or give access to this web page!');
    }
    return selectedAccount;
}

async function checkNFT(account) {
    console.log('Checking NFT for...', account);
}

function updateAccessState(state) {
    if (state === true) {
        showData();
    } else {
        hideData();
    }
}

$('#connect-wallet-btn').click(async function(e) {
    e.preventDefault();
    console.log('Authenticating...');
    await connectWallet();
    console.log('Metamask Conneced!');
    await checkNFT(selectedAccount);
});
