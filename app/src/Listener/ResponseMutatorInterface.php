<?php
namespace Georeferencer\Listener;

use Phalcon\Mvc\Micro;
use Phalcon\Http\Response;

/**
 * This interfaces specifies that the event listener will affect the
 * application request and accepts format specification.
 **/
interface ResponseMutatorInterface
{
    const JSON = 'json';
    const JSONP = 'jsonp';
    const XML = 'xml';

    /**
     * @param string
     **/
    public function setResponseModifier($mod);

    /**
     * @param string
     * @return mixed
     **/
    public function getResponseModifier();

    /**
     * Fetch the format for teh specific request.
     * @return string
     **/
    public function getResponseFormat();

    /**
     * Specify response format by contants.
     * @param string
     **/
    public function setResponseFormat($format = self::JSON);

    /**
     * Process and mutate current response according to needs.
     * @param \Phalcon\Mvc\Micro $app
     * @param \Phalcon\Http\Response $response
     * @param mixed $content
     **/
    public function mutateResponse(Micro $app, Response $response = null, $content = null);
}