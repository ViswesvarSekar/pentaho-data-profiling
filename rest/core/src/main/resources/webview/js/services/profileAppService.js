define(["require", './services'], function (require, appServices) {
  appServices.factory('ProfileAppService', [
    '$routeParams',
    function ($routeParams) {
      function ProfileAppService() {
        this.profileId;
        this.dataSourceUrl;
        this.dataSourceReference;
        this.currentOperationMessage;
        this.operationError;
        this.tabularService;
        this.profileService;
        this.dataSourceService;
        this.notificationService;
      }

      ProfileAppService.prototype = {
        constructor: ProfileAppService,
        init: function (aTabularService, aProfileService, aDataSourceService, aNotificationService, scope) {
          //Because of the way we are using services as singleton instances of objects that are injectable, yet leverage the
          //dual binding that angular provides, we need to initialize the TabularService and set it on the ProfileAppService
          aTabularService.init(JSON.stringify(["name"]), false);
          profileAppService.tabularService = aTabularService;
          profileAppService.profileService = aProfileService;
          profileAppService.dataSourceService = aDataSourceService;
          profileAppService.notificationService = aNotificationService;
          profileAppService.scope = scope;
          // Register to receive profile status updates.
          profileAppService.notificationService.register(
              /* notifType */
              "com.pentaho.profiling.model.ProfilingServiceImpl",
              /* ids */
              [$routeParams.profileId],
              /* cb */
              function (profileStatus) {
                profileAppService.updateProfile(profileStatus);
              });
        },
        /**
         * Updates the profile information with the given profile status object.
         *
         * This function is called each time a profile status update
         * is received by the profile notification service.
         *
         * It handles:
         * <ul>
         *   <li>obtaining available operations,</li>
         *   <li>determining the rows and columns structures corresponding to the fields in the profile,</li>
         *   <li>any errors reported by the profiling service.</li>
         * </ul>
         *
         * @param {ProfileStatus} profileStatus The profile status.
         */
        updateProfile: function (profileStatus) {
          if (profileStatus && profileStatus.profileState != 'DISCARDED') {
            profileAppService.profileId = profileStatus.id;

            // Update datasource.
            profileAppService.updateDataSource(profileStatus.dataSourceReference);

            var cols = Pentaho.utilities.toArray(profileStatus.profileFieldProperties),
                colCount = cols && cols.length,
                itemSchema = profileAppService.tabularService.buildItemSchema(cols),
                items = Pentaho.utilities.toArray(profileStatus.fields);

            profileAppService.tabularService.fieldCols = profileAppService.tabularService.getCols(itemSchema, items, colCount);
            profileAppService.tabularService.fieldRows = profileAppService.tabularService.getRows(itemSchema, items);

            profileAppService.currentOperationMessage = profileStatus.currentOperationMessage;

            profileAppService.operationError = profileStatus.operationError;
          } else {
            profileAppService.dataSourceService.getCreate({
              id: profileAppService.dataSourceReference.id,
              dataSourceProvider: profileAppService.dataSourceReference.dataSourceProvider
            }, function (createWrapper) {
              window.location.href = createWrapper.profileDataSourceInclude.url;
            });
          }
        },
        /**
         * Shows the "info" view of the given data source reference.
         *
         * When the given data source reference is different from the current data source reference,
         * the data source <i>getInclude</i> service is called to obtain
         * the new data source's requireJS module and view url.
         *
         * @param {DataSourceReference} dataSourceReference The data source reference.
         */
        updateDataSource: function (dataSourceReference) {
          var oldDsr = profileAppService.dataSourceReference,
              newDsId = dataSourceReference.id,
              newDsProv = dataSourceReference.dataSourceProvider;

          if (!oldDsr || oldDsr.id != newDsId) {
            profileAppService.dataSourceReference = dataSourceReference;

            if (!oldDsr || oldDsr.dataSourceProvider != newDsProv) {
              profileAppService.dataSourceService.getInclude({id: newDsId, dataSourceProvider: newDsProv}, function (dsIncludeWrapper) {

                var dsInclude = dsIncludeWrapper.profileDataSourceInclude;
                if (dsInclude.require) {
                  require([dsInclude.require], function () {
                    profileAppService.dataSourceUrl = dsInclude.url;
                    profileAppService.scope.$apply();
                  });
                } else {
                  profileAppService.dataSourceUrl = dsInclude.url;
                }
              });
            }
          }
        },
        /**
         * Orders to stop the current operation on the scope object's profile.
         *
         * This method is published in the scope object and can thus be called by the view.
         */
        stopCurrentOperation: function () {
          profileAppService.profileService.stop({profileId: profileAppService.profileId});
        }
      };
      var profileAppService = new ProfileAppService();
      return profileAppService;
    }])
});