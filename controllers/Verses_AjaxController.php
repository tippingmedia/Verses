<?PHP
/**
 * Verses by TippingMedia
 *
 * @package   Verses
 * @author    Adam Randlett
 * @copyright Copyright (c) 2015, TippingMedia
 */

namespace Craft;

class Verses_AjaxController extends BaseController
{

    /**
     * Get passages of bible
     * @return array array objects from bibles.org api
     */
    public function actionGetPassages()
    {
        $this->requireAjaxRequest();
        $postData = craft()->request->getPost();
        $verses = craft()->verses_guzzle->get($postData);
        $this->returnJson($verses);

    }

    /**
     * return Fair Use Management scripts from Bibles.org api.
     * @return JSON array of scripts
     */
    public function actionGetFums()
    {
        $this->requireAjaxRequest();
        $fums = craft()->verses_guzzle->fums();
        $this->returnJson($fums);
    }

}
?>