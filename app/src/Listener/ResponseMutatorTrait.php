<?php

namespace Georeferencer\Listener;

use Phalcon\Mvc\Micro;
use Phalcon\Http\Response;
use Georeferencer\Application\Micro as Application;

/**
 * This interfaces specifies that the event listener will affect the
 * application request and accepts format specification.
 **/
trait ResponseMutatorTrait
{
    /**
     * Headers that get attached to the response.
     * @var array
     **/
    public static $headers = [
        'Access-Control-Allow-Credentials' => 'true',
        'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers' => 'Accept, Accept-Encoding, Accept-Language, Authorization, Cache-Control, Content-Type, X-Requested-With'
    ];

   /**
     * Determine the response format.
     * @var string
     **/
    protected $responseFormat = self::JSON;

    /**
     * Can be used to store format specific data.
     * (e.g. jsonp callback)
     * @var string
     **/
    protected $responseModifier = null;

    /**
     **/
    public function setResponseModifier($mod)
    {
        $this->responseModifier = $mod;
        return $this;
    }

    /**
     **/
    public function getResponseModifier()
    {
        return $this->responseModifier;
    }

    /**
     **/
    public function setResponseFormat($format = ResponseMutatorInterface::JSON)
    {
        $this->responseFormat = $format;
        return $this;
    }

    /**
     **/
    public function getResponseFormat()
    {
        return $this->responseFormat;
    }

    /**
     * @param \Phalcon\Mvc\Micro
     **/
    public function attachResponseModifier(Micro $app)
    {
        if ($app->request->getQuery('callback')) {
            $this->setResponseFormat(ResponseMutatorInterface::JSONP);
            $this->setResponseModifier($app->request->getQuery('callback'));
        }
        return $this;
    }

    /**
     * @param \Phalcon\Mvc\Micro
     **/
    public function mutateResponse(Micro $app, Response $response = null, $content = null)
    {
        //If we didn't pass optional parameters, use the apps.
        if (is_null($content)) {
            $content = $app->getReturnedValue();
        }

        if (!($response instanceof Response)) {
            $response = $app->response;
        }

        $this->addResponseHeaders($app, $response);

        if ($content instanceof Response) {
            //We play safe here, fearing of API changes.
            if (method_exists($content, 'getHeaders')) {
                $headers = $content->getHeaders();
                if (method_exists($headers, 'toArray')) {
                    $headersArr = $headers->toArray();
                    if (is_array($headersArr)) {
                        foreach ($headersArr as $headerKey => $headerValue) {
                            $response->setHeader($headerKey, $headerValue);
                        }
                    }
                }
            }
            $responseValue = $content->getContent();
        } else {
            $responseValue = $content;
        }

        if (method_exists($this, $this->getResponseFormat())) {
            $this->{$this->getResponseFormat()}($responseValue, $app);
        }

        //Dispatch response if the controller response has not been sent...
        if (!($content instanceof Response) || !$content->isSent()) {
            //...and we have not dispatched the app response.
            if (!$response->isSent()) {
                $response->send();
            }
        }
    }

    /**
     * @param mixed
     * @param \Phalcon\Mvc\Micro
     **/
    protected function json($responseValue, Micro $app)
    {
        $app->response->setContentType('application/json')
                      ->setJsonContent($responseValue);
        return $this;

    }


    /**
     * @param mixed
     * @param \Phalcon\Mvc\Micro
     **/
    protected function jsonp($responseValue, Micro $app)
    {
        /**
         * 1.2.4 Response fix
         * @todo Remove following check, after the phalcon extension its updated to 1.3+
         */
        if (!empty($responseValue['error']['code'])) {
            $app->response->setStatusCode($responseValue['error']['code'], $responseValue['error']['message']);
        }

        $responseValue = $this->getResponseModifier() . '(' . json_encode($responseValue) . ')';
        $app->response->setContentType('application/javascript')
                      ->setContent($responseValue);
        return $this;
    }


    /**
     * @param mixed
     * @param \Phalcon\Mvc\Micro
     **/
    protected function xml($responseValue, Micro $app)
    {
        $app->response->setContentType('text/xml; charset=UTF-8')
                      ->setContent($responseValue);
        return $this;
    }

    /**
     * @param mixed
     * @param \Phalcon\Mvc\Micro
     **/
    protected function html($responseValue, Micro $app)
    {
        $app->response->setContentType('text/html; charset=UTF-8')
                      ->setContent($responseValue);
        return $this;
    }

    /**
     * Add specified headers to a response.
     **/
    protected function addResponseHeaders(Micro $app, Response $response)
    {
        $appConfig = $app->getDI()->get(Application::DI_CONFIG);
        if (isset($appConfig['cors'])) {
            $response->setHeader(
                'Access-Control-Allow-Origin',
                $appConfig['cors']
            );
        }

        //Attach headers always to request.
        foreach (static::$headers as $headerKey => $headerValue) {
            $response->setHeader($headerKey, $headerValue);
        }
        return $this;
    }
}
