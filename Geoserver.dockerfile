FROM java:8u66-jre
MAINTAINER Picturae <contact@picturae.com>

ENV DEBIAN_FRONTEND noninteractive
ENV GEOSERVER_VERSION 2.8.1
ENV GDAL_DATA_VERSION 1.1.12
ENV GDAL_DATA /opt/gdal-data
ENV LD_LIBRARY_PATH /opt/gdal-library

ENV GEOSERVER_HOME /opt/geoserver
ENV JAVA_HOME /usr/

ADD ./resources/geoserver /docker
RUN chmod 755 /docker/bin/*

RUN apt-get -y update
RUN if [ ! -f /docker/geoserver-$GEOSERVER_VERSION-bin.zip ]; then \
    curl -L "http://downloads.sourceforge.net/project/geoserver/GeoServer/$GEOSERVER_VERSION/geoserver-$GEOSERVER_VERSION-bin.zip" > /docker/geoserver-$GEOSERVER_VERSION-bin.zip; \
    fi; \
    unzip /docker/geoserver-$GEOSERVER_VERSION-bin.zip -d /opt && mv -v /opt/geoserver* /opt/geoserver && rm -f /docker/geoserver-$GEOSERVER_VERSION-bin.zip

RUN if [ ! -f /docker/geoserver-$GEOSERVER_VERSION-gdal-plugin.zip ]; then \
    curl -L "http://downloads.sourceforge.net/project/geoserver/GeoServer/$GEOSERVER_VERSION/extensions/geoserver-$GEOSERVER_VERSION-gdal-plugin.zip" > /docker/geoserver-$GEOSERVER_VERSION-gdal-plugin.zip; \
    fi; \
    unzip -o /docker/geoserver-$GEOSERVER_VERSION-gdal-plugin.zip -d /opt/geoserver/webapps/geoserver/WEB-INF/lib && rm -f /docker/geoserver-$GEOSERVER_VERSION-gdal-plugin.zip

RUN mkdir -m 0777 /opt/gdal-data
RUN if [ ! -f /docker/gdal-data-$GDAL_DATA_VERSION.zip ]; then \
    curl -L "http://demo.geo-solutions.it/share/github/imageio-ext/releases/1.1.X/$GDAL_DATA_VERSION/native/gdal/gdal-data.zip" > /docker/gdal-data-$GDAL_DATA_VERSION.zip; \
    fi; \
    unzip -o /docker/gdal-data-$GDAL_DATA_VERSION.zip -d /opt && rm -f /docker/gdal-data-$GDAL_DATA_VERSION.zip

RUN mkdir -m 0777 /opt/gdal-library
RUN if [ ! -f /docker/gdal-$GDAL_DATA_VERSION.tar.gz ]; then \
    curl -L "http://demo.geo-solutions.it/share/github/imageio-ext/releases/1.1.X/$GDAL_DATA_VERSION/native/gdal/linux/gdal192-Ubuntu12-gcc4.6.3-x86_64.tar.gz" > /docker/gdal-$GDAL_DATA_VERSION.tar.gz; \
    fi; \
    tar zxvf /docker/gdal-$GDAL_DATA_VERSION.tar.gz -C /opt/gdal-library && rm -f /docker/gdal-$GDAL_DATA_VERSION.tar.gz

ADD ./resources/geoserver/jetty.xml $GEOSERVER_HOME/etc/jetty.xml
EXPOSE 8081

ENTRYPOINT ["/docker/bin/boot.sh"]
CMD ["geoserver:run"]

