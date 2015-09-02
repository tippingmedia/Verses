<?php

/**
 * Verses by TippingMedia
 *
 * @package   Verses
 * @author    Adam Randlett
 * @copyright Copyright (c) 2015, TippingMedia
 */


namespace Craft;

class Verses_GuzzleService extends BaseApplicationComponent
{
    
    protected $baseUrl = 'https://bibles.org/v2/';
    protected $fums = array();

    public function biblesURLQuery($options)
    {

      $settings = craft()->plugins->getPlugin('verses')->getSettings();
      $api = $options['apiType'];

      $version = array_key_exists('version',$options) ? $options['version'] : $settings['bibleVersion'];
      $marginalia = array_key_exists('marginalia',$options) ? $options['marginalia'] : false;

      unset($options['apiType']);
      $params = http_build_query(array_filter($options));
      $query;
        

      switch ($api) 
      {

        case 'passage':
        
          if (array_key_exists('passage',$options)) 
          {
            $query = "passages.js" . "?q[]=" . strtolower($options['passage']) . "&version=" . $version . "&include_marginalia=" . $marginalia;
          }
          else
          {
            $query = "passages.js" . "?q[]=" . strtolower($options['book']) . "+" . $options['verse']."&version=" . $version . "&include_marginalia=" . $marginalia;
          }
          break;

        case 'chapters':
            // osis eng-ESV:2Tim
            // endpoint ==
            if (array_key_exists('endpoint',$options)) 
            {
                if ($options['endpoint'] == 'books') 
                {
                    $query = "books/" . $options['osis'] . ".js?" . "include_marginalia=" . $marginalia;
                }
                elseif($options['endpoint'] == 'chapters')
                {
                    $query = "chapters/" . $options['osis'] . ".js?" . "include_marginalia=" . $marginalia;
                }
            }
            else
            {
                $query = "chapters/" . $options['osis'] . ".js?" . "include_marginalia=" . $marginalia;
            }
            
          break;

        case 'search':
            $query = "search.js?" . $params;
          break;

        case 'books':
            // &include_chapters = true
            // &testament = NT
            
            $query = "versions/" . $options['version'] . "/books.js?" . $params;
          break;

        case 'verses':
            if (array_key_exists('start', $options) && array_key_exists('end', $options)) 
            {
               $query = "chapters/" . $options['chapter'] . "/verses.js?start=" . $options['start'] . "&end=" . $options['end'];
            }
            else
            {
                $query = "chapters/" . $options['chapter'] . "/verses.js";
            }
            
          break;
        
        default:
            return;
          break;
      }

      return $this->baseUrl . $query;

    }


    public function get($options)
    {
      // Plugin settings
      $settings = craft()->plugins->getPlugin('verses')->getSettings();

      // Bibles.org account api token
      $token = $settings->token; 

      //Bible version defaults to settings (eng-ESV)
      $version = array_key_exists('version', $options) ? $options['version'] : $settings->bibleVersion;

      // Get bibles.org api specific url params
      $url = $this->biblesURLQuery($options);


      // Check to see if the response is cached
      $cachedResponse = craft()->fileCache->get($url);

      if ($cachedResponse) 
      {
        // adds to the FUMS array
        //array_push($this->fums, $cachedResponse['response']['meta']['fums']);
        return $cachedResponse;
      }
 

      try 
      {

        $client = new \Guzzle\Http\Client();
        $request = $client->get($url);

        $request->getCurlOptions()->set(CURLOPT_SSL_VERIFYHOST, false);
        $request->getCurlOptions()->set(CURLOPT_SSL_VERIFYPEER, false);
        $request->getCurlOptions()->set(CURLOPT_RETURNTRANSFER, true);
        $request->getCurlOptions()->set(CURLOPT_FOLLOWLOCATION, true);
        $request->getCurlOptions()->set(CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        $request->getCurlOptions()->set(CURLOPT_USERPWD, "$token:X");

        $response = $request->send();

        if (!$response->isSuccessful()) 
        {
          return;
        }

        $references = $response->json();
        // Cache the response
        craft()->fileCache->set($url, $references);

        //set FUMS Array
        array_push($this->fums, $cachedResponse['response']['meta']['fums']);

        return $references;


      } 
      catch(\Exception $e) 
      {
        VersesPlugin::log($e->getResponse(), LogLevel::Error);
        VersesPlugin::log($e->getRequest(), LogLevel::Info);
        return;
      }
    }


    /**
     * Returns an array of Fair Usage Management Scripts 
     * required by Bibles.org
     * @return array js script text
     */
    public function fums()
    {
        return $this->fums;
    }

}