<?php
/**
 * @link      https://tippingmedia.com
 * @copyright Copyright (c) 2015, Tipping Media
 * @license   https://tippingmedia.com 
 * (1Cor10:31)
 */

namespace Craft;

require_once(CRAFT_PLUGINS_PATH.'verses/Info.php');

class VersesPlugin extends BasePlugin
{
    // Public Methods
    // =========================================================================

    /**
     * Get Name
     */
    function getName()
    {
        return Craft::t('Verses');
    }

    /**
     * Get Version
     */
    function getVersion()
    {
        return VERSES_VERSION;
    }

    /**
     * Get Developer
     */
    function getDeveloper()
    {
        return 'Tipping Media';
    }
    /**
     * Get Developer URL
     */
    function getDeveloperUrl()
    {
        return 'http://tippingmedia.com/';
    }

    public function getDescription()
    {
        return "Bible Verses For Craft CMS.";
    }

    public function getIconPath()
    {
        return craft()->path->getPluginsPath().'/resources/verses.svg';
    }

    public function getDocumentationUrl()
    {
        return 'https://github.com/tippingmedia/Verses';
    }

    public function getReleaseFeedUrl()
    {
        return "https://venticalendar.io/plugin/releases.json";
    }
    

    /**
     * Has CP Section
     */
    public function hasCpSection()
    {
        return false;
    }

    /**
     * Define Settings
     */
    protected function defineSettings()
    {
        return array(
            'token'           => array(AttributeType::String, 'required' => true),
            'bibleVersion'    => AttributeType::String
        );
    }

    /**
     * Get Settings URL
     */
    public function getSettingsHtml()
    {
        return craft()->templates->render('verses/_settings', array(
            'settings' => $this->getSettings()
        ));
    }

    public function addTwigExtension()
    {
        Craft::import('plugins.verses.twigextensions.VersesTwigExtension');
        return new VersesTwigExtension();
    }
}
