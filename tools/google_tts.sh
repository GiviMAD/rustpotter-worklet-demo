export GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
TEXT="$1"
LANGUAGE="$2"
IFS=' ' read -a VOICES <<< "$3"
echo "$1 $2"
for VOICE in "${VOICES[@]}" ;do
    FILE_NAME=${TEXT}_${VOICE}
    echo "generating \"${FILE_NAME}.wav\""
    JSON='{ "input":{ "text":"'$TEXT'." }, "voice":{ "languageCode":"'$LANGUAGE'", "name":"'$VOICE'" }, "audioConfig":{ "audioEncoding":"LINEAR16", "sampleRateHertz": 16000 } }';
    curl -X POST \
    -H "Authorization: Bearer "$(gcloud auth application-default print-access-token) \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "$JSON" \
    "https://texttospeech.googleapis.com/v1/text:synthesize" | jq -r '.audioContent' | base64 -d > ${FILE_NAME}.wav
done
