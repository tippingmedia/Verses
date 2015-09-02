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

  
  function getPassage($str, array $criteria = array())
  {
    
    $newStr = str_replace(" ", "+", $str);
    $criteria['apiType'] = 'passage';
    $criteria['passage'] = $newStr;

    $response = craft()->verses_guzzle->get($criteria);

    return strip_tags($response['response']['search']['result']['passages'][0]['text']);
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

}