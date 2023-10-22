export GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
TEXT="$1"
TEXT_NO_SPACES="${TEXT// /-}"
LANGUAGE="$2"
IFS=' ' read -a VOICES <<< "$3"
echo "$1 $2"
tts() {
    if [ -n "$EFFECT" ]; then
        EFFECT_FIELD=', "effectsProfileId": ["'$EFFECT'"]';
    fi
    JSON='{ "input":{ "text":"'$TEXT'." }, "voice":{ "languageCode":"'$LANGUAGE'", "name":"'$VOICE'" }, "audioConfig":{ "audioEncoding":"LINEAR16", "sampleRateHertz": 16000, "pitch": "'${PITCH:-"0"}'", "speakingRate": "'${SPEAK_RATE:-"0"}'"'$EFFECT_FIELD' } }';
    curl -X POST \
    -H "Authorization: Bearer "$(gcloud auth application-default print-access-token) \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "$JSON" \
    "https://texttospeech.googleapis.com/v1/text:synthesize"
}
for VOICE in "${VOICES[@]}" ;do
    FILE_NAME=${TEXT_NO_SPACES}_${VOICE}
    if [ -n "$PITCH" ]; then
        FILE_NAME="${FILE_NAME}_pitch_${PITCH}"
    fi
    if [ -n "$SPEAK_RATE" ]; then
        FILE_NAME="${FILE_NAME}_speak-rate_${SPEAK_RATE}"
    fi
    if [ -n "$EFFECT" ]; then
        FILE_NAME="${FILE_NAME}_effect_${EFFECT}"
    fi
    FILE_NAME="${FILE_NAME}.wav"
    if test -f "$FILE_NAME"
    then
        echo "Already exists: \"${FILE_NAME}\""
    else
        echo "generating \"${FILE_NAME}\""
        tts | jq -r '.audioContent' | base64 -d > "${FILE_NAME}"
    fi
done
