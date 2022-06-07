export GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
TEXT="hey home"
LANGUAGE="es-us"
VOICES=('en-US-Standard-A' 'en-US-Standard-B' 'en-US-Standard-C' 'en-US-Standard-D' 'en-US-Standard-E' 'en-US-Standard-F' 'en-US-Standard-G' 'en-US-Standard-H' 'en-US-Standard-I' 'en-US-Standard-J')
for VOICE in "${VOICES[@]}" ;do
    JSON='{ "input":{ "text":"'$TEXT'." }, "voice":{ "languageCode":"'$LANGUAGE'", "name":"'$VOICE'" }, "audioConfig":{ "audioEncoding":"LINEAR16", "sampleRateHertz": 16000 } }';
    curl -X POST \
    -H "Authorization: Bearer "$(gcloud auth application-default print-access-token) \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "$JSON" \
    "https://texttospeech.googleapis.com/v1/text:synthesize" | jq -r '.audioContent' | base64 -d > ${TEXT}_${VOICE}.wav
done
