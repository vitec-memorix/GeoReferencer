#!/bin/bash

#Container paths
APP_PATH=/app
NPM_DEPS_PATH=$APP_PATH/node_modules
COMPOSER_DEPS_PATH=$APP_PATH/vendor

#Prepare rvm
source /etc/profile.d/rvm.sh
PATH=$PATH:/usr/local/rvm/gems/ruby-2.2.2/bin:/usr/local/rvm/rubies/ruby-2.2.2/bin

composerRun () {
    echo "Executing \"composer $1 -o -d $APP_PATH\""
    composer $1 -o -d $APP_PATH --prefer-source --no-interaction
}

composerClean () {
    echo "Trying to remove vendor folder at default location ${COMPOSER_DEPS_PATH}"
    rm -rf $COMPOSER_DEPS_PATH
}

npmClean () {
    echo "Trying to remove vendor folder at default location ${NPM_DEPS_PATH}"
    rm -rf $NPM_DEPS_PATH
}

npmRun () {
    echo "Executing \"npm $1 $2 $3\" --unsafe-perm"
    cd $APP_PATH && npm $1 $2 $3 --unsafe-perm
}

gulpRun () {
    echo "Executing \"gulp $1 $2 $3\""
    cd $APP_PATH && node_modules/.bin/gulp $1 $2 $3
}


case "$1" in
    assets:clean)
        npmClean
        composerClean
        ;;
    assets:gulp)
        if [ -f $APP_PATH/Gemfile ]; then
            BUNDLE_SATISFIED=$(BUNDLE_GEMFILE=$APP_PATH/Gemfile bundle check --path $APP_PATH/.bundle)
            echo $BUNDLE_SATISFIED;
            if [ "$BUNDLE_SATISFIED" != "The Gemfile's dependencies are satisfied" ]; then
                BUNDLE_GEMFILE=$APP_PATH/Gemfile bundle install --path $APP_PATH/.bundle
            fi
        fi

        if [ ! -d "$NPM_DEPS_PATH" ] && [ -f $APP_PATH/package.json ]; then
            npmRun "install"
        fi

        #Always rebuild
        gulpRun "build"

        if [ ! -d "$COMPOSER_DEPS_PATH" ] && [ -f $APP_PATH/composer.json ]; then
            composerRun "install"
        fi
        gulpRun "$2"
        ;;
    asssets:watch)
        gulpRun "watch"
        ;;
    *)
        echo "Unrecognized command: ${1} ${2}"
        ;;
esac
