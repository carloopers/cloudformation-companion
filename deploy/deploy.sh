#! /bin/bash

set -ex

ROOT="$(dirname $0)/.."
aws cloudformation validate-template --template-body file://${ROOT}/deploy/template.yaml

aws cloudformation package --s3-prefix "${PROJECT}/${SERVICE}/${COMPONENT}" \
    --template-file ${ROOT}/deploy/template.yaml \
    --s3-bucket $ARTIFACT_BUCKET --output-template-file ${ROOT}/packaged-template.yaml

aws cloudformation deploy \
    --stack-name ${PROJECT}-${SERVICE}-${COMPONENT} \
    --template-file ${ROOT}/packaged-template.yaml \
    --capabilities CAPABILITY_IAM || \
    (aws cloudformation describe-stack-events --stack-name ${PROJECT}-${SERVICE}-${COMPONENT} \
    --query 'sort_by(StackEvents, &Timestamp)[*].[ResourceStatus, ResourceType, ResourceStatusReason]' --output text && exit 1)
