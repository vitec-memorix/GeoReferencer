<?php
namespace Georeferencer\Controller;

use Georeferencer\Resources\Gdal;
use Georeferencer\Application\Micro as Application;

/**
 * @acl access whitelist
 **/
class GeoCtrl extends AbstractCtrl
{
    const HISTORICAL_SEARCH_URL = 'https://api.histograph.io/search?q=';
    
    /**
     * @acl access public
     */
    public function get($store) 
    {
        try {
            if (is_file('/assets/images/' . $store . '_geo_warp.tiff')) {
                return ['store' => $store];
            }
        } catch (Exception $ex) {
            return $ex->getMessage();
        }
    }
    
    /**
     * @acl access public
     */
    public function preview() 
    {
        try {
            $post = $this->getBodyParams();
            if (empty($post) || empty($post['referencePoints'])){
                throw new Exception('No reference points found.', 404);
            }
            if (count($post['referencePoints']) < 3) {
                throw new Exception('Not enough reference points. Minimum number of reference points required are 3.', 404);
            }
            if (empty($post['image'])) {
                throw new Exception('No image found.', 404);
            }
            if (empty($post['storeName'])) {
                throw new Exception('No store name found.', 404);
            }

            if (!is_file('/assets/images/' . $post['storeName'] . '_geo_warp.tiff')) {
                register_shutdown_function([$this, 'gdalConvert'], $post);
                ignore_user_abort(true);
                header('Content-Length: 0');
                header('Connection: close');
                header('Content-Type: application/json');
                
                header('Access-Control-Allow-Credentials: true');
                header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
                header('Access-Control-Allow-Headers: Accept, Accept-Encoding, Accept-Language, Authorization, Cache-Control, Content-Type, X-Requested-With');
                
                $appConfig = $this->getDI()->get(Application::DI_CONFIG);
                if (isset($appConfig['cors'])) {
                    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

                    $origins = explode(';', $appConfig['cors']);
                    $origins = array_map('trim', $origins);
                    if (in_array($origin, $origins)) {
                        header('Access-Control-Allow-Origin: ' . $origin);
                    }
                } else {
                    header('Access-Control-Allow-Origin: *');
                }
                
                ob_end_flush();
                ob_flush();
                flush();
                die;
            }
            
            return ['store' => $post['storeName']];
        } catch (Exception $ex) {
            return $ex->getMessage();
        }
    }
    
    public function gdalConvert($post)
    {
        $config = $this->getDi()->get('config');
        $gdal = new \Georeferencer\Resources\Gdal($config);
        $gdal->setImage($post['image'])
            ->setCoverageStore($post['storeName'])
            ->setReferencePoints($post['referencePoints']);
        $gdal->convert();
    }
    
    /**
     * @acl access public
     */
    public function historicalSearch($search) 
    {
        try {
            if (empty($search)) {
                return [];
            }

            $handle = curl_init(self::HISTORICAL_SEARCH_URL . $search);
            curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'GET');
            curl_setopt($handle,CURLOPT_RETURNTRANSFER,1);
            curl_setopt($handle,CURLOPT_SSL_VERIFYPEER,0);
            $response = curl_exec($handle);
            curl_close($handle);
            return json_decode($response, true);
        } catch (Exception $ex) {
            return $ex->getMessage();
        }
    }
}
