import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { OHIF } from 'meteor/ohif:core';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

AiPredictions = new Mongo.Collection('aiPredictions', {connection: null});

function precise(x) {
  return Number.parseFloat(x).toPrecision(4);
}

function askAi(data) {
    const studyInstanceUid = OHIF.viewerbase.layoutManager.viewportData[Session.get('activeViewport')]['studyInstanceUid'];
    const baseUrl = "http://206.189.232.24:5000/predict";
    const url = baseUrl + "?case="+ data.case +"&model_name="+ data.model_name +"&zone="+ data.zone +"&lps_x="+ data.lps[0] +"&lps_y="+ data.lps[1] +"&lps_z="+ data.lps[2];
    $("#ai-prediction").text("Calculating...");
    $.ajax({
      url: url,
      dataType: "json",
      success: (result) => {
          $("#ai-prediction").text(result.description);
          result['fid'] = data.fid;
          result['studyInstanceUid'] = studyInstanceUid;
          result['modelName'] = data.model_name;
          result['zone'] = data.zone;
          if (AiPredictions.find({'studyInstanceUid': studyInstanceUid, 'fid': data.fid}).count() < 15) {
              AiPredictions.insert(result);
          }
      },
      error: () => {
          setTimeout(() => {
              $("#ai-prediction").text("Somthing went wrong!");
          }, 300);
      }
    });
}

function buildDataForPrediction(zone) {
    const patientName = OHIF.viewer.StudyMetadataList.all()[0]._data.patientId;
    const modelName = Session.get('selectedModel');
    const lpsCoord = Session.get('currentFidPatientPoint');

    const data = {
      fid: Session.get('lastFidId'),
      case: patientName,
      model_name: modelName,
      zone: zone,
      lps: [lpsCoord.x,lpsCoord.y,lpsCoord.z]
    }

    return data;
}

Template.dialogAi.onCreated(() => {
    Meteor.subscribe('aiPredictions');
    const instance = Template.instance();

    const dismissModal = (promiseFunction, param) => {
        // Hide the modal, removing the backdrop
        instance.$('.modal').one('hidden.bs.modal', event => {
            // Resolve or reject the promise with the given parameter
            promiseFunction(param);
        }).modal('hide');
    };

    instance.api = {

        confirm() {
            const dismiss = param => dismissModal(instance.data.promiseResolve, param);

            dismiss();
        },

        cancel() {
            const dismiss = param => dismissModal(instance.data.promiseReject, param);

            const nearbyToolData = Session.get('nearbyToolData');
            const element = $('.imageViewerViewport').get(Session.get('activeViewport'));
            let probeX = nearbyToolData.tool.handles.end.x;
            let probeY = nearbyToolData.tool.handles.end.y;
            cornerstoneTools.getToolState(element, nearbyToolData.toolType).data.forEach(data => {
                let dataX = data.handles.end.x;
                let dataY = data.handles.end.y;
                if (precise(dataX) === precise(probeX) && precise(dataY) === precise(probeY)) {
                  cornerstoneTools.removeToolState(element, nearbyToolData.toolType, data);
                  cornerstone.updateImage(element);
                }
            });

            dismiss();
        }

    };
});

Template.dialogAi.onRendered(() => {
    const instance = Template.instance();

    // Allow options ovewrite
    const modalOptions = _.extend({
        backdrop: 'static',
        keyboard: false
    }, instance.data.modalOptions);

    const $modal = instance.$('.modal');

    // Create the bootstrap modal
    $modal.modal(modalOptions);

    // Check if dialog will be repositioned
    let position = instance.data.position;
    const event = instance.data.event;
    if (!position && event && event.clientX) {
        position = {
            x: event.clientX+155,
            y: event.clientY+130
        };
    }

    // Reposition dialog if position object was filled
    if (position) {
        OHIF.ui.repositionDialog($modal, position.x, position.y);
    }
});

Template.dialogAi.events({
    'click .js-predict'(event, instance) {
        const zone = event.currentTarget.outerText;

        askAi(buildDataForPrediction(zone));
    },

    keydown(event) {
        const instance = Template.instance(),
              keyCode = event.keyCode || event.which;

        let handled = false;

        if (keyCode === 27) {
            instance.$('.btn.btn-cancel').click();
            handled = true;
        } else if (keyCode === 13) {
            instance.$('.btn.btn-confirm').click();
            handled = true;
        }

        if (handled) {
            event.stopPropagation();
        }
    }
});

Template.dialogAi.helpers({
    isError() {
        const data = Template.instance().data;
        return data instanceof Error || (data && data.error instanceof Error);
    },

    showZone() {
        const flag = Session.get('modelWithZone');
        if (!flag) {
            askAi(buildDataForPrediction(''));
        }
        return flag;
    }
});
