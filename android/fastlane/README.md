fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android increment_android_version

```sh
[bundle exec] fastlane android increment_android_version
```

Increment build and version number and push to repository - Build number = version code, version number = version name

### android build_apk

```sh
[bundle exec] fastlane android build_apk
```

Android build APK

### android build_test_apk

```sh
[bundle exec] fastlane android build_test_apk
```

Android build APK for testing

### android build_sign_and_deploy

```sh
[bundle exec] fastlane android build_sign_and_deploy
```

Sign, build, and deploy to Google Play Store

### android get_version_code_and_version_name

```sh
[bundle exec] fastlane android get_version_code_and_version_name
```

Get version code and version name

### android build_and_sign

```sh
[bundle exec] fastlane android build_and_sign
```

Release for the Android beta

### android deploy

```sh
[bundle exec] fastlane android deploy
```

Deploy a new version to the Google Play

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
