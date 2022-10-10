'use strict';

var provider;
var selectedAccount = null;
var signer;
var contractAddress = '';
var baseUrl = '';
var projectId = '2';
var utilityId = '4';

function setBaseUrl() {
    console.log('host:', window.location.host);
    console.log('check:', window.location.host.includes('localhost'));
    if (window.location.host.includes('localhost')) {
        baseUrl = 'http://localhost:3001';
    } else {
        baseUrl = 'https://api.dripverse.org';
    }
}

function showData() {
    $('#content-wrap').removeClass('hidden');
    $('#connect-wallet-container').addClass('hidden');
}

function hideData() {
    $('#content-wrap').addClass('hidden');
    $('#connect-wallet-container').removeClass('hidden');
}

(async function () {
    setBaseUrl();
    console.log('baseUrl:', baseUrl);
    if (baseUrl.length > 0) {
        updateAccessState(false);
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
            } else {
                await connectWallet();
                console.log('selectedAccount:', selectedAccount);
            }
        }
    } else {
        console.log('Unknown Domain. Please contact support@dripverse.org!');
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
    let uri = '/v1/utility/verify?p='+projectId;
    let data = {
        utilityId: utilityId,
        account: account
    };
    let nftExists = await callDripVerse(uri, 'post', data);
    console.log('nftExists:', nftExists);
    if (nftExists && nftExists!== undefined) {
        console.log('show data');
        updateAccessState(true);
    } else {
        console.log('You do not have required NFT to view this post! Try switching account or wallet and trying again.');
    }
    return;
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

async function callDripVerse(uri, method, data) {
    console.log('uri:', uri);
    let url = baseUrl + uri;
    if (method === 'get') {
        await axios({
            method: method,
            url: url
        }).then(function (response) {
            console.log('response:', response);
            return response;
        }).catch(function (error) {
            console.log('error:', error);
            return null;
        });
    } else {
        await axios({
            method: method,
            url: url,
            data: data
        }).then(function (response) {
            console.log('response:', response);
            if (response.status === 200) {
                console.log('Success!');
                return true;
            }
            console.log('status:', response.status);
            return false;
        }).catch(function (error) {
            console.log('error:', error);
            return null;
        });
    }
    
}

function parseQueryAccount(address) {
    return address.split('0x')[1];
}
