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
RUN add-apt-repository -y ppa:ondrej/php5-5.6 && apt-get -y update && apt-get install -y -q php5-cli php5-fpm php5-mysql php5-curl php5-pgsql php5-mongo php5-gd php5-intl php5-imagick php5-mcrypt php5-memcache php5-xmlrpc php5-xsl php5-dev

# Edit PHP config
RUN sed -i 's/\;date\.timezone\ \=/date\.timezone\ \=\ UTC/g' /etc/php5/fpm/php.ini && sed -i -e "s/;daemonize\s*=\s*yes/daemonize = no/g" /etc/php5/fpm/php-fpm.conf && sed -i -e "s/;listen.mode\s*=\s*0660/listen.mode = 0666/g" /etc/php5/fpm/pool.d/www.conf && sed -i -e "s/upload_max_filesize\s*=\s*2M/upload_max_filesize = 2000M/g" /etc/php5/fpm/php.ini && sed -i -e "s/post_max_size\s*=\s*8M/post_max_size = 2000M/g" /etc/php5/fpm/php.ini && sed -i -e "s/max_execution_time\s*=\s*30/max_execution_time = 60000/g" /etc/php5/fpm/php.ini

#Install phalcon
RUN git clone git://github.com/phalcon/cphalcon.git /tmp/cphalcon
RUN cd /tmp/cphalcon/build && git checkout 1.3.4
RUN cd /tmp/cphalcon/build && ./install
RUN echo "extension=phalcon.so" > /etc/php5/mods-available/phalcon.ini && php5enmod phalcon

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

RUN cron

VOLUME ["/app", "/assets"]

EXPOSE 80

CMD ["/usr/bin/supervisord", "-n"]
