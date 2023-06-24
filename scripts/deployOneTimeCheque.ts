import { toNano } from 'ton-core';
import { OneTimeCheque } from '../wrappers/OneTimeCheque';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const oneTimeCheque = provider.open(
        OneTimeCheque.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('OneTimeCheque')
        )
    );

    await oneTimeCheque.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(oneTimeCheque.address);

    console.log('ID', await oneTimeCheque.getID());
}
