<?php

namespace Craft;

/**
 * Verses Variable provides access to database objects from templates
 */
class VersesVariable
{

    /**
     * Return books of the bible
     *
     * @param  array $criteria [testament = NT|OT , include_chapters = bool]
     * @return array of bible books
     */
    public function books($criteria = array())
    {
        $criteria['apiType'] = 'books';
        $response = craft()->verses_guzzle->get($criteria);
        return $response['response']['books'];
    }


    /**
     * Return a passage of scripture
     * @param  array  $criteria [(passage || book,verse),version,marginalia]
     * @return array  http://bibles.org/pages/api/documentation/books
     */
    public function passage($criteria = array())
    {
        $criteria['apiType'] = 'passage';
        $criteria['passage'] = str_replace(" ", "+", $criteria['passage']);
        $response = craft()->verses_guzzle->get($criteria);
        return $response['response']['search']['result']['passages'];
    }


    /**
     * Return bible verses
     * @param  array  $criteria [chapter:OSIS,apiType,start,end] if start must have end
     * @return array  verses
     */
    public function verses($criteria = array())
    {
        $criteria['apiType'] = 'verses';
        $response = craft()->verses_guzzle->get($criteria);
        return $response['response']['verses'];
    }


    public function fums()
    {
        $response = craft()->verses_guzzle->fums();
        return $response;
    }


}