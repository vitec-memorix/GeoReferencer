FROM ubuntu:14.04
MAINTAINER Picturae <contact@picturae.com>

#Setup container environment parameters
ENV DEBIAN_FRONTEND noninteractive
ENV INITRD No

#Configure locale.
RUN locale-gen en_US en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

#Prepare the image
RUN apt-get -y update

RUN apt-get install -y software-properties-common && \
    add-apt-repository -y ppa:ondrej/php && \
    add-apt-repository -y ppa:brightbox/ruby-ng

RUN sudo apt-get update 

#Prepare the image
RUN apt-get -y update

#=====General utilities=====#
RUN apt-get install -y -q python-software-properties bash-completion wget nano \
curl libcurl3 libcurl3-dev build-essential libpcre3-dev


# Install VCS
RUN apt-get install -y -q git subversion
#=====END=====#

RUN apt-get install -y -q php5.6-cli php5.6-fpm php5.6-dev php5.6-mysql php5.6-pgsql php5.6-mongo php5.6-curl php5.6-gd php5.6-intl php5.6-imagick php5.6-mcrypt php5.6-memcache php5.6-xmlrpc php5.6-xsl php5.6-cli php5.6-common php5.6-json php5.6-readline php5.6-opcache php5.6-xml
RUN curl -sS https://getcomposer.org/installer | php && mv composer.phar /usr/local/bin/composer

#Install phalcon
RUN git clone git://github.com/phalcon/cphalcon.git /tmp/cphalcon && \
    cd /tmp/cphalcon/build && \
    git checkout 1.3.4 && \
    cd /tmp/cphalcon/build && \
    ./install && \
    echo "extension=phalcon.so" > /etc/php/5.6/mods-available/phalcon.ini && \
    phpenmod phalcon && \
    rm -rf /tmp/cphalcon

#=====Ruby 2.2.2 Installation (with RVM)=====#
RUN apt-get install -y -q libgdbm-dev libncurses5-dev automake libtool bison libffi-dev
RUN \curl -#LO https://rvm.io/mpapis.asc && gpg --import mpapis.asc
#RUN gpg --keyserver hkp://keys.gnupg.net --recv-keys D39DC0E3
RUN \curl -L https://get.rvm.io | bash -s stable
RUN /bin/bash -l -c "rvm requirements"
RUN /bin/bash -l -c "rvm install 2.2.3"
RUN apt-get install -y ruby2.2-dev
RUN /bin/bash -l -c "gem install bundler --no-ri --no-rdoc"

#=====END=====#


#=====Node v0.10.33 install=====#
RUN \curl --silent --location https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install --yes nodejs
RUN apt-get install --yes build-essential

RUN npm install napa@1.2.0 --save-dev && \
    npm install gulp@3.9.0 && \
    npm cache clear

#=====END=====#

#Application volume
ADD ./resources/assets/bin/assets.sh /
RUN chmod 755 /assets.sh

COPY ./app /app

WORKDIR /app

RUN /bin/bash -l -c ". /etc/profile.d/rvm.sh && \
    PATH=$PATH:/usr/local/rvm/gems/ruby-2.2.3/bin:/usr/local/rvm/rubies/ruby-2.2.3/bin && \
    BUNDLE_GEMFILE=/app/Gemfile bundle install --path /app/.bundle"
RUN npm install --unsafe-perm
RUN /bin/bash -l -c ". /etc/profile.d/rvm.sh && \
    PATH=$PATH:/usr/local/rvm/gems/ruby-2.2.3/bin:/usr/local/rvm/rubies/ruby-2.2.3/bin && \
    node_modules/.bin/gulp build" && \
    npm cache clear
    
RUN /bin/bash -l -c ". /etc/profile.d/rvm.sh && \
    PATH=$PATH:/usr/local/rvm/gems/ruby-2.2.3/bin:/usr/local/rvm/rubies/ruby-2.2.3/bin:/usr/local/bin && \
    composer install -o -d /app --prefer-source --no-interaction"

VOLUME [ "/app" ]

RUN /assets.sh assets:gulp && \
    npm cache clear

ENTRYPOINT ["/app/node_modules/.bin/gulp"]

CMD ["watch"]
