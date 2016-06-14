#!/usr/bin/env bash

# Fail on error, verbose output
set -exo pipefail

# Build project
# ndk-build 1>&2

# Figure out which ABI and SDK the device has
abi=$(adb -s $1 shell  getprop ro.product.cpu.abi | tr -d '\r')
sdk=$(adb -s $1 shell  getprop ro.build.version.sdk | tr -d '\r')
rel=$(adb -s $1 shell  getprop ro.build.version.release | tr -d '\r')

# PIE is only supported since SDK 16
if (($sdk >= 16)); then
  bin=minicap
else
  bin=minicap-nopie
fi

size=$(adb -s $1 shell  dumpsys window | grep -Eo 'init=\d+x\d+' | head -1 | cut -d= -f 2)
if [ "$size" = "" ]; then
w=$(adb -s $1 shell  dumpsys window | grep -Eo 'DisplayWidth=\d+' | head -1 | cut -d= -f 2)
h=$(adb -s $1 shell  dumpsys window | grep -Eo 'DisplayHeight=\d+' | head -1 | cut -d= -f 2)
size="${w}x${h}"
fi
args="-P $size@360x640/0"

# Create a directory for our resources
dir=/data/local/tmp/minicap-devel
adb -s $1 shell  "mkdir $dir 2>/dev/null"

# Upload the binary
adb -s $1 push  libs/$abi/$bin $dir

# Upload the shared library
if [ -e jni/minicap-shared/aosp/libs/android-$rel/$abi/minicap.so ]; then
  adb -s $1 push  jni/minicap-shared/aosp/libs/android-$rel/$abi/minicap.so $dir
else
  adb -s $1 push  jni/minicap-shared/aosp/libs/android-$sdk/$abi/minicap.so $dir
fi

# Run!
adb -s $1 shell  LD_LIBRARY_PATH=$dir $dir/$bin $args

# Clean up
adb -s $1 shell  rm -r $dir
