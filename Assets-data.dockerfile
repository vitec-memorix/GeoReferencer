FROM alpine:3.2
MAINTAINER Picturae <contact@picturae.com>

RUN mkdir -p /assets/images && chmod -R 777 /assets

RUN echo "File on the assets-data volume" > /assets/Readme.txt

VOLUME /assets