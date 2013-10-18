import Picker = require('utils/picker');
import Promise = require('promise');
import PromiseUtil = require('utils/promise');

export = GoogleDriveStorage;

declare var google: any;

module GoogleDriveStorage {
  var clientId = '125417905454-r4b5nl32a5q34db5t7bc0hkugbd2j4ep.apps.googleusercontent.com';
  var scope = 'https://www.googleapis.com/auth/drive';
  var developerKey = 'AIzaSyCnf2EefO8vRhA1Mu5iRJrX4bNO9zUD-EE';
  // var appId = '125417905454';

  function authorizeGoogleDrive(gapi: any, immediate: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.auth.authorize({
        client_id: clientId, scope: [scope], immediate: immediate
      }, (authResult: GoogleApiOAuth2TokenObject) => {
        if (authResult && !authResult.error) {
          resolve(null);
        } else {
          console.log(authResult);
          reject('ERROR: google drive authorize');
        }
      });
    });
  }

  export function createPicker(): Picker.FilePicker {
    return {
      pick: () => {
        var gapi: any = null;
        return PromiseUtil.require('gapi').then((_gapi: typeof gapi) => {
          return PromiseUtil.require('gclient');
        }).then(PromiseUtil.wait(1)).then((_gapi: any) => {
          gapi = _gapi;
          return authorizeGoogleDrive(gapi, true)
        }).catch((reason: any) => {
          return authorizeGoogleDrive(gapi, false)
        }).then(() => {
          return new Promise((resolve, reject) => {
            gapi.client.load('drive', 'v2', () => {
              resolve(null);
            });
          });
        }).then(() => {
          return new Promise((resolve, reject) => {
            (<any>gapi).load('picker', {callback: resolve});
          });
        }).then(() => {
          return new Promise((resolve, reject) => {
            var picker = new google.picker.PickerBuilder()
              .enableFeature(google.picker.Feature.NAV_HIDDEN)
              .setOAuthToken(gapi.auth.getToken().access_token)
              .setDeveloperKey(developerKey)

              .addView(google.picker.ViewId.FOLDERS)
              .addView(google.picker.ViewId.PDFS)
              .setCallback((data: any) => {
                if (data.action !== google.picker.Action.PICKED) { return; }
                resolve(data);
              })
              .build();
            picker.setVisible(true);
          });
        }).then((response: any) => {
          return new Promise((resolve, reject) => {
            var file = response.docs[0];
            var file_id = file.id;
            var request = (<any>gapi.client).drive.files.get({
              fileId: file_id
            });
            request.execute((resp: any) => {
              var downloadUrl = resp.downloadUrl;
              var httpHeaders = {
                'Authorization': 'Bearer ' + gapi.auth.getToken().access_token
              };
              console.log(downloadUrl);
              resolve({
                url: downloadUrl,
                httpHeaders: httpHeaders,
                mimeType: file.mimeType
              })
            });
          });
        });
      }
    }
  }
}
