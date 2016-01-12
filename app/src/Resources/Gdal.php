<?php
namespace Georeferencer\Resources;

class Gdal
{
    const GDAL_GCP = '-gcp %1$s %2$s %3$s %4$s';
    const GDAL_TRANSLATE = 'gdal_translate -a_srs EPSG:4326 %1$s "%2$s" "%3$s"';
    const GDAL_WARP = 'gdalwarp -dstalpha "%1$s" "%2$s"'; // -co TFW=YES creates word file
    const GDAL_INFO = 'gdalinfo -json "%1$s"';
    
    protected $image;
    
    protected $coverageStore;
    
    protected $referencePoints = [];
    
    protected $config;
    
    public function __construct($config = []) 
    {
        $this->config = $config;
    }
    
    public function setImage($image)
    {
        $this->image = $image;
        return $this;
    }
    
    public function setCoverageStore($coverageStore)
    {
        $this->coverageStore = $coverageStore;
        return $this;
    }
    
    public function setReferencePoints($referencePoints)
    {
        $this->referencePoints = $referencePoints;
        return $this;
    }
    
    /**
     * @acl access public
     */
    public function convert() 
    {
        $this->warp()
            ->addWorkspace()
            ->addCoverageStore()
            ->addCoverageFile()
            ->createGeoJson();
        
        return ['store' => $this->coverageStore];
    }
    
    protected function addWorkspace() 
    {
        $config = $this->config;
        $url = $config['geoserver']['url'] . '/workspaces/' . $config['geoserver']['workspace'];
        $handle = curl_init($url);
        curl_setopt($handle, CURLOPT_GET, true);
        curl_setopt($handle,CURLOPT_RETURNTRANSFER,1);
        curl_setopt($handle, CURLOPT_USERPWD, $config['geoserver']['user'] . ':' . $config['geoserver']['pass']);
        curl_setopt($handle, CURLOPT_HTTPHEADER, array("Content-type: text/xml", "Accept: text/xml"));
	$response = curl_exec($handle);
	curl_close($handle);
        
        if (strpos($response, 'No such workspace') === false) {
            return $this;
        }
        $config = $this->config;
        $url = $config['geoserver']['url'] . '/workspaces';
        $request = '<workspace><name>' . $config['geoserver']['workspace'] . '</name></workspace>';
        $handle = curl_init($url);
        curl_setopt($handle, CURLOPT_POST, true);
        curl_setopt($handle,CURLOPT_RETURNTRANSFER,1);
        curl_setopt($handle, CURLOPT_USERPWD, $config['geoserver']['user'] . ':' . $config['geoserver']['pass']);
        curl_setopt($handle, CURLOPT_HTTPHEADER, array("Content-type: application/xml"));
        curl_setopt($handle, CURLOPT_POSTFIELDS, $request);
	$response = curl_exec($handle);
	curl_close($handle);
        return $this;
    }
    
    protected function addCoverageFile() 
    {
        $config = $this->config;
        $url = $config['geoserver']['url'] . '/workspaces/' . $config['geoserver']['workspace'] . '/coveragestores/' . $this->coverageStore . '/external.geotiff?configure=first&coverageName=' . $this->coverageStore ;
        $request = 'file:/assets/images/' . $this->coverageStore . '_geo_warp.tiff';
        $handle = curl_init($url);

        curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($handle,CURLOPT_RETURNTRANSFER,1);
        curl_setopt($handle, CURLOPT_USERPWD, $config['geoserver']['user'] . ':' . $config['geoserver']['pass']);
        curl_setopt($handle, CURLOPT_HTTPHEADER, array("Content-type: text/plain"));
        curl_setopt($handle, CURLOPT_POSTFIELDS, $request);
	$response = curl_exec($handle);
	curl_close($handle);
        return $this;
    }
    
    protected function warp() 
    {
        $points = [];
        foreach ($this->referencePoints as $reference) {

            $points[] = sprintf(
                self::GDAL_GCP,
                $reference['tileCoordinatesX'],
                $reference['tileCoordinatesY'],
                $reference['geoCoordinatesX'],
                $reference['geoCoordinatesY']
            );
        }
        $points = implode(' ', $points);
        
        $progress = 0;
        $cmd = sprintf(
            self::GDAL_TRANSLATE,
            $points,
            $this->image,
            '/assets/images/' . $this->coverageStore . '_geo.tiff'
        );
        $progress = shell_exec($cmd);

        if (is_null($progress) || strpos($progress, 'done') === false) {
            throw new Exception('There was a problem trying to geo reference original image.');
        }
        
        $cmd = sprintf(
            self::GDAL_WARP, 
            '/assets/images/' . $this->coverageStore . '_geo.tiff', 
            '/assets/images/' . $this->coverageStore . '_geo_warp.tiff'
        );
        $progress = shell_exec($cmd);

        if (is_null($progress) || strpos($progress, 'done') === false) {
            throw new Exception('There was a problem warping geo referenced image.');
        }
        
        return $this;
    }
    
    protected function addCoverageStore() 
    {
        $config = $this->config;
        $url = $config['geoserver']['url'] . '/workspaces/' . $config['geoserver']['workspace'] . '/coveragestores';
        $request = '<coverageStore><name>' . $this->coverageStore . '</name><workspace>' . $config['geoserver']['workspace'] . '</workspace><enabled>true</enabled></coverageStore>';
        $handle = curl_init($url);
//        $f = fopen("/assets/images/request.txt", "w");
        curl_setopt($handle, CURLOPT_POST, True);
        curl_setopt($handle,CURLOPT_RETURNTRANSFER,1);
        curl_setopt($handle, CURLOPT_USERPWD, $config['geoserver']['user'] . ':' . $config['geoserver']['pass']);
        curl_setopt($handle, CURLOPT_HTTPHEADER, array("Content-type: application/xml"));
        curl_setopt($handle, CURLOPT_POSTFIELDS, $request);
//        curl_setopt($handle, CURLOPT_VERBOSE, 1);
//        curl_setopt($handle, CURLOPT_STDERR, $f);
	$response = curl_exec($handle);
	curl_close($handle);
//        fclose($f);
        return $this;
    }
    
    public function delete() 
    {
        if (empty($this->coverageStore)) {
            throw new Exception('Invalid store.');
        }
        $config = $this->config;
        $url = $config['geoserver']['url'] . '/workspaces/' . $config['geoserver']['workspace'] . '/coveragestores/' . $this->coverageStore . '?recurse=true';
        $handle = curl_init($url);

        curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($handle,CURLOPT_RETURNTRANSFER,1);
        curl_setopt($handle, CURLOPT_USERPWD, $config['geoserver']['user'] . ':' . $config['geoserver']['pass']);
        curl_setopt($handle, CURLOPT_HTTPHEADER, array("Content-type: text/plain"));
	$response = curl_exec($handle);
	curl_close($handle);
        return $this;
    }
    
    protected function createGeoJson()
    {
        $cmd = sprintf(
            self::GDAL_INFO, 
            '/assets/images/' . $this->coverageStore . '_geo_warp.tiff'
        );
        $progress = shell_exec($cmd);

        if (is_null($progress) || strpos($progress, 'cornerCoordinates') === false) {
            throw new Exception('There was a problem creating geoJSON.');
        }
        $data = json_decode($progress);
        
        foreach ($data->cornerCoordinates as $point) {
            
        }
        
        $geoJson = json_encode([
            'type' => 'FeatureCollection',
            'features' => [
                'type' => 'Feature',
                'properties' => [],
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [
                        [
                            $data->cornerCoordinates->upperLeft[0],
                            $data->cornerCoordinates->upperLeft[1]
                        ],
                        [
                            $data->cornerCoordinates->upperRight[0],
                            $data->cornerCoordinates->upperRight[1]
                        ],
                        [
                            $data->cornerCoordinates->lowerRight[0],
                            $data->cornerCoordinates->lowerRight[1]
                        ],
                        [
                            $data->cornerCoordinates->lowerLeft[0],
                            $data->cornerCoordinates->lowerLeft[1]
                        ],
                        [
                            $data->cornerCoordinates->upperLeft[0],
                            $data->cornerCoordinates->upperLeft[1]
                        ]
                    ]
                ]
            ]
        ]);
        
        file_put_contents('/assets/images/' . $this->coverageStore . '_geo_warp.json', $geoJson);
        
        return $this;
    }
}
