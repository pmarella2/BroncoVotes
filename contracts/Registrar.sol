pragma solidity ^0.4.19;

contract Registrar {

    struct Voter {
        bytes32[] allowedDomains;
        mapping (bytes32 => address) voterAddr;
        mapping (bytes32 => uint8) createPerm;
        mapping (bytes32 => uint16) voterID;
        mapping (uint16 => bytes32) voterEmail;
    }

    struct Ballot {
        mapping (uint32 => address) votingAddress;
        mapping (address => uint32) ballotID;
        mapping (uint64 => uint8) whitelistCheck;
        mapping (bytes32 => uint8) allowedVoters;
    }

    Voter v;
    Ballot b;
    address owner;

    function Registrar(bytes32[] domainList) public {
        v.allowedDomains = domainList;
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function registerVoter(bytes32 email, uint16 idnum, bytes32 _domain, uint8 _permreq) public {
        if (domainCheck(_domain) == false) revert();
        v.voterID[email] = idnum;
        v.createPerm[email] = _permreq;
        v.voterAddr[email] = msg.sender;
        v.voterEmail[idnum] = email;
    }

    function givePermission(bytes32 email) public onlyOwner {
        v.createPerm[email] = 1;
    }

    function addDomains(bytes32 _domain) public onlyOwner {
        v.allowedDomains.push(_domain);
    }

    function domainCheck(bytes32 domain) public view returns (bool) {
        for(uint i = 0; i < v.allowedDomains.length; i++) {
            if (v.allowedDomains[i] == domain) {
                return true;
            }
        }
        return false;
    }

    function checkReg(bytes32 email, uint16 idnum) public view returns (bool) {
        if (v.voterID[email] == 0 && v.voterEmail[idnum] == 0) return true;
        else return false;
    }

    function checkVoter(bytes32 email) public view returns (uint8) {
        if (v.voterID[email] == 0) return 1;
        if (v.voterAddr[email] != msg.sender) return 2;
        else return 0;
    }

    function setAddress(address _ballotAddr, uint32 _ballotID) public {
        b.votingAddress[_ballotID] = _ballotAddr;
        b.ballotID[_ballotAddr] = _ballotID;
    }

    function getAddress(uint32 _ballotID) public view returns (address) {
        return b.votingAddress[_ballotID];
    }

    function getPermission(bytes32 _email) public view returns (uint8) {
        return v.createPerm[_email];
    }
}
