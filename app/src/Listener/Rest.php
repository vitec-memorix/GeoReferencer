<?php

namespace Georeferencer\Listener;

use Phalcon\Events\Event;
use Phalcon\Mvc\Micro;

use Georeferencer\Listener\ResponseMutatorTrait;
use Georeferencer\Application\Micro as Application;

class Rest implements ResponseMutatorInterface
{
    use ResponseMutatorTrait;

    /**
     * Check api request to see if the correct authorization is provided.
     * @param  Event $event
     * @param  Micro $app
     * @return void
     */
    public function beforeExecuteRoute(Event $event, Micro $app)
    {
        $this->attachResponseModifier($app);

        //Acl and payload check goes here.
    }

    /**
     * @param Event $event
     * @param Micro $app
     */
    public function afterHandleRoute(Event $event, Micro $app)
    {
        $this->mutateResponse($app);
    }

    /**
     * Send error response
     * @param  Micro   $app
     * @return boolean
     */
    public function sendErrorResponse(Micro $app, $message, $code = 403)
    {

        $response = $app->response;

        $this->addResponseHeaders($app, $response);

        $response->setStatusCode($code, $message);

        $this->mutateResponse(
            $app,
            $response,
            [
                'code' => $code,
                'msg' => $message
            ]
        );
        return false;
    }

    /**
     * In phalcon, the availability of parameters in MICRO
     * applications events is not the same as the availability in regular
     * applications.
     * We have no easy way to access the controller name in the
     * beforeExecute event.
     * This is a hack that allows us to extract it, so we know which
     * controller class we are dispatching to.
     * @return strin|null
     **/
    private function extractDispatchInformation(Micro $app)
    {
        $controllerName = null;
        $actionName = null;
        $handler = $app->getActiveHandler();
        if (isset($handler[0]) && $handler[0] instanceof \Phalcon\Mvc\Micro\LazyLoader) {
            $reflector = new \ReflectionProperty($handler[0], '_definition');
            $reflector->setAccessible(true);
            $controllerName = $reflector->getValue($handler[0]);
        }

        if (isset($handler[1])) {
            $actionName = $handler[1];
        }
        return [$controllerName, $actionName];
    }
}
