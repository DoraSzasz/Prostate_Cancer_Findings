import { Template } from 'meteor/templating';
import { ActiveEntry } from 'meteor/clinical:active-entry';


Template.entrySignIn.hooks({

    rendered: function () {
        if (!Meteor.settings.public.demoUserEnabled) {
            return;
        }

        // Create Test Drive button dynamically
        let btnTestDrive = $('<button/>', {
            id: 'btnTestDrive',
            text: 'Explore Now',
            class: 'btn btn-success',
            style: 'width: 150px;', //  style: 'position: absolute; width: 150px; top: 60px; right: 20px; padding-left: 0;',
            title: 'Explore Study lists',
            click: function () {
                // Login with demo user
                ActiveEntry.signIn('demo@ohif.org', '12345678aA*');
            }
        });

        const entrySignIn = this.find('#btnDemo');
        $(entrySignIn).append(btnTestDrive);
    }

});