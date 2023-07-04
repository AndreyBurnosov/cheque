import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { OneTimeCheque, ClaimFunctions } from '../wrappers/OneTimeCheque';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { getSecureRandomBytes, sha256 } from 'ton-crypto';

describe('OneTimeCheque', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('OneTimeCheque');
    });

    let blockchain: Blockchain;
    let oneTimeCheque: SandboxContract<OneTimeCheque>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
    });

    it('should deploy', async () => {
        const password: Buffer = await getSecureRandomBytes(32);

        oneTimeCheque = blockchain.openContract(
            OneTimeCheque.createFromConfig(
                {
                    passwordHash: BigInt((await sha256(password)).readInt32BE()),
                    claimCont: ClaimFunctions.toncoin,
                },
                code
            )
        );

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await oneTimeCheque.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: oneTimeCheque.address,
            deploy: true,
            success: true,
        });
    });
});
