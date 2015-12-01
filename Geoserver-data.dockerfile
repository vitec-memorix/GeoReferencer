FROM alpine:3.2
MAINTAINER Picturae <contact@picturae.com>

RUN mkdir -p /opt/geoserver/data_dir && chmod 777 /opt/geoserver/data_dir

RUN echo "File on the geoserver-data volume" > /opt/geoserver/data_dir/Readme.txt

VOLUME /opt/geoserver/data_dir