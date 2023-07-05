import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, beginCell, toNano } from 'ton-core';
import { MultiCheque, ClaimFunctions } from '../wrappers/MultiCheque';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { getSecureRandomBytes, sha256 } from 'ton-crypto';
import { randomAddress } from '@ton-community/test-utils';

describe('MultiCheque', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('MultiCheque');
    });

    let blockchain: Blockchain;
    let multiCheque: SandboxContract<MultiCheque>;
    let deployer: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
    });

    it('should deploy simple cheque', async () => {
        const password: Buffer = await getSecureRandomBytes(32);

        multiCheque = blockchain.openContract(
            MultiCheque.createFromConfig(
                {
                    passwordHash: BigInt((await sha256(password)).readUInt32BE()),
                    claimCont: ClaimFunctions.toncoin,
                    chequeAmount: toNano('1'),
                },
                code
            )
        );

        const deployResult = await multiCheque.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: multiCheque.address,
            deploy: true,
            success: true,
        });
    });

    it('should claim simple cheque', async () => {});
});
