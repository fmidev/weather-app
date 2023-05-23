fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
## iOS
### ios increment_version
```
fastlane ios increment_version
```
Increment build and version number and push to repository
### ios build_upload_testflight
```
fastlane ios build_upload_testflight
```
Build and upload to TestFlight
### ios load_asc_api_key
```
fastlane ios load_asc_api_key
```
Load ASC API Key information to use in subsequent lanes
### ios prepare_signing
```
fastlane ios prepare_signing
```
Check certs and profiles
### ios build_release
```
fastlane ios build_release
```
Build the iOS app for release
### ios upload_release
```
fastlane ios upload_release
```
Upload to TestFlight / ASC

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
