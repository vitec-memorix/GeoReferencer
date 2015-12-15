<?php
namespace Georeferencer\Controller;

use Georeferencer\Resources\Gdal;

/**
 * @acl access whitelist
 **/
class DownloadCtrl extends AbstractCtrl
{
    /**
     * @acl access public
     */
    public function get($id, $format = null) 
    {
        try {
            $request = new \Phalcon\Http\Request();
            $fileName = $request->get('fileName', null, '');
            switch ($format) {
                case 'geojson':
                    $file = '/assets/images/' . $id . '_geo_warp.json';
                    $fileName = preg_replace('~\..*$~', '_geo_json.json', $fileName);
                    break;
                case 'geotiff':
                    $file = '/assets/images/' . $id . '_geo_warp.tiff';
                    $fileName = preg_replace('~\..*$~', '_geo_tiff.tiff', $fileName);
                    break;
                default:
                    $file = '/assets/images/' . $id;
                    break;
            }
            if (file_exists($file)) {
                header('Content-Description: File Transfer');
                header('Content-Type: application/octet-stream');
                header('Content-Disposition: attachment; filename="' . $fileName . '"');
                header('Expires: 0');
                header('Cache-Control: must-revalidate');
                header('Pragma: public');
                header('Content-Length: ' . filesize($file));
                readfile($file);
                exit;
            }
            throw new Exception('File not found.');
        } catch (Exception $ex) {
            return $ex->getMessage();
        }
    }
}