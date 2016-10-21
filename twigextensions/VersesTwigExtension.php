<?php
namespace Craft;

use \Twig_Extension;
use \Twig_Filter_Method;

class VersesTwigExtension extends \Twig_Extension
{
  protected $env;
  
  public function getName()
  {
    return 'VersesTwig';
  }

  public function initRuntime(\Twig_Environment $env)
  {
      $this->env = $env;
  }

  public function getFilters()
  {
    return array(
      'passage' => new \Twig_Filter_Method($this, 'getPassage'),
      'books' => new \Twig_Filter_Method($this, 'getBook'),
      'verses' => new \Twig_Filter_Method($this, 'getVerses')
    );
  }

  public function getFunctions()
  {
    return array(
        'passage' => new \Twig_Function_Method($this, 'getPassage'),
        'books' => new \Twig_Function_Method($this, 'getBook'),
        'verses' => new \Twig_Function_Method($this, 'getVerses')
    );
  }

  
  function getPassage($refObj, array $criteria = array())
  {
    
    $criteria['apiType'] = 'passage';
    $criteria['passage'] = $this->sanitizeRef($refObj);
    $output = "";

    $response = craft()->verses_guzzle->get($criteria);
    
    if ($response['response']['search']['result']['passages']) 
    {
      $output = strip_tags($response['response']['search']['result']['passages'][0]['text']);
    }

    return $output;
  }


  function getVerses($str, array $criteria = array())
  {
    $criteria['apiType'] = 'verses';
    $criteria['chapter'] = $str;
    $response = craft()->verses_guzzle->get($criteria);
    $output = array();
    foreach ($response['response']['verses'] as $verse) {
      array_push($output, strip_tags($verse['text']));
    }
    return implode(" ", $output);
  }


  function sanitizeRef($refObj)
  {
    if (is_array($refObj) && array_key_exists('osis',$refObj)) 
    {
      $reference = $refObj['osis'];
    }
    elseif (is_string($refObj))
    {
      $reference = str_replace(" ", "+", $refObj);
    }

    return $reference;
  }

}