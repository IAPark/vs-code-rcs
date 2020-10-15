# Change Log
All notable changes to the "rcs" extension will be documented in this file.

## [Unreleased]

## [0.0.2] - 2018-01-04

* Initial release
* List files locked by the user
* List files locked by other users
* Show changes as compared to the head.
* Commit changes
* Automatically prevent edits to locked files and offer to unlock them

## [0.0.3] - 2018-01-04

* Updated readme and documentation

## [0.0.4] - 2020-10-16

* Important security fix
    * Potentially malicious file names could cause arbitrary code to run on opening a folder 
    * This was dumb and jumped out to me as soon as I looked at this for the first time in years
* Better support for `,v` file  outside of `RCS` folder
* Dependency bump