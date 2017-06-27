FROM geodata/gdal:2.0.0
MAINTAINER Picturae <contact@picturae.com>

#Setup container environment parameters
ENV DEBIAN_FRONTEND noninteractive
ENV INITRD No
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

USER root

#Configure locale.
RUN locale-gen en_US en_US.UTF-8

#Prepare the image
RUN apt-get -y update && apt-get install -y -q python-software-properties software-properties-common bash-completion build-essential git supervisor

#Install NGINX
RUN add-apt-repository -y ppa:nginx/stable && apt-get -y update && apt-get install -y nginx

#Install PHP 5.6.2
RUN add-apt-repository -y ppa:ondrej/php && apt-get -y update && apt-get install -y -q php5.6-cli php5.6-fpm php5.6-mysql php5.6-curl php5.6-pgsql php5.6-mongo php5.6-gd php5.6-intl php5.6-imagick php5.6-mcrypt php5.6-memcache php5.6-xmlrpc php5.6-xsl php5.6-dev php5.6-cli php5.6-common php5.6-json php5.6-readline php5.6-opcache php5.6-xml

# Edit PHP config
RUN sed -i 's/\;date\.timezone\ \=/date\.timezone\ \=\ UTC/g' /etc/php/5.6/fpm/php.ini && sed -i -e "s/;daemonize\s*=\s*yes/daemonize = no/g" /etc/php/5.6/fpm/php-fpm.conf && sed -i -e "s/;listen.mode\s*=\s*0660/listen.mode = 0666/g" /etc/php/5.6/fpm/pool.d/www.conf && sed -i -e "s/upload_max_filesize\s*=\s*2M/upload_max_filesize = 2000M/g" /etc/php/5.6/fpm/php.ini && sed -i -e "s/post_max_size\s*=\s*8M/post_max_size = 2000M/g" /etc/php/5.6/fpm/php.ini && sed -i -e "s/max_execution_time\s*=\s*30/max_execution_time = 60000/g" /etc/php/5.6/fpm/php.ini

#Install phalcon
RUN git clone git://github.com/phalcon/cphalcon.git /tmp/cphalcon
RUN cd /tmp/cphalcon/build && git checkout 1.3.4
RUN cd /tmp/cphalcon/build && ./install
RUN echo "extension=phalcon.so" > /etc/php/5.6/mods-available/phalcon.ini && phpenmod phalcon

#Container clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/* && rm -rf /var/cache/apt/archives/*

ADD ./resources/gdal/supervisor/supervisord.conf /etc/supervisor/supervisord.conf
ADD ./resources/gdal/supervisor/conf.d /etc/supervisor/conf.d
ADD ./resources/gdal/nginx/nginx.conf /etc/nginx/nginx.conf
ADD ./resources/gdal/sites-enabled/* /etc/nginx/sites-enabled/
# Add our crontab file
ADD ./resources/gdal/cron/crontab.txt /gdal/cron/crontab.txt
ADD ./resources/gdal/cron/cron_clear.php /gdal/cron/cron_clear.php

RUN apt-get update && apt-get install cron -y

#Use the crontab file
RUN crontab /gdal/cron/crontab.txt

# Should not be needed!
RUN mkdir -p /run/php

VOLUME ["/app", "/assets"]

EXPOSE 80

CMD ["/usr/bin/supervisord", "-n"]
