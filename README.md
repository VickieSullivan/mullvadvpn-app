# Mullvad VPN desktop and mobile app

The back- and frontend for the Mullvad VPN app.

## Status

There is a beta release for macOS available on
[our website](https://mullvad.net/en/guides/beta-app/) and on
[github](https://github.com/mullvad/mullvadvpn-app/releases/).
Support for Linux, Windows, Android and iOS is in the making.

## Checking out the code

This repository contains a submodule, so clone it recursively:
```
git clone --recursive https://github.com/mullvad/mullvadvpn-app.git
```

## Install toolchains and dependencies

1. Get the latest stable Rust toolchain. This is easy with rustup, follow the instructions on
[rustup.rs](https://rustup.rs/).

1. Get Node.js (version 8 or 9) and the latest version of yarn. On macOS these can be installed via
homebrew:
    ```bash
    brew install node yarn
    ```

1. Install build dependencies if you are on Linux
    ```bash
    sudo apt install icnsutils graphicsmagick
    ```

## Building and running the backend (mullvad-daemon)

1. Build the backend without optimizations (debug mode) with:
    ```
    cargo build
    ```

1. Get the latest list of Mullvad relays:
    ```
    ./target/debug/list-relays > dist-assets/relays.json
    ```

1. Run the backend daemon debug binary with verbose logging to the terminal with:
    ```
    sudo ./target/debug/mullvad-daemon -vv --resource-dir dist-assets/
    ```
    It must run as root since it it modifies the firewall and sets up virtual network interfaces
    etc.

## Building and running the frontend (electron app)

1. Install all the JavaScript dependencies by running:
    ```bash
    yarn install
    ```

1. Start the frontend in development mode by running:
    ```bash
    yarn run develop
    ```

If you change any javascript file while the development mode is running it will automatically
transpile and reload the file so that the changes are visible almost immediately.

The app will attempt to start the backend automatically. The exact binary being run can be
customized with the `MULLVAD_BACKEND` environment variable.

If the `/tmp/.mullvad_rpc_address` file exists the app will not start the backend, so if you want
to run a specific version of the backend you can just start it yourself and the app will pick up on
it and behave accordingly.


## Packaging the app

1. Follow the [Install toolchains and dependencies](#install-toolchains-and-dependencies) steps

1. Build the backend in optimized release mode with:
    ```
    cargo build --release
    ```

1. Install all JavaScript dependencies (unless you already have) and package the application with:
    ```bash
    yarn install
    yarn run pack
    ```
    This will create installation packages for windows, linux and MacOS. Note that you have to have
    run `yarn install` at least once before this step to download the javascript dependencies.

    If you only want to build for a specific OS you run
    ```bash
    yarn run pack:OS
    ```
    as in `yarn run pack:linux`.

    The artifact (.dmg, .deb, .msi) version is the `version` property of `package.json`.


## Making a release

When making a real release there are a couple of steps to follow. `<VERSION>` here will denote
the version of the app you are going to release. For example `2018.3-beta1` or `2018.4`.

1. Follow the [Install toolchains and dependencies](#install-toolchains-and-dependencies) steps
   if you have not already completed them.

1. Make sure the `CHANGELOG.md` is up to date and has all the changes present in this release.
   Also change the `[Unreleased]` header into `[<VERSION>] - <DATE>` and add a new `[Unreleased]`
   header at the top. Push this, get it reviewed and merged.

1. Run `./prepare_release.sh <VERSION>`. This will do the following for you:
    1. Check if your repository is in a sane state and the given version has the correct format
    1. Update `package.json` with the new version and commit that
    1. Add a signed tag to the current commit with the release version in it

    Please verify that the script did the right thing before you push the commit and tag it created.

1. Run `./build.sh` on each computer/platform where you want to create a release artifact. This will
    do the following for you:
    1. Update `relays.json` with the latest relays
    1. Compile and package the app into a distributable artifact for your platform.

    Please pay attention to the output at the end of the script and make sure the version it says
    it built matches what you want to release.


## Command line tools for frontend development

- `$ yarn run develop` - develop app with live-reload enabled
- `$ yarn run flow` - type-check the code
- `$ yarn run lint` - lint code
- `$ yarn run pack` - prepare app for distribution for macOS, Windows, Linux. Use `pack:mac`,
   `pack:win` or `pack:linux` to generate package for single target.
- `$ yarn run test` - run tests

## Repository structure

- **app/**
  - **redux/** - state management
  - **components/** - components
  - **containers/** - containers that provide a glueing layer between components and redux
    actions/backend.
  - **lib/** - shared classes and utilities
  - **assets/** - graphical assets and stylesheets
  - **config.json** - links to external components
  - **app.js** - entry file for renderer process
  - **main.js** - entry file for background process
  - **routes.js** - routes configurator
  - **transitions.js** - transition rules between views
- **build.sh** - Builds the backend in release mode. Will be extended to take care of more parts
  of the release compiling and packaging.
- **Cargo.toml** - Main Rust workspace definition. See this file for which folders here are backend
  Rust crates.
- **client-binaries/** - Git submodule containing binaries shipped with the client. Most notably
  the OpenVPN binaries.
- **format.sh** - Script that runs rustfmt to format the Rust code
- **init.js** - entry file for electron, points to compiled **main.js**
- **mullvad-daemon/** - Main Rust crate building the backend daemon binary
- **scripts/** - support scripts for development
- **test/** - frontend tests
- **uninstall.sh** - Temporary script to help uninstall Mullvad VPN, all settings files, caches and
  logs.

## Quirks

- If you want to modify babel-configurations please note that `BABEL_ENV=development` must be used
  for [react-native](https://github.com/facebook/react-native/issues/8723)

# License

Copyright (C) 2017  Amagicom AB

This program is free software: you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

For the full license agreement, see the LICENSE.md file
