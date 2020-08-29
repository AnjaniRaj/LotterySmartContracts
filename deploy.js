const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile');

const provider = new HDWalletProvider(
    'mnemonic',
    'infura url'
);
const web3 = new Web3(provider);

//made it a fxn so we can use async await
const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    console.log('Attempting to deploy from ', accounts[0]);
    try {
        const txnHash = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({data: '0x' + bytecode})
            .send({from: accounts[0] },function (error,txn) {
                console.log(error)
                console.log(txn)
            }).on('error', function(error){ console.log("In error ",error)})
            .on('transactionHash', function(transactionHash){ console.log("In txn ", transactionHash)})
            .on('receipt', function(receipt){
                console.log(receipt.contractAddress) // contains the new contract address
            })
            .on('confirmation', function(confirmationNumber, receipt){ console.log("in confirmation ", confirmationNumber, receipt) })
            .then(function(newContractInstance){
                console.log("in new contarct " ,newContractInstance.options.address) // instance with the new contract address
            })
    } catch (e) {
        console.log(e);
    }
};

deploy();
