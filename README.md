# Verses
#### Craft CMS Plugin for finding and outputting bible verses.


### Installation 
Download the folder extract and place the **Verses** folder in *Craft > Plugins* folder. In the Craft CMS backend go to *Settings > Plugins* an click to install the Verses Plugin. 

Obtain an API key from [http://bibles.org/](http://bibles.org/pages/api) and add this key to the settings of the plugin. Select a default version of the bible.

Add the Verses input to one of your Sections.


### Usage
*To comply with Bibles.org Fair Use Management Rules this code must be included in your template you are using verses plugin to output passages. 
<pre><code>{% set fums = craft.verses.fums() %}
{% for item in fums %}
    {{ item|raw }}
{% endfor %}
</code></pre>
Or you can use the Hook provided
<pre><code>{% hook 'fums' %}</code></pre>

### Verses Input
The input saves an array of objects. The single object includes:

<pre><code>{
    reference: Romans 10:9,
    osis: Rom.10.9
}
</code></pre>

#### To output your first reference from the input.
<pre><code>{{ entry.versesInput[0].reference }}</code>
<code>{{ entry.versesInput[0].osis }}</code></pre>

You can specify a different version than the one selected in the Verses settings.
<pre><code>{% for item in entry.versesInput %}
    {{ item.reference }}
    {{ item|passage({'version':'eng-ESV'})|raw }}
{% endfor %}
</code></pre>

#### Output a chapter without the input
*note it uses OSIS notation
<pre><code>{% set passages = craft.verses.verses({'chapter':"eng-ESV:Rom.8"}) %}
{% if passages|length %}
    {% for item in passages %}
        {{ item.text|raw }}
    {% endfor %}
{% endif %}
</code></pre>

#### Output the books of the bible
<pre><code>{% set books = craft.verses.books({"version":"eng-ESV"}) %}
{% for item in books %}
    {{ item.name }}
{% endfor %}
</code></pre>


### License
This plugin relies on Bibles.org's API.  You will need to follow their [Fair Use Management Rules](http://bibles.org/pages/api#what-is-fums) to use this plugin. 
Use this plugin at your own risk. We are not responsible for any damage to your content, code, or anything else due to the use of this plugin. It is meant to be a blessing, and take it as such.


### Credit
Many thanks to [Bibles.org](http://bibles.org) for providing api to search the word of God. Second I would like to thank [Openbible.info](https://github.com/openbibleinfo) for the Bible Passage Reference Parser. 

  
