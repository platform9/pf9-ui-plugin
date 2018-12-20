#!/usr/bin/env bash
set -e

PKGS_URL=https://nodejs.org/download/release/latest-v10.x/
SUMS_URL=https://nodejs.org/download/release/latest-v10.x/SHASUMS256.txt
DETECTED_OS="$(uname -s)"

function download() {
    filename=$1
    wget --quiet -O $dest/$latest $PKGS_URL/$filename
}

function verify_sha256sum() {
    filename=$1
    sum_file=$(mktemp)
    wget --quiet -O - $SUMS_URL | grep $filename > $sum_file
    if [[ $DETECTED_OS == "Darwin" ]]; then
      shasum -a 256 --status -c $sum_file
    else
      sha256sum --quiet -c $sum_file
    fi
}

if [[ -z "$1" || -z "$2" ]]; then
    echo "Usage: $0 [linux|osx] <destination dir>"
    exit 1
fi

os=$1
dest=$2
case $os in
linux)
    latest=$(wget --quiet -O - $PKGS_URL | sed -n 's/.*\(node.*-linux-x64.tar.gz\).*/\1/p')
    ;;
osx)
    latest=$(wget --quiet -O - $PKGS_URL | sed -n 's/.*\(node.*-darwin-x64.tar.gz\).*/\1/p')
    ;;
*)
    echo "Unknown OS $os"
    exit 1
    ;;
esac

download $latest
cd $dest && verify_sha256sum $latest
echo $dest/$latest

