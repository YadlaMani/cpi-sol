const { LiteSVM } = require("litesvm");
const {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} = require("@solana/web3.js");

test("one transfer", () => {
  const svm = new LiteSVM();
  const contract = Keypair.generate();
  svm.addProgramFromFile(contract.publicKey, "./double_contract.so");
  const payer = new Keypair();
  svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));
  const dataAccount = new Keypair();
  const blockhash = svm.latestBlockhash();
  const transferLamports = 1_000_000n;
  const ixs = [
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: dataAccount.publicKey,
      lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
      space: 4,
      programId: contract.publicKey,
    }),
  ];
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  tx.feePayer = payer.publicKey;
  tx.sign(payer, dataAccount);
  svm.sendTransaction(tx);
  const balanceAfter = svm.getBalance(dataAccount.publicKey);
  expect(balanceAfter).toBe(svm.minimumBalanceForRentExemption(BigInt(4)));
  function doubleCount() {
    const ixs2 = new TransactionInstruction({
      keys: [
        {
          pubkey: dataAccount.publicKey,
          isSigner: false,
          isWritable: true,
        },
      ],
      programId: contract.publicKey,
      data: Buffer.from([0]),
    });
    const blockhash = svm.latestBlockhash();
    const tx2 = new Transaction();
    tx2.recentBlockhash = blockhash;
    tx2.add(ixs2);
    tx2.feePayer = payer.publicKey;
    tx2.sign(payer);
    svm.sendTransaction(tx2);
    svm.expireBlockhash(blockhash);
  }
  doubleCount();
  doubleCount();
  doubleCount();
  doubleCount();

  const newDataAccount = svm.getAccount(dataAccount.publicKey);
  expect(newDataAccount.data[0]).toBe(8);
});
