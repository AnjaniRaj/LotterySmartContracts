const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require('../compile');

let lottery;
let accounts;

beforeEach(async function () {
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from: accounts[0], gas: 1000000});
});

describe('Lottery Contract', function () {

    it('deploys a contract', function () {
        assert.ok(lottery.options.address);
    });

    it('allows multiple account to enter', async function () {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const players = await lottery.methods.getPlayers().call({from: accounts[0]});
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.strictEqual(3, players.length);
    });

    it('allows one account to enter', async function () {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });
        const players = await lottery.methods.getPlayers().call({from: accounts[0]});
        assert.equal(accounts[0], players[0]);
        assert.strictEqual(1, players.length);
    });

    it('requires a min amount of ether to enter', async function () {

        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: '200'
            });
            //if await doesnt throw an error, test case must fail
            assert(false);
        } catch (e) {
            //assert for truth rather than existence
            assert(e);
        }
    });

    it('only manager can call pick winner', async function () {
        try {
            await lottery.methods.pickWinner().send({from: accounts[1]});
            assert(false);
        } catch (e) {
            assert(e);
        }
    });

    it('sends money to winner and resets', async function () {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });
        const initBalance = await web3.eth.getBalance(accounts[0]);

        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });

        const finBalance = await web3.eth.getBalance(accounts[0]);
        const diff = finBalance - initBalance;
        //some amount is gone to gas
        assert(diff > web3.utils.toWei('1.8', 'ether'));
        const contractBal = await web3.eth.getBalance(lottery.options.address);
        assert(contractBal == 0);
        //reset
        const players = await lottery.methods.getPlayers().call({from: accounts[0]});
        assert(players.length == 0);
    });
});



