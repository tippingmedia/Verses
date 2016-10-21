<?php

/**
 * Verses by TippingMedia
 *
 * @package   Verses
 * @author    Adam Randlett
 * @copyright Copyright (c) 2016, TippingMedia
 */


namespace Craft;

class Verses_FumsService extends BaseApplicationComponent
{
    function renderFums() 
    {   
        //store current path
        $oldPath = craft()->path->getTemplatesPath();
        //set new path to verses templates
        $newPath = craft()->path->getPluginsPath().'verses/templates';
        craft()->path->setTemplatesPath($newPath);
        // FUMS template
        $templateName = '_fums';

        $fumsData = craft()->verses_guzzle->fums();
        $htmlResponse = craft()->templates->render($templateName, array("fums" => $fumsData));
        //reset path
        craft()->path->setTemplatesPath($oldPath);

        return $htmlResponse;
    }
}