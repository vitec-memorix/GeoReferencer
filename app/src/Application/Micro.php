<?php

namespace Georeferencer\Application;

class Micro
{
    /**
     * DI Keys for all registered objects/properties.
     */
    const DI_CONFIG = 'config';
    const DI_APPLICATION = 'application';
    const DI_DB = 'db';
    const DI_ROUTER = 'router';
    const DI_URL_HELPER = 'urlHelper';
    const DI_REST_LISTENER = 'restListener';

    /**
     * Mvc app
     * @var \Phalcon\Mvc\Micro
     */
    protected $app;

    /**
     * Create an application and bootstrap the different sections.
     * @param Application configuration
     **/
    public function __construct($appConfig)
    {
        $this->bootstrapApplication()
             ->bootstrapDi($appConfig)
             ->bootstrapRouting()
             ->bootstrapEvents()
             ->bootstrapErrorHandling();
    }

    /**
     * Bootstrap the micro application.
     * @return \Georeferencer\Application\Micro
     **/
    private function bootstrapApplication()
    {
        $this->app = new \Phalcon\Mvc\Micro();
        $this->app->setDI(new \Phalcon\DI\FactoryDefault);
        $this->app->setEventsManager(new \Phalcon\Events\Manager);
        return $this;
    }

    /**
     * Attach dependencies to the DI container.
     * All DI Objects are attached here. The DI is not modified
     * outside of this method.
     * @return \Georeferencer\Application\Micro
     **/
    private function bootstrapDi($appConfig)
    {
        $di = $this->getApplication()->getDI();

        //configuration
        $di->setShared(self::DI_CONFIG, $appConfig);

        //circular
        $di->setShared(
            self::DI_APPLICATION,
            function () {
                return $this;
            }
        );

        //Set the DB.
        $di->setShared(
            self::DI_DB,
            function () use ($appConfig) {
                return new \Phalcon\Db\Adapter\Pdo\Postgresql($appConfig['db']);
            }
        );

        //Router
        $router = new \Phalcon\Mvc\Router();
        $router->setUriSource(\Phalcon\Mvc\Router::URI_SOURCE_SERVER_REQUEST_URI);
        $di->setShared(self::DI_ROUTER, $router);

        //Url Helper
        $di->setShared(self::DI_URL_HELPER, new \Phalcon\Mvc\Url());

        //Listener
        $di->setShared(self::DI_REST_LISTENER, new \Georeferencer\Listener\Rest);

        return $this;
    }

    /**
     * Attach routes to the application.
     * @return \Georeferencer\Application\Micro
     **/
    private function bootstrapRouting()
    {
        $config = $this->getApplication()->getDI()->get(self::DI_CONFIG);
        $this->getApplication()->notFound(
            function () {
                $controller = new \Georeferencer\Controller\IndexCtrl();
                return $controller->notFound();
            }
        );

        if (isset($config['routesCollection'])) {
            foreach ($config['routesCollection'] as $routeCollection) {
                $collection = new \Phalcon\Mvc\Micro\Collection();
                $collection->setHandler($routeCollection['setHandler'], true);
                foreach ($routeCollection['routes'] as $type => $routes) {
                    foreach ($routes as $pattern => $callback) {
                        $collection->{$type}($pattern, $callback);
                    }
                }
                $this->getApplication()->mount($collection);
            }
        }

        //Set the correct url for the helper.
        if (isset($_SERVER['SERVER_NAME'])) {
            // Detect scheme
            $scheme = 'http';
            if (isset($_SERVER['HTTPS'])) {
                $scheme = 'https';
            }
            if (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
                $scheme = $_SERVER['HTTP_X_FORWARDED_PROTO'];
            }
            $this->getApplication()
                    ->getDI()
                    ->get(self::DI_URL_HELPER)
                    ->setBaseUri($scheme . '://' . $_SERVER['SERVER_NAME']);
        }
        return $this;
    }

    /**
     * Attach event listener that deals with data formatting, attaches
     * headers etc..
     * @return \Georeferencer\Application\Micro
     **/
    private function bootstrapEvents()
    {
        $listener = $this->getApplication()->getDI()->get(self::DI_REST_LISTENER);
        $this->app->getEventsManager()->attach('micro:beforeExecuteRoute', $listener);
        $this->app->getEventsManager()->attach('micro:afterHandleRoute', $listener);
        return $this;
    }

    /**
     * Register error handler for the whole application.
     * @return \Georeferencer\Application\Micro
     **/
    private function bootstrapErrorHandling()
    {
        $di = $this->getApplication()->getDI();
        set_exception_handler(
            function (\Exception $e) use ($di) {
                return $di->get(self::DI_REST_LISTENER)
                          ->sendErrorResponse($di->get(self::DI_APPLICATION)->getApplication(), $e->getMessage(), 500);
            }
        );
        return $this;
    }

    /**
     * @return \Phalcon\Mvc\Micro
     **/
    public function getApplication()
    {
        return $this->app;
    }

    /**
     * Wrapper setting the format to all listeners implementing the
     * ResponseMutatorInterface
     * @param string
     **/
    public function setResponseFormat($format = ResponseMutatorInterface::JSON)
    {
        foreach ($this->app->getEventsManager()->getListeners('micro:afterHandleRoute') as $listener) {
            if ($listener instanceof ResponseMutatorInterface) {
                $listener->setResponseFormat($format);
            }
        }
        return true;
    }
}