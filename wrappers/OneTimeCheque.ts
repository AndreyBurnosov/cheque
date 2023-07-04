import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type OneTimeChequeConfig = {
    passwordHash: bigint;
    claimCont: Cell;
};

export function oneTimeChequeConfigToCell(config: OneTimeChequeConfig): Cell {
    return beginCell().storeInt(config.passwordHash, 256).storeRef(config.claimCont).endCell();
}

export const Opcodes = {
    claim: 0x12a5fe4d,
};

export const ClaimFunctions = {
    toncoin: Cell.fromBoc(Buffer.from('B5EE9C720101010100150000268018C8CB05CE70FA027001CB6AC9810080FB00', 'hex'))[0],
};

export class OneTimeCheque implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new OneTimeCheque(address);
    }

    static createFromConfig(config: OneTimeChequeConfig, code: Cell, workchain = 0) {
        const data = oneTimeChequeConfigToCell(config);
        const init = { code, data };
        return new OneTimeCheque(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendClaim(
        provider: ContractProvider,
        opts: {
            password: Buffer;
            address: Address;
        }
    ) {
        await provider.external(
            beginCell().storeUint(Opcodes.claim, 32).storeBuffer(opts.password).storeAddress(opts.address).endCell()
        );
    }
}
