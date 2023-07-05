import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from 'ton-core';

export type MultiChequeConfig = {
    passwordHash: bigint;
    claimCont: Cell;
    chequeAmount: bigint;
};

export function multiChequeConfigToCell(config: MultiChequeConfig): Cell {
    return beginCell()
        .storeUint(config.passwordHash, 256)
        .storeRef(config.claimCont)
        .storeCoins(config.chequeAmount)
        .storeDict()
        .endCell();
}

export const Opcodes = {
    claim: 0x12a5fe4d,
};

export const ClaimFunctions = {
    toncoin: Cell.fromBoc(
        Buffer.from('B5EE9C7201010101001700002A8E138018C8CB05CE70FA027001CB6AC9810080FB00', 'hex')
    )[0],
};

export class MultiCheque implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new MultiCheque(address);
    }

    static createFromConfig(config: MultiChequeConfig, code: Cell, workchain = 0) {
        const data = multiChequeConfigToCell(config);
        const init = { code, data };
        return new MultiCheque(contractAddress(workchain, init), init);
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
