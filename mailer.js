'use strict';

var nodemailer    = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');

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

        var transporter = getTransporter();

        console.log('Mailing properties...');

        transporter.sendMail(mailOptions, function(error) {

            if (error) {
                console.log(error);
            } else {
                console.log(agentName + ' properties sent!');
            }
        });
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

        return nodemailer.createTransport(smtpTransport({
            host: 'adambarrell.co.uk',
            port: 25,
            secure: false,
            ignoreTLS: true,
            auth: {
                user: 'adam@adambarrell.co.uk',
                pass: 'lettingagent'
            }
        }));
    }

    return {
        sendProperties: sendProperties
    };
};