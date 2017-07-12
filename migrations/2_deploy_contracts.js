var Voting = artifacts.require("./Voting.sol");
var Register = artifacts.require("./Register.sol")
var Creator = artifacts.require("./Creator.sol")

module.exports = function(deployer) {
    deployer.deploy(Voting, 1499573503, 1, 5, 1234567890, 'Testing Phase Ballot', 0, '0x1e376f3b3d7afba2a8ca5ff288e7f5d9585fdae8', {
        gas: 1350000
    });
    deployer.deploy(Register, ['boisestate.edu', 'u.boisestate.edu'], {
        gas: 600000
    });
    deployer.deploy(Creator, {
        gas: 1750000
    });
};
