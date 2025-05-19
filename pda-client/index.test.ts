import { describe, test, beforeAll, expect } from "vitest";
import { LiteSVM } from "litesvm";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

describe("PDA Client Tests", () => {
  let liveSvm: LiteSVM;
  let pda: PublicKey;
  let bump: number;
  let programId: PublicKey;
  let payer: Keypair;
  beforeAll(async () => {
    liveSvm = new LiteSVM();
    programId = PublicKey.unique();
    payer = Keypair.generate();
    liveSvm.addProgramFromFile(programId, "./pda_contract.so");
    liveSvm.airdrop(payer.publicKey, BigInt(1000000000));
    [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("pda"), payer.publicKey.toBuffer()],
      programId
    );

    let ix = new TransactionInstruction({
      keys: [
        {
          pubkey: payer.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: pda,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId,
      data: Buffer.from(""),
    });
    const tx = new Transaction().add(ix);
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = liveSvm.latestBlockhash();
    tx.sign(payer);
    let res = liveSvm.sendTransaction(tx);
  });
  test("PDA Creattion", async () => {
    const balance = liveSvm.getBalance(pda);
    console.log(`PDA Balance: ${balance}`);

    expect(Number(balance)).toBeGreaterThan(0);
    expect(Number(balance)).toBe(1000000);
  });
});
