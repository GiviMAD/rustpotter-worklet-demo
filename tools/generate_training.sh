#!/bin/bash
set -e
TEXT=$1
TEXT_NO_SPACES="${TEXT// /-}"
LANG=${2:-"en-US"}
PITCHES=("-20" "0" "20")
SRATES=("0.75" "0.9" "1" "1.10" "1.25")
PROFILES=("wearable-class-device" "handset-class-device" "headphone-class-device" "small-bluetooth-speaker-class-device" "medium-bluetooth-speaker-class-device" "large-home-entertainment-class-device" "large-automotive-class-device" "telephony-class-application")
COUNTER=0
for PITCH in "${PITCHES[@]}" ;do
    for PROFILE in "${PROFILES[@]}" ;do
        for SRATE in "${SRATES[@]}" ;do
            COUNTER=$(( COUNTER + 1 ))
            PITCH=$PITCH SPEAK_RATE=$SRATE EFFECT=$PROFILE "./google_tts_$LANG.sh" "$TEXT"
        done
    done
done
WORD_DIR="../samples/$TEXT_NO_SPACES"
mkdir -p "$WORD_DIR"
mv ./${TEXT_NO_SPACES}*.wav $WORD_DIR
echo "Generated files: $COUNTER"

