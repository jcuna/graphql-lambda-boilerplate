FROM node:14.17.3-alpine3.14

RUN apk update && apk add --no-cache python3 py3-pip curl jq unzip bash vim \
    && pip3 install --upgrade pip \
    && pip3 install awscli \
    && rm -rf /var/cache/apk/*
