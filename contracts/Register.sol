pragma solidity ^0.4.10;

contract Register {

    struct Voter {
        bytes32[] allowedDomains;
        mapping (bytes32 => address) voterAddr;
        mapping (bytes32 => uint8) createPerm;
        mapping (bytes32 => uint16) voterID;
    }

    struct Ballot {
        mapping (uint64 => address) votingAddress;
        mapping (uint64 => uint8) whitelistCheck;
        mapping (bytes32 => uint8) allowedVoters;

    }

    Voter v;
    Ballot b;
    address owner;

    function Register(bytes32[] domainList) {
        v.allowedDomains = domainList;
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function registerVoter(bytes32 email, uint16 idnum, bytes32 _domain) {
        if (domainCheck(_domain) == false) throw;
        v.voterID[email] = idnum;
        v.createPerm[email] = 1;
    }

    function givePermission(bytes32 email) onlyOwner {
        v.createPerm[email] = 1;
    }

    function domainCheck(bytes32 domain) constant returns (bool) {
        for(uint i = 0; i < v.allowedDomains.length; i++) {
            if (v.allowedDomains[i] == domain) {
                return true;
            }
        }
        return false;
    }

    function checkVoter(bytes32 email) constant returns (bool) {
        if (v.voterID[email] == 0) return true;
        else return false;
    }

    function getAddress(uint64 ballotID) constant returns (address) {
        return b.votingAddress[ballotID];
    }

    function getPermission(bytes32 email) constant returns (uint8) {
        return v.createPerm[email];
    }

}
