// SPDX-Licen se-Identifier: MIT

pragma solidity ^0.8.2;

contract Wallet {
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
    
    function deposit() external payable {
        (bool success, ) = _walletLibrary.delegatecall(msg.data);
        require(success, "library call failed");
    }
    
    fallback() external payable {
        (bool success, ) = _walletLibrary.delegatecall(msg.data);
        require(success, "library call failed");
    }
}
