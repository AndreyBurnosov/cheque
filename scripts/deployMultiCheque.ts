import { toNano } from 'ton-core';
import { MultiCheque } from '../wrappers/MultiCheque';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const multiCheque = provider.open(MultiCheque.createFromConfig({}, await compile('MultiCheque')));

    await multiCheque.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(multiCheque.address);

    // run methods on `multiCheque`
}
