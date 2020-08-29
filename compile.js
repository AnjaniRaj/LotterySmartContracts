// for consistency across os
const path = require('path');
const fs =require('fs');
const solc = require('solc');

const lotteryPath= path.resolve(__dirname,'contracts','Lottery.sol');
const source = fs.readFileSync(lotteryPath,'utf8');

//log solc.compile to get a view of the output
console.log(solc.compile(source,1).contracts[':Lottery'])

module.exports = solc.compile(source,1).contracts[':Lottery'];

