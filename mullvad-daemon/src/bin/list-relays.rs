//! # License
//!
//! Copyright (C) 2017  Amagicom AB
//!
//! This program is free software: you can redistribute it and/or modify it under the terms of the
//! GNU General Public License as published by the Free Software Foundation, either version 3 of
//! the License, or (at your option) any later version.

#[macro_use]
extern crate error_chain;

extern crate mullvad_rpc;
extern crate serde_json;

error_chain!{}

quick_main!(run);

fn run() -> Result<()> {
    let rpc_http_handle = mullvad_rpc::standalone().chain_err(|| "Unable to connect RPC")?;
    let mut client = mullvad_rpc::RelayListProxy::new(rpc_http_handle);

    let relays = client
        .relay_list()
        .call()
        .chain_err(|| "Error during RPC call")?;
    println!("{}", serde_json::to_string_pretty(&relays).unwrap());
    Ok(())
}
