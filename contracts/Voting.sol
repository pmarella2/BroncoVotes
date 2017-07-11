pragma solidity ^0.4.10;

contract Voting {

    struct Ballot {
        uint8 ballotType;
        uint32 ballotId;
        uint8 voteLimit;
        uint32 timeLimit;
        string title;
        uint8 whitelist;
    }

    struct Candidates {
        bytes32[] candidateList;
        mapping (bytes32 => bytes32) candidateHash;
        mapping (bytes32 => uint256) votesReceived;
    }

    struct Voter {
        bytes32[] whitelisted;
        mapping (address => uint8) attemptedVotes;
    }

    Candidates c;
    Voter v;
    Ballot b;

    string convertCandidate;
    string tempTitle;
    bytes32 tempCandidate;
    uint8 tempVote;
    bytes32 tempEmail;
    address owner;

    function Voting(uint32 _timeLimit, uint8 _ballotType, uint8 _voteLimit, uint32 _ballotId, string _title, uint8 _whitelist, address _owner) {
        b.timeLimit = _timeLimit;
        b.ballotType = _ballotType;
        b.voteLimit = _voteLimit;
        b.ballotId = _ballotId;
        b.title = _title;
        b.whitelist = _whitelist;

        owner = _owner;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function bytes32ToString(bytes32 x) constant returns (string) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    }

    function voteForCandidate(uint256 eVote, bytes32 cHash, uint32 _currentTime, bytes32 _email) {
        if (checkTimelimit(_currentTime) == false || checkVoteattempts() == false || validCandidate(cHash) == false) revert();
        if (checkWhitelist() == true && checkifWhitelisted(_email) == false) revert();
        v.attemptedVotes[msg.sender] += 1;
        c.votesReceived[cHash] = eVote;
    }

    function votesFor(bytes32 cHash) constant returns (uint256){
        if (validCandidate(cHash) == false) revert();
        return c.votesReceived[cHash];
    }

    function setCandidates(bytes32 _candidate) onlyOwner {
        c.candidateList.push(_candidate);
    }

    function setWhitelisted(bytes32 _email) onlyOwner {
        v.whitelisted.push(_email);
    }

    function setupCands() onlyOwner {
        tempVote = 1;
        for(uint i = 0; i < c.candidateList.length; i++) {
            tempCandidate = c.candidateList[i];
            convertCandidate = bytes32ToString(tempCandidate);
            c.candidateHash[tempCandidate] = keccak256(convertCandidate);
            c.votesReceived[keccak256(convertCandidate)] = tempVote;
        }
    }

    function totalVotesFor(bytes32 cHash, uint32 _currentTime) constant returns (uint256){
        if (checkBallottype() == false && checkTimelimit(_currentTime) == true) return 0;
        if (validCandidate(cHash) == false) revert();
        return c.votesReceived[cHash];
    }

    function validCandidate(bytes32 cHash) constant returns (bool) {
        for(uint k = 0; k < c.candidateList.length; k++) {
            tempCandidate = c.candidateList[k];
            if (c.candidateHash[tempCandidate] == cHash) {
                return true;
            }
        }
        return false;
    }

    function candidateList(uint64 _ballotID) constant returns (bytes32[]) {
        if (checkballotID(_ballotID) == false) revert();
        return c.candidateList;
    }

    function checkTimelimit(uint32 currentTime) constant returns (bool) {
        if (currentTime >= b.timeLimit) return false;
        else return true;
    }

    function checkBallottype() constant returns (bool) {
        if (b.ballotType == 1) return false;
        else return true;
    }

    function checkballotID(uint64 ballotID) constant returns (bool) {
        if (ballotID == b.ballotId) return true;
        else return false;
    }

    function checkVoteattempts() constant returns (bool) {
        if (v.attemptedVotes[msg.sender] == b.voteLimit) return false;
        else return true;
    }

    function checkWhitelist() constant returns (bool) {
        if (b.whitelist == 1) return true;
        else return false;
    }

    function checkifWhitelisted(bytes32 email) constant returns (bool) {
        for(uint j = 0; j < v.whitelisted.length; j++) {
            tempEmail = v.whitelisted[j];
            if (tempEmail == email) {
                return true;
            }
        }
        return false;
    }

    function getTimelimit() constant returns (uint32) {
        return b.timeLimit;
    }

    function getTitle() constant returns (string) {
        return b.title;
    }
}
