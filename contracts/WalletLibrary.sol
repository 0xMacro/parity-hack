// SPDX-License-Identifier: MIT

pragma solidity 0.8.2;

contract WalletLibrary {
    address owner;

    function initWallet (address _owner) public {
        owner = _owner;
    }

    function changeOwner(address _new_owner) external {
        require(msg.sender == owner);
        owner = (_new_owner);
    }

    fallback () external payable {
        // ... receive money, log events, ...
    }

    function withdraw(uint256 amount) public returns (bool) {
        require(msg.sender == owner);
        (bool success, ) = payable(owner).call{value:amount}("");
        return success;
    }
}
