import { toNano } from 'ton-core';
import { MultiCheque, ClaimFunctions } from '../wrappers/MultiCheque';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { keyPairFromSeed, KeyPair, sha256 } from 'ton-crypto';

export async function run(provider: NetworkProvider) {
    const passwordString = 'qwerty';
    const seed: Buffer = await sha256(passwordString);
    const keypair: KeyPair = keyPairFromSeed(seed);

    const one_use_amount = toNano('0.1');
    const number_of_uses = 1n;
    const amount = number_of_uses * one_use_amount + toNano('0.05');

    const multiCheque = provider.open(
        MultiCheque.createFromConfig(
            {
                publicKey: keypair.publicKey,
                claimCont: ClaimFunctions.toncoin,
                chequeAmount: one_use_amount,
                activaitions: number_of_uses,
                helperCode: await compile('Helper'),
            },
            await compile('MultiCheque')
        )
    );
    await multiCheque.sendDeploy(provider.sender(), amount);

    await provider.waitForDeploy(multiCheque.address);
}
