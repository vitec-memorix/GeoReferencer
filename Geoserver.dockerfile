FROM java:8u66-jre
MAINTAINER Picturae <contact@picturae.com>

ENV DEBIAN_FRONTEND noninteractive
ENV GEOSERVER_VERSION 2.8.0

ENV GEOSERVER_HOME /opt/geoserver
ENV JAVA_HOME /usr/

ADD ./resources/geoserver /docker
RUN chmod 755 /docker/bin/*

RUN apt-get -y update
RUN if [ ! -f /docker/geoserver-$GEOSERVER_VERSION-bin.zip ]; then \
    curl -L "http://downloads.sourceforge.net/project/geoserver/GeoServer/$GEOSERVER_VERSION/geoserver-$GEOSERVER_VERSION-bin.zip" > /docker/geoserver-$GEOSERVER_VERSION-bin.zip; \
    fi; \
    unzip /docker/geoserver-$GEOSERVER_VERSION-bin.zip -d /opt && mv -v /opt/geoserver* /opt/geoserver && rm -f /docker/geoserver-$GEOSERVER_VERSION-bin.zip

ADD ./resources/geoserver/jetty.xml $GEOSERVER_HOME/etc/jetty.xml
EXPOSE 8081

ENTRYPOINT ["/docker/bin/boot.sh"]
CMD ["geoserver:run"]

