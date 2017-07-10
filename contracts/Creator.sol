pragma solidity ^0.4.10;

contract Voting {

    struct Ballot {
        uint8 ballotType;
        uint64 ballotId;
        uint8 voteLimit;
        uint32 timeLimit;
        string title;
        uint8 whitelisted;
    }

    struct Candidates {
        bytes32[] candidateList;
        mapping (bytes32 => bytes32) candidateHash;
        mapping (bytes32 => uint256) votesReceived;
    }

    struct Voter {
        bytes32[] whitelist;
        mapping (address => uint8) attemptedVotes;
    }

    Candidates c;
    Voter v;
    Ballot b;

    string convertCandidate;
    bytes32 tempCandidate;
    uint8 tempVote;
    bytes32 tempEmail;

    function Voting(bytes32[] candidateNames, uint32 _timeLimit, uint8 _ballotType, uint8 _voteLimit, uint64 _ballotId, string _title, uint8 _whitelisted, bytes32[] _whitelist) {
        c.candidateList = candidateNames;
        b.timeLimit = _timeLimit;
        b.ballotType = _ballotType;
        b.voteLimit = _voteLimit;
        b.ballotId = _ballotId;
        b.title = _title;
        b.whitelisted = _whitelisted;
        v.whitelist = _whitelist;

        tempVote = 1;
        for(uint i = 0; i < c.candidateList.length; i++) {
            tempCandidate = c.candidateList[i];
            convertCandidate = bytes32ToString(tempCandidate);
            c.candidateHash[tempCandidate] = keccak256(convertCandidate);
            c.votesReceived[keccak256(convertCandidate)] = tempVote;
        }
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
        if (checkTimelimit(_currentTime) == false || checkVoteattempts() == false || validCandidate(cHash) == false) throw;
        if (checkWhitelist() == true && checkifWhitelisted(_email) == false) throw;
        v.attemptedVotes[msg.sender] += 1;
        c.votesReceived[cHash] = eVote;
    }

    function votesFor(bytes32 cHash) constant returns (uint256){
        if (validCandidate(cHash) == false) throw;
        return c.votesReceived[cHash];
    }

    function totalVotesFor(bytes32 cHash, uint32 _currentTime) constant returns (uint256){
        if (checkBallottype() == false && checkTimelimit(_currentTime) == true) {
            return 0;
        }
        if (validCandidate(cHash) == false) throw;
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
        if (checkballotID(_ballotID) == false) throw;
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
        if (b.whitelisted == 1) return true;
        else return false;
    }

    function checkifWhitelisted(bytes32 email) constant returns (bool) {
        for(uint j = 0; j < v.whitelist.length; j++) {
            tempEmail = v.whitelist[j];
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

//                         //
//Start of Creator contract//
//                         //

contract Creator {

    address deployedVoting;
    function createBallot(bytes32[] candidateNames, uint32 _timeLimit, uint8 _ballotType, uint8 _voteLimit, uint64 _ballotId, string _title) returns (address){
        deployedVoting = new Voting(candidateNames, _timeLimit, _ballotType, _voteLimit, _ballotId, _title);
        return deployedVoting;
    }
}
