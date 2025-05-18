use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    instruction::{AccountMeta, Instruction},
    msg,
    program::invoke,
    pubkey::Pubkey,
    program_error::ProgramError,
};

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let data_account = next_account_info(account_iter)?;
    let double_contract_address = next_account_info(account_iter)?;

    let instruction = Instruction {
        program_id: *double_contract_address.key,
        accounts: vec![
            AccountMeta::new(*data_account.key, true),
        ],
        data: vec![],
    };

    invoke(
        &instruction,
        &[
            data_account.clone()
            
        ],
    )?;

    Ok(())
}
