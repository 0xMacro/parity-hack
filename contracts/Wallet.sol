// SPDX-Licen se-Identifier: MIT

pragma solidity ^0.8.2;

contract WalletEvents {

    event Deposit(address _from, uint value);
}

contract WalletLibrary is WalletEvents{
 
    address owner;

    function initWallet (address _owner) public {
        owner = _owner;
        // more initialization logic here...
    }

    function changeOwner(address _new_owner) external {
        require(msg.sender == owner);
        owner = (_new_owner);
    }

    fallback () external payable {
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }
    }

    function withdraw(uint256 amount) public returns (bool) {
        require(msg.sender == owner);
        (bool success, ) = payable(owner).call{value:amount}("");
        return success;
    }
}

contract Wallet is WalletEvents {

    address owner;
    address _walletLibrary;

    constructor (address WalletLib) {
        _walletLibrary = WalletLib;
        (bool success, ) = _walletLibrary.delegatecall(abi.encodeWithSignature("initWallet(address)", msg.sender));
        require(success, "Failed to initialize wallet");
    }

    function withdraw(uint amount) external returns (bool) {
        require(msg.sender == owner, "Only Owner");
        (bool success, ) = _walletLibrary.delegatecall(abi.encodeWithSignature("withdraw(uint256)", amount));
        return success;
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
    
    fallback() external payable {
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }
        else {
            (bool success, ) = _walletLibrary.delegatecall(msg.data);
            require(success, "library call failed");
        }
    }
}
