#!/bin/sh

# With rsa you encrypt with public key and decrypt with private
# With signature you sign with private key and check with public
# So only you can encrypt, but anyone can decrypt signature and check it

MODE=""

while getopts ':hsv' opt; do
    case $opt in
        h) printf "%s\n" "Usage: $(basename "$0") [-h] <-s <key> <document> <out>|-v <key> <signature>>"
           printf "\t%s\n" "-h: show help and exit"
           printf "\t%s\n" "-s <key> <document...>: sign documents with private key"
           printf "\t%s\n" "-v <key> <document> <signature> ...: verify document signatures"
           exit
           ;;
        s) MODE="sign" ;;
        v) MODE="verify" ;;
        *) printf "%s\n" "$(basename "$0"): $optopt: no such argument" >&2
           exit 1
           ;;
    esac
done

shift $((OPTIND - 1))

# echo "N Args: $#"
# echo "Args: $@"

case "$MODE" in
    "sign")
        if [ $# -lt 2 ]; then
            printf "Not enough arguments for signing" >&2
            exit 1
        fi
        key="$1"
        shift

        while [ $# -gt 0 ]; do
            doc="$1"
            shift

            # Find hash and sign with key
            (./crypt -e=sha256 "$doc" | ./crypt -e=rsa -k="$key" - "$doc.sign") 2>/dev/null
        done
        ;;
    "verify")
        if [ $# -lt 3 ]; then
            printf "Not enough arguments for signing" >&2
            exit 1
        fi
        key="$1"
        shift

        while [ $# -gt 1 ]; do
            doc="$1"
            sign="$2"
            shift 2

            hash="$(./crypt -e=sha256 "$doc" 2>/dev/null)"
            sign_hash="$(./crypt -d=rsa -k="$key" "$sign" 2>/dev/null | tr -d '\000')"

            if [ "$hash" = "$sign_hash" ]; then
                echo "Document $doc signature is valid"
            else
                echo
                echo "Document $doc signature is invalid!"
                echo "Document hash: $hash"
                echo "Signature hash: $sign_hash"
                echo
            fi
        done
        ;;
esac
