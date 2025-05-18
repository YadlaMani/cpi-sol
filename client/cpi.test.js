const { LiteSVM } = require("litesvm");
const {
  PublicKey,
  TransactionInstruction,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");
test("cross program invocation", async () => {
  const svm = new LiteSVM();
  const doubleContract = Keypair.generate();
  const cpiContract = Keypair.generate();
  const payer = new Keypair();
  svm.airdrop(payer.publicKey, BigInt(LAMPORTS_PER_SOL));
  svm.addProgramFromFile(doubleContract.publicKey, "./double_contract.so");
  svm.addProgramFromFile(cpiContract.publicKey, "./cpi_contract.so");
  const dataAccount = new Keypair();
  createDataAccOnChain(svm, payer, dataAccount, doubleContract);
  expect(svm.getBalance(dataAccount.publicKey)).toBe(
    svm.minimumBalanceForRentExemption(BigInt(4))
  );
  function doubleCount() {
    let ix = new TransactionInstruction({
      keys: [
        {
          pubkey: dataAccount.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: doubleContract.publicKey,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: cpiContract.publicKey,
      data: Buffer.from([0]),
    });
    let transaction = new Transaction().add(ix);
    transaction.recentBlockhash = svm.latestBlockhash();
    transaction.feePayer = payer.publicKey;
    transaction.sign(payer, dataAccount);
    svm.sendTransaction(transaction);
    svm.expireBlockhash(transaction.recentBlockhash);
  }
  doubleCount();
  doubleCount();
  doubleCount();
  doubleCount();

  const dataAccountData = svm.getAccount(dataAccount.publicKey);
  expect(dataAccountData.data[0]).toBe(8);
  expect(dataAccountData.data[1]).toBe(0);
  expect(dataAccountData.data[2]).toBe(0);
  expect(dataAccountData.data[3]).toBe(0);
});
function createDataAccOnChain(svm, payer, dataAccount, contract) {
  const ixs = [
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: dataAccount.publicKey,
      lamports: Number(svm.minimumBalanceForRentExemption(BigInt(4))),
      space: 4,
      programId: contract.publicKey,
    }),
  ];
  const blockhash = svm.latestBlockhash();
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  tx.feePayer = payer.publicKey;
  tx.sign(payer, dataAccount);
  svm.sendTransaction(tx);
}
