<?php
namespace Georeferencer\Controller;

use Georeferencer\Resources\Gdal;

/**
 * @acl access whitelist
 **/
class GeoCtrl extends AbstractCtrl
{
    const HISTORICAL_SEARCH_URL = 'https://api.histograph.io/search?q=';
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
                $config = $this->getDi()->get('config');
                $gdal = new Gdal($config);
                $gdal->setImage($post['image'])
                    ->setCoverageStore($post['storeName'])
                    ->setReferencePoints($post['referencePoints']);
                return $gdal->convert();
            }
            return ['store' => $post['storeName']];
        } catch (Exception $ex) {
            return $ex->getMessage();
        }
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
