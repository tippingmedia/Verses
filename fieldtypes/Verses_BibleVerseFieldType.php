<?php

/**
 * Verses by TippingMedia
 *
 * @package   Verses
 * @author    Adam Randlett
 * @copyright Copyright (c) 2015, Tipping Media
 */

namespace Craft;

class Verses_BibleVerseFieldType extends BaseFieldType
{

  /**
   * Block type name
   */
  public function getName()
  {
    return Craft::t('Bible Verses');
  }

  // --------------------------------------------------------------------

  /**
   * Save it
   */
  public function defineContentAttribute()
  {
    return AttributeType::Mixed;
  }
    

  /**
   * Returns the field's input HTML.
   *
   * @param string $name
   * @param mixed  $value
   * @return string
   */
  public function getInputHtml($name,$value)
  {
    // Reformat the input name into something that looks more like an ID
    $id = craft()->templates->formatInputId($name);

    // Figure out what that ID is going to look like once it has been namespaced
    $namespacedId = craft()->templates->namespaceInputId($id);

    $settings = $this->bibleVersion();

    return craft()->templates->render('verses/_fields/input', array(
        'value' => $value ? $value : '',
        'version' => $settings['bibleVersion'],
        'fieldId' => $id,
        'name' => $name
    ));
  }



   public function bibleVersion(){
    return craft()->plugins->getPlugin('verses')->getSettings();
   }



 /**
   * Returns the input value as it should be saved to the database.
   *
   * @param mixed $value
   * @return mixed
   */
  public function prepValueFromPost($value)
  {
    return json_encode($value);
  }



  public function prepValue($value)
  {
    return $value;
  }

  /**
   * Validates the value.
   *
   * Returns 'true' or any custom validation errors.
   *
   * @param array $value
   * @return true|string|array
   */
  // public function validate($value)
  // {
  //   return true;
  // }


}
