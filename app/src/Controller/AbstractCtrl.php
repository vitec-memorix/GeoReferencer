<?php
namespace Georeferencer\Controller;

use Phalcon\Http\Response;

/**
 * @acl access whitelist
 **/
class AbstractCtrl extends \Phalcon\Mvc\Controller
{
    /**
     * This is a shitty function that decodes parameters.(for put etc)
     * @return array
     */
   protected function getBodyParams()
   {
       $paramData = [];
       $requestBody = urldecode($this->request->getRawBody());
       $paramData = json_decode($requestBody, true);
       if (!is_array($paramData)) {
           parse_str($requestBody, $paramData);
       }

       return $paramData;
   }
}