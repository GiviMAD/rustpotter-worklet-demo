WAKEWORDS=('oye, casa_es-ES' 'buenos días_es-ES' 'good morning_en-US' 'hey, home_en-US' 'hé, maison_fr-FR' 'bonjour_fr-FR' 'hallo, hause_de-DE' 'guten morgen_de-DE')
# set -x;
set -e;
echo "### auto generated" > wakeword_build_cli.sh
for WAKEWORD in "${WAKEWORDS[@]}" ;do
    IFS=_ read WAKEWORD_NAME WAKEWORD_LANGUAGE <<< "$WAKEWORD"
    MODEL_FILE_NAME="${WAKEWORD_NAME// /_}-${WAKEWORD_LANGUAGE//-/_}"
    SAMPLES=$(ls -1 ../samples | grep "$WAKEWORD_NAME" | sed 's/\ /\\\ /g' | awk '{print "../samples/"$0}')
    CMD="rustpotter-cli build-model --debug --model-name '$WAKEWORD_NAME' --model-path ../static/$MODEL_FILE_NAME.rpw $SAMPLES"
    echo "###### $MODEL_FILE_NAME" >> wakeword_build_cli.sh
    echo $CMD >> wakeword_build_cli.sh
done
chmod +x wakeword_build_cli.sh
./wakeword_build_cli.sh
rm wakeword_build_cli.sh