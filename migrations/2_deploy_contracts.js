var Voting = artifacts.require("./Voting.sol");
var Registrar = artifacts.require("./Registrar.sol")
var Creator = artifacts.require("./Creator.sol")

module.exports = function(deployer) {
    deployer.deploy(Voting, 1499573503, 1, 5, 1234567890, 'Testing Phase Ballot', 0, 0, '0x1e376f3b3d7afba2a8ca5ff288e7f5d9585fdae8', {
        gas: 2000000
    });
    deployer.deploy(Registrar, ['boisestate.edu', 'u.boisestate.edu'], {
        gas: 800000
    });
    deployer.deploy(Creator, {
        gas: 2000000
    });
};
