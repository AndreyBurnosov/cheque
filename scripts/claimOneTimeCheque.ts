import { Address, toNano } from 'ton-core';
import { OneTimeCheque, ClaimFunctions } from '../wrappers/OneTimeCheque';
import { compile, NetworkProvider } from '@ton-community/blueprint';
import { getSecureRandomBytes, sha256 } from 'ton-crypto';

export async function run(provider: NetworkProvider) {
    const passwordString = 'qwerty';
    const password = await sha256(passwordString);
    const address = Address.parse('EQDsD_def8Lmwk45z4UvkSuaDaJfXY8xg4l7XxIk9oOcPfRT');

    const oneTimeCheque = provider.open(
        OneTimeCheque.createFromAddress(Address.parse('EQDcG8GrahmN3Gs3jMWgN-QHBXqK9IbCswAs-WoznMX3Cxdh'))
    );

    await oneTimeCheque.sendClaim({ password: password, address: address });
}
