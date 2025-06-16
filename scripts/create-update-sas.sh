while getopts e:t: flag
do
    case "${flag}" in
        e) envPrefix=${OPTARG};;
        t) token=${OPTARG};;
    esac
done

if [ -z "$envPrefix" ] || [ -z "$token" ];
then
	echo 'Two parameters required -e ENVIRONMENT and -t TOKEN'; set -e; exit 1;	
fi

KEY="${envPrefix}_SAS_TOKEN";
BODY="{ \"key\": \"$KEY\", \"secured\": true, \"value\": ${token} }"
echo $(curl "https://dt-bitbucket-api-dev-us-central-north.azurewebsites.net/v1.0/$BITBUCKET_REPO_SLUG/pipelines/variables/upsert" -H "X-Api-Key: $EIG_CLI_BITBUCKET_TOOLS_API_KEY" -H "Content-Type: application/json" -d "${BODY}" --fail || { echo 'Could not post your new sas token'; set -e; exit 1; })