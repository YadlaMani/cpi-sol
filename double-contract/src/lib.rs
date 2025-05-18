use solana_program::{account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, pubkey::Pubkey,msg,program_error::ProgramError};
use borsh::{BorshDeserialize,BorshSerialize};
entrypoint!(process_instruction);
#[derive(BorshDeserialize, BorshSerialize)]
struct OnchainData {
    count: u32,
}
fn process_instruction(
    _program_id:&Pubkey,
    accounts:&[AccountInfo],
    _instruction_data:&[u8]
)->ProgramResult{
    let accounts_iter=&mut accounts.iter();
    let data_account=next_account_info(accounts_iter)?;
   
     if !data_account.is_writable {
        msg!("Data account must be writable.");
        return Err(ProgramError::InvalidAccountData);
    }
    let mut counter=OnchainData::try_from_slice(&data_account.data.borrow())?;
    if counter.count==0{
        counter.count=1;
    }
    else {
        counter.count*=2;
    }
    counter.serialize(&mut &mut data_account.data.borrow_mut()[..])?;
    Ok(())
    
}