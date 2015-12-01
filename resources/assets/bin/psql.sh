#!/bin/bash

set -e

PSQL_PATH=/var/lib/postgresql
PSQL_PATH_CONFIG=/etc/postgresql/9.4/main
PSQL_DATA=/var/lib/postgresql/data
PSQL_VERSION=9.4
PSQL_BIN=/usr/lib/postgresql/9.4/bin

DB_PASS=${DB_PASS:-}

initPsql () {
    echo "Initializing database in $PSQL_DATA"
    mkdir -p $PSQL_DATA
    chown -R postgres:postgres $PSQL_DATA
    sudo -u postgres -H "${PSQL_BIN}/initdb" -E utf8 --locale en_US.UTF-8 -D $PSQL_DATA

    mkdir -p $PSQL_DATA/pg_log

    if [ -n "$DB_PASS" ]; then
        echo "ALTER USER postgres with LOGIN ENCRYPTED PASSWORD '${DB_PASS}';" | sudo -u postgres -H ${PSQL_BIN}/postgres --single \
                                                                                      -D ${PSQL_DATA} -c config_file=${PSQL_DATA}/postgresql.conf > /dev/null
    fi

    #Listen to all addresses by default, use docker to
    #bind to the correct one.
    sed -i -e "s/#listen_addresses\s*=\s*'localhost'/listen_addresses = '*'/g" $PSQL_DATA/postgresql.conf

    #Set the data directory
    sed -i -e "s/data_directory\s*=.*$/data_directory = '\/var\/lib\/postgresql\/data'/g" $PSQL_DATA/postgresql.conf

    #Set max connections to 150.
    sed -i -e "s/max_connections = 100/max_connections = 150/g" $PSQL_DATA/postgresql.conf

    #Use md5 auth
    sed -i -e "s/127.0.0.1\/32.*/0.0.0.0\/0 md5/g" $PSQL_DATA/pg_hba.conf
}

startPsql () {

    if [ ! -f $PSQL_DATA/PG_VERSION ]; then
        initPsql
    fi
    sudo -u postgres -H "${PSQL_BIN}/postgres" -D $PSQL_DATA -c config_file=$PSQL_DATA/postgresql.conf
}

case "$1" in
    psql:run)
        startPsql
        ;;
esac
