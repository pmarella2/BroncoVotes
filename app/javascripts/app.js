import '../stylesheets/app.css'

import {
    default as Web3
} from 'web3'
import {
    default as contract
} from 'truffle-contract'
import {
    sha3withsize
} from 'solidity-sha3'
import {
    default as HookedWeb3Provider
} from 'hooked-web3-provider'
import {
    default as lightwallet
} from 'eth-lightwallet'


import register_artifacts from '../../build/contracts/Register.json'
import voting_artifacts from '../../build/contracts/Voting.json'
import creator_artifacts from '../../build/contracts/Creator.json'



var Register = contract(register_artifacts)
var Voting = contract(voting_artifacts)
var Creator = contract(creator_artifacts)
var input1 = 1
var input2 = 0
var timestamp

var ballotID

let candidates = {}

window.loadBallot = function() {
    ballotID = $("#ballotid").val()

    Register.deployed().then(function(contract) {
        contract.getAddress.call(ballotID).then(function(v) {
            var votingAddress = v.toString();
            if (votingAddress == 0) {
                $("#msg4").html("Invalid ballot ID!")
                throw new Error()
            } else {
                $("#msg4").html("Setting up ballot...")
                $("#ballotid").val("")
                getCandidates(votingAddress, ballotID)
            }
        })
    })
}

window.voteForCandidate = function(candidate) {
    let candidateName = $("#candidate").val()
    let email = $("#e-mail").val()
    $("#msg2").html("")
    $("#msg4").html("")

    var domain = email.replace(/.*@/, "")
    var cHash = sha3withsize(candidateName, 32)

    Register.deployed().then(function(contract) {
        contract.checkVoter.call(email).then(function(v) {
            var emailCheck = v.toString()

            if (emailCheck == "true") {
                $("#msg").html("E-mail address not registered!")
                throw new Error()
            }

            contract.getAddress.call(ballotID).then(function(v) {
                var votingAddress = v.toString();

                Voting.at(votingAddress).then(function(contract) {
                    contract.checkWhitelist.call().then(function(v) {
                        let wc1 = v.toString()
                        contract.checkifWhitelisted.call(email).then(function(v) {
                            let wc2 = v.toString()
                            if (wc1 == "true" && wc2 == "false") {
                                $("#msg").html("You're are not authorized to vote on this ballot!")
                                throw new Error()
                            } else {
                                contract.validCandidate.call(cHash).then(function(v) {
                                    var candValid = v.toString()

                                    if (candValid == "false") {
                                        $("#msg").html("Invalid Candidate!")
                                        throw new Error()
                                    }
                                    contract.checkVoteattempts.call().then(function(v) {

                                        var attempCheck = v.toString()

                                        if (attempCheck == "false") {
                                            $("#msg").html("You have reached your voting limit for this ballot/poll!")
                                            throw new Error()
                                        }
                                        $("#msg").html("Your vote attempt has been submitted. Please wait for verification.")
                                        $("#candidate").val("")
                                        $("#e-mail").val("")

                                        contract.candidateList.call(ballotID).then(function(candidateArray) {
                                            for (let i = 0; i < candidateArray.length; i++) {
                                                let hcand = (web3.toUtf8(candidateArray[i]))
                                                let hcHash = sha3withsize(hcand, 32)

                                                if (hcHash == cHash) {
                                                    encrypt(hcHash, input1, i, candidateArray, email, votingAddress)
                                                } else {
                                                    encrypt(hcHash, input2, i, candidateArray, email, votingAddress)
                                                }
                                            }
                                        })
                                    })
                                })
                            }
                        })
                    })
                })
            })
        })
    })
}

function encrypt(hcHash, vnum, i, candidateArray, email, votingAddress) {
    var einput1
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/encrypt/" + vnum,
        success: function(eoutput1) {
            Voting.at(votingAddress).then(function(contract) {
                contract.votesFor.call(hcHash).then(function(v) {
                    einput1 = v.toString()
                    einput1 = scientificToDecimal(einput1)

                    if (einput1 != 0) {
                        add(eoutput1, einput1, hcHash, i, candidateArray, email, votingAddress)
                    }
                })
            })
        }
    })
}

function add(eoutput1, einput1, hcHash, i, candidateArray, email, votingAddress) {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/add/" + eoutput1 + "/" + einput1,
        success: function(eadd1) {
            vgetTimestamp(eadd1, hcHash, i, candidateArray, email, votingAddress)
        }
    })
}

function decrypt(convVote, name) {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/decrypt/" + convVote,
        success: function(eoutput) {
            var voteNum = eoutput
            $("#" + candidates[name]).html(voteNum.toString())
        }
    })
}

function vgetTimestamp(eadd1, hcHash, i, candidateArray, email, votingAddress) {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/getTime",
        success: function(timestamp) {
            Voting.at(votingAddress).then(function(contract) {
                contract.checkTimelimit.call(timestamp).then(function(v) {
                    var timecheck = v.toString()
                    if (timecheck == "false") {
                        contract.getTimelimit.call().then(function(v) {
                            var endtime = v.toString()
                            endtime = new Date(endtime * 1000)
                            getVotes()
                            $("#msg").html("Voting period for this ballot has ended on " + endtime)
                            throw new Error()
                        })
                    } else {
                        vote(eadd1, hcHash, i, candidateArray, timestamp, email, votingAddress)
                    }
                })
            })
        }
    })
}

function vote(vote, hcHash, i, candidateArray, timestamp, email, votingAddress) {
    Voting.at(votingAddress).then(function(contract) {
        contract.voteForCandidate(vote, hcHash, timestamp, email, {
            gas: 1200000,
            from: web3.eth.accounts[0]
        }).then(function() {
            if (i == candidateArray.length - 1) {
                getVotes(votingAddress)
                $("#msg").html("")
                window.alert("Your vote has been verified!")
            }
        })
    })
}


window.registerToVote = function() {
    let idNumber = $("#idnum").val()
    let email = $("#email").val()
    let permreq = $("input[name=permreq]:checked").val()

    if (permreq != 1) {
        permreq = 0;
    }

    var domain = email.replace(/.*@/, "")

    Register.deployed().then(function(contract) {
        contract.domainCheck.call(domain).then(function(v) {
            var domainValid = v.toString()

            if (domainValid == "false") {
                $("#msg2").html("Invalid e-mail address!")
                throw new Error()
            }

            contract.checkVoter.call(email).then(function(v) {
                var emailValid = v.toString()

                if (emailValid == "false") {
                    $("#msg2").html("E-mail already registered to vote!")
                    throw new Error()
                }

                $("#idnum").val("")
                $("#email").val("")

                contract.registerVoter(email, idNumber, domain, permreq, {
                    gas: 1200000,
                    from: web3.eth.accounts[0]
                }).then(function() {
                    $("#msg2").html("Account ready to vote!")
                })
            })
        })
        $("#msg2").html("Registration attempt successful! Please wait for verification.")
    })

}

window.ballotSetup = function() {
    let cemail = $("#cemail").val()

    Register.deployed().then(function(contract) {
        contract.getPermission.call(cemail).then(function(v) {
            let emailCheck = v.toString()
            if (emailCheck == 0) {
                $("#msg3").html("You are not authorized to create ballots! Please contact admin to request authorization.")
                throw new Error()
            } else {
                let date = $("#date").val()
                var enddate = (Date.parse(date).getTime() / 1000)
                enddate += 86340
                let ballottype = $("input[name=ballottype]:checked").val()
                let title = $("#vtitle").val()
                let choices = $("#choices").val()
                var choicesArray = choices.split(',')
                let votelimit = $("#votelimit").val()
                votelimit = votelimit * (choicesArray.length)
                let whitelist = $("input[name=whitelist]:checked").val()
                let whitelisted = $("#whitelisted").val()
                var whitelistedArray = whitelisted.split(',')
                let ballotid = Math.floor(Math.random() * 4294967295)

                Creator.deployed().then(function(contract) {
                    contract.createBallot(enddate, ballottype, votelimit, ballotid, title, whitelist, {
                        gas: 2500000,
                        from: web3.eth.accounts[0]
                    }).then(function() {
                        contract.getAddress.call(ballotid).then(function(v) {
                            var votingAddress = v.toString()
                            //window.alert(votingAddress)
                            fillSetup(votingAddress, choicesArray, whitelistedArray, whitelist, ballotid)
                            registerBallot(votingAddress, ballotid)
                        })
                    })
                })
            }
        })
    })
}

function registerBallot(votingaddress, ballotid) {
    Register.deployed().then(function(contract) {
        contract.setAddress(votingaddress, ballotid, {
            gas: 2500000,
            from: web3.eth.accounts[0]
        }).then(function() {
            window.alert("Ballot creation successful! Ballot ID: " + ballotid + "\nPlease write the down the Ballot ID because it will be used to load your ballot allowing users to vote")
        })
    })
}

function fillSetup(votingAddress, choicesArray, whitelistedArray, whitelist, ballotid) {
    for (let i = 0; i < choicesArray.length; i++) {
        let choice = choicesArray[i]
        fillCandidates(votingAddress, choice, choicesArray, i)
    }

    if (whitelist == 1) {
        for (let j = 0; j < whitelistedArray.length; j++) {
            let whitelisted = whitelistedArray[j]
            fillWhitelisted(votingAddress, whitelisted)
        }
    }
}

function fillCandidates(votingAddress, choice, choicesArray, i) {
    Voting.at(votingAddress).then(function(contract) {
        contract.setCandidates(choice, {
            gas: 2500000,
            from: web3.eth.accounts[0]
        }).then(function() {
            if (i == choicesArray.length - 1) {
                contract.setupCands({
                    gas: 2500000,
                    from: web3.eth.accounts[0]
                }).then(function() {
                    //
                })
            }
        })
    })
}

function fillWhitelisted(votingAddress, whitelisted) {
    Voting.at(votingAddress).then(function(contract) {
        contract.setWhitelisted(whitelisted, {
            gas: 2500000,
            from: web3.eth.accounts[0]
        }).then(function() {
            //
        })
    })
}

/*function cgetTimestamp(enddate, ballottype, votelimit, ballotid, title, whitelist) {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/getTime",
        success: function(timestamp) {
            window.alert(timestamp)
            createBallot(timestamp, enddate, ballotid)
        }
    })
}*/

$(document).ready(function() {

    /*var provider = new HookedWeb3Provider({
        host: "http://localhost:8545",
        transaction_signer: ks
    });*/

    //window.web3 = provider;
    //window.web3.setProvider(provider);
    //window.web3 = new Web3(provider);

    if (typeof web3 !== "undefined") {
        window.web3 = new Web3(web3.currentProvider)
    } else {
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
    }

    Register.setProvider(web3.currentProvider)
    Voting.setProvider(web3.currentProvider)
    Creator.setProvider(web3.currentProvider)

    //Register.setProvider(provider);
    //Voting.setProvider(provider);

})

function getCandidates(votingAddress, ballotID) {
    Voting.at(votingAddress).then(function(contract) {
        contract.getTitle.call().then(function(title) {
            $("#btitle").html(title)

            contract.candidateList.call(ballotID).then(function(candidateArray) {
                for (let i = 0; i < candidateArray.length; i++) {
                    candidates[web3.toUtf8(candidateArray[i])] = "candidate-" + i
                }

                setupTable()
                getVotes(votingAddress)
            })
        })
    })
}

function setupTable() {
    Object.keys(candidates).forEach(function(candidate) {
        $("#candidate-rows").append("<tr><td>" + candidate + "</td><td id='" + candidates[candidate] + "'></td></tr>");
    })
}

function getVotes(votingAddress) {
    let candidateNames = Object.keys(candidates)
    for (var i = 0; i < candidateNames.length; i++) {
        let name = candidateNames[i]
        let cvHash = sha3withsize(name, 32)

        $.ajax({
            type: "GET",
            url: "http://localhost:3000/getTime",
            success: function(timestamp) {
                Voting.at(votingAddress).then(function(contract) {
                    contract.totalVotesFor.call(cvHash, timestamp).then(function(v) {

                        var convVote = v.toString()
                        if (convVote == 0) {
                            contract.getTimelimit.call().then(function(v) {
                                var endtime = v.toString()
                                endtime = new Date(endtime * 1000);
                                $("#msg").html("Results will be displayed once the voting period has ended (" + endtime + ")")
                            })
                        } else {
                            convVote = scientificToDecimal(convVote)
                            decrypt(convVote, name)
                        }
                    })
                })
            }
        })
    }
}
