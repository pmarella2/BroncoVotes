var Voting = artifacts.require("./Voting.sol");
var Register = artifacts.require("./Register.sol")
var Creator = artifacts.require("./Creator.sol")

module.exports = function(deployer) {
    deployer.deploy(Voting, ['Morty', 'Kenny', 'Zoidberg', 'Rick', 'Mackey'], 1499573503, 1, 5, 1234567890, 'Testing Phase Ballot', 0, [], {
        gas: 2100000
    });
    deployer.deploy(Register, ['boisestate.edu', 'u.boisestate.edu'], {
        gas: 2100000
    });
    deployer.deploy(Creator, {
        gas: 2100000
    });
};
