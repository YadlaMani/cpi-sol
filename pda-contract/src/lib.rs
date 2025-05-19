use solana_program::{
    account_info::{next_account_info, AccountInfo},   entrypoint::{ProgramResult},
    program::invoke_signed, pubkey::Pubkey, system_instruction::create_account,entrypoint
};
entrypoint!(process_instruction);
fn process_instruction(
    program_id:&Pubkey,
    accounts:&[AccountInfo],
    instruction_data:&[u8]
) ->ProgramResult{
    let mut iter=accounts.iter();
     let owner=next_account_info(&mut iter)?;
    let pda=next_account_info(&mut iter)?;
   
    let system_program=next_account_info(&mut iter)?;
    let ix=create_account(
        owner.key,
        pda.key,
        1000000,
        8,
        &program_id
    );
   let seeds = [b"pda", owner.key.as_ref()];
let (derived_pda, bump) = Pubkey::find_program_address(&seeds, program_id);
let signer_seeds: &[&[u8]] = &[b"pda", owner.key.as_ref(), &[bump]];

    invoke_signed(&ix, accounts, &[signer_seeds])?;
   
    Ok(())

   
}