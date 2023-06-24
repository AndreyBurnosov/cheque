import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { OneTimeCheque } from '../wrappers/OneTimeCheque';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('OneTimeCheque', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('OneTimeCheque');
    });

    let blockchain: Blockchain;
    let oneTimeCheque: SandboxContract<OneTimeCheque>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        oneTimeCheque = blockchain.openContract(
            OneTimeCheque.createFromConfig(
                {
                    id: 0,
                    counter: 0,
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

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and oneTimeCheque are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await oneTimeCheque.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = Math.floor(Math.random() * 100);

            console.log('increasing by', increaseBy);

            const increaseResult = await oneTimeCheque.sendIncrease(increaser.getSender(), {
                increaseBy,
                value: toNano('0.05'),
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: oneTimeCheque.address,
                success: true,
            });

            const counterAfter = await oneTimeCheque.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });
});
