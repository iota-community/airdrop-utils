/// Module: airdrop
module airdrop::airdrop {
    use iota::coin::{Self, Coin};
    use iota::iota::IOTA;

    #[allow(lint(self_transfer))]
    public fun airdrop_now(
        mut payment: Coin<IOTA>,
        recipients: vector<address>,
        amounts: vector<u64>,
        ctx: &mut TxContext
    ) {
        let len_recipients = vector::length(&recipients);
        let len_amounts = vector::length(&amounts);
        assert!(len_recipients == len_amounts, 0);

        let mut i = 0;
        while (i < len_recipients) {
            let amount = *vector::borrow(&amounts, i);
            let recipient = *vector::borrow(&recipients, i);

            let split_coin = coin::split(&mut payment, amount, ctx);
            transfer::public_transfer(split_coin, recipient);

            i = i + 1;
        };

        let remaining = coin::value(&payment);
        if (remaining == 0) {
            coin::destroy_zero(payment);
        } else {
            transfer::public_transfer(payment, tx_context::sender(ctx));
        }
    }
}
