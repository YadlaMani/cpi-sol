import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
const conn = new Connection("http://127.0.0.1:8899", "confirmed");
async function main() {
  const kp = new Keypair();

  const signature = await conn.requestAirdrop(
    kp.publicKey,
    LAMPORTS_PER_SOL * 2
  );
  await conn.confirmTransaction(signature);

  const balance = await conn.getBalance(kp.publicKey);
  console.log("Public Key:", kp.publicKey.toBase58());
  const dataAccount = new Keypair();
  const ix = SystemProgram.createAccount({
    fromPubkey: kp.publicKey,
    newAccountPubkey: dataAccount.publicKey,
    lamports: await conn.getMinimumBalanceForRentExemption(8),
    programId: SystemProgram.programId,

    space: 8,
  });
  const tx = new Transaction().add(ix);
  tx.feePayer = kp.publicKey;
  tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;

  const sign = await conn.sendTransaction(tx, [kp, dataAccount]);
  await conn.confirmTransaction(sign);
  console.log("Data Account Public Key:", dataAccount.publicKey.toBase58());
}
main();
