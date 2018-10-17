import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { OHIF } from 'meteor/ohif:core';

Template.ohifViewer.onCreated(() => {
    const instance = Template.instance();
    instance.headerClasses = new ReactiveVar('');

    OHIF.header.dropdown.setItems([{
        action: () => OHIF.ui.showDialog('userPreferencesDialog'),
        text: 'Preferences',
        icon: 'fa fa-user',
        separatorAfter: true
    }, {
        action: () => OHIF.ui.showDialog('aboutModal'),
        text: 'About',
        icon: 'fa fa-info',
        separatorAfter: true
    }, {
        action: OHIF.user.logout,
        text: 'Logout',
        iconClasses: 'logout',
        iconSvgUse: 'packages/ohif_user-management/assets/user-menu-icons.svg#logout'
    }]);

    instance.autorun(() => {
        const currentRoute = Router.current();
        if (!currentRoute) return;
        const routeName = currentRoute.route.getName();
        const isViewer = routeName.indexOf('viewer') === 0;

        // Add or remove the strech class from body
        $(document.body)[isViewer ? 'addClass' : 'removeClass']('stretch');

        // Set the header on its bigger version if the viewer is not opened
        instance.headerClasses.set(isViewer ? '' : 'header-big');

        // Set the viewer open state on session
        Session.set('ViewerOpened', isViewer);
    });
});

Template.ohifViewer.events({
    'click .js-toggle-studyList'(event, instance) {
        event.preventDefault();
        const isViewer = Session.get('ViewerOpened');

        if (isViewer) {
            Router.go('studylist');
        } else {
            const { studyInstanceUids } = OHIF.viewer.data;
            if (studyInstanceUids) {
                Router.go('viewerStudies', { studyInstanceUids });
            }
        }
    }
});

Template.ohifViewer.helpers({

    userName: OHIF.user.getName,

    studyListToggleText() {
        const instance = Template.instance();
        const isViewer = Session.get('ViewerOpened');

        if (isViewer) {
            instance.hasViewerData = true;
            return 'Study list';
        }

        return instance.hasViewerData ? 'Back to viewer' : '';
    },

    inStudyList() {
        var routeName = Router.current().route.getName();
        return routeName === "studylist"
    }
});
