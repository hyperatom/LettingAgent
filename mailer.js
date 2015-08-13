'use strict';

var nodemailer    = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    logger        = require('./logger')(),
    env           = require('./env')(),
    config        = require('./config')();

module.exports = function() {

    var emailRecipeints = [
        'a.j.barrell@gmail.com',
        'b_nash1992@hotmail.co.uk'
    ];

    function sendProperties(agentName, newListingsMarkup) {

        var emailContent = concatListingMarkups(newListingsMarkup);

        sendPropertiesToRecipients(agentName, emailContent, emailRecipeints);
    }

    function sendPropertiesToRecipients(agentName, emailContent, recipients) {

        var mailOptions = {
            from:    'Adam Barrell <adam@adambarrell.co.uk>',
            to:      recipients.join(),
            subject: agentName + ' Has New Properties!',
            html:    emailContent
        };

        if (env.isDebugging()) {

            logger.debug('Mailing properties...\n\n' + emailContent);

        } else {

            var transporter = getTransporter();

            transporter.sendMail(mailOptions, catchSendMailError);
        }
    }

    function catchSendMailError(errorMessage) {

        if (errorMessage) {
            logger.log(errorMessage);
        }
    }

    function concatListingMarkups(newListingsMarkup) {

        var markup = '';

        for (var i = 0; i < newListingsMarkup.length; i++) {

            markup += newListingsMarkup[i].content;
            markup += '<br /><br />';
        }

        return markup;
    }

    function getTransporter() {

        var mailConfig = config.getConfig('mail');

        return nodemailer.createTransport(smtpTransport({
            host: mailConfig.host,
            port: mailConfig.port,
            secure: false,
            ignoreTLS: true,
            auth: {
                user: mailConfig.user,
                pass: mailConfig.pass
            }
        }));
    }

    return {
        sendProperties: sendProperties
    };
};