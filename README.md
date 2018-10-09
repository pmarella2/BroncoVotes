# BroncoVotes: Secure Voting System using Ethereum's Blockchain
## **Description:**
Voting is a fundamental part of democratic systems; it gives individuals in a community the faculty to voice
their opinion. In recent years, voter turnout has diminished while concerns regarding integrity, security, and
accessibility of current voting systems have escalated. E-voting was introduced to address those concerns;
however, it is not cost-effective and still requires full supervision by a central authority. The blockchain is an
emerging, decentralized, and distributed technology that promises to enhance different aspects of many industries.
Expanding e-voting into blockchain technology could be the solution to alleviate the present concerns in
e-voting. In this paper, we propose a blockchain-based voting system, named BroncoVote, that preserves voter
privacy and increases accessibility, while keeping the voting system transparent, secure, and cost-effective.
BroncoVote implements a university-scaled voting framework that utilizes Ethereum’s blockchain and smart
contracts to achieve voter administration and auditable voting records. In addition, BroncoVote utilizes a few
cryptographic techniques, including homomorphic encryption, to promote voter privacy. Our implementation
was deployed on Ethereum’s Testnet to demonstrate usability, scalability, and efficiency.

## **Requirements for compiling and interacting with the Voting DApp:**

### **Operating System**:
Ubuntu 16.xx or higher (make sure to update your OS)

### **Packages**: 
1. Open a terminal (make sure you have permissions to download and install packages)
2. Run these commands to install git, nodejs, npm, and truffle framework
```bash
sudo apt-get install git
sudo apt install nodejs
sudo apt-get install npm
sudo apt-get install build-essential
sudo npm install -g truffle
```

### **The voting DApp itself**:
Go to the directory you want to download the app into:
```bash
git clone https://github.com/pmarella2/BroncoVotes.git BroncoVotes
```
*Alternatively you can click [here](https://github.com/pmarella2/BroncoVotes/archive/master.zip)*

### **Steps to compile and host the voting DApp**:
1. Change into BroncoVotes directory
```bash
cd BroncoVotes
```
2. Open two new terminals in the project directory (so you should have three different terminals in the BroncoVotes directory)
3. In terminal 3, run the nodejs component of BroncoVotes
```bash
cd app/javascripts
node node.js
```
4. In terminal 2, run the virtual memory blockchain (testrpc/ganache-cli)
```bash
./node_modules/.bin/ganache-cli
```
5. In terminal 1, we will compile the voting smart contracts and deploy them onto the virtual memory blockchain
```bash
truffle migrate
```
6. In terminal 1 again, we will host the voting DApp
 ```bash
npm run dev
```

### **Interacting with the voting DApp**:
1. You can now interact with the DApp by navigating to *localhost:8080* in your choice of browser

## **Troubleshooting:**
Open an issue if there are any problems with compiling and running the DApp

## **Acknowledgements:**
I want to thank NSF and the ISPM research lab for providing the grant and resources to conduct this research project. I would also like to extend my thanks to Mahesh Murthy and Truffle team for providing the structure/tools for smart contract and web DApp development.
