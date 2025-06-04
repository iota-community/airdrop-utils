module airdrop::airdrop_test {

    // use std::debug;
    use iota::coin::{Coin, Self};
    use iota::iota::IOTA;
    use airdrop::airdrop;
    use iota::test_scenario;
    use iota::test_utils::{assert_eq};

    #[test]
    public fun test_airdrop() {
        let admin = @0xAD123;
        let recipient1: address = @0x0;
        let amount1: u64 = 1_000_000;
        let recipient2: address = @0x12;
        let amount2: u64 = 2_000_000;
        let totalAmount: u64 = amount1 + amount2 + 1_000_000; // 1_000_000 is the leftover for the sender
        let mut ts = test_scenario::begin(admin);

        let coin = coin::mint_for_testing<IOTA>(totalAmount, ts.ctx());

        // Prepare test data
        let recipients = vector[recipient1, recipient2];
        let amounts = vector[amount1, amount2];

        // Call the airdrop function
        airdrop::airdrop_now(coin, recipients, amounts , ts.ctx());

        ts.next_tx(recipient1);
        {
            let airdrop_coin = ts.take_from_sender<Coin<IOTA>>();
            assert_eq(airdrop_coin.value(), amount1);

            ts.return_to_sender(airdrop_coin);
        };
        
        ts.end();
    }
}
