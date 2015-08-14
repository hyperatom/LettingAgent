'use strict';

var cheerio = require('cheerio'),
    url     = require('url');

module.exports = function() {

    function relativeToAbsolute(relativeTo, pageMarkup) {

        var $ = cheerio.load(pageMarkup);

        var tagsToUpdate  = ['a', 'img', 'link'],
            elemsToUpdate = getElementsToUpdate($, tagsToUpdate);

        elemsToUpdate.each(function() {

            resolveAttributeUrl($, this, 'href', relativeTo);
            resolveAttributeUrl($, this, 'src', relativeTo);
        });

        return $.html();
    }

    function resolveAttributeUrl($, element, attributeName, relativeTo) {

        var relativeUrl = element.attribs[attributeName];

        if (relativeUrl) {

            var absoluteHrefUrl = url.resolve(relativeTo, relativeUrl);

            $(element).attr(attributeName, absoluteHrefUrl);
        }
    }

    function getElementsToUpdate($, tags) {

        return $(tags.join(','));
    }

    return {
        relativeToAbsolute: relativeToAbsolute
    };
};