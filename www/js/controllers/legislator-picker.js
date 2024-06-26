/**
 *
 */

var filter = require('lodash.filter');
var isEmpty = require('lodash.isempty');
var isNumber = require('lodash.isnumber');
var map = require('lodash.map');

/**
 * @typedef AugmentedLegislator
 * @property {string} bioguideId
 * @property {"Sen" | "Rep"} title
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} state
 * @property {number | null} district
 * @property {boolean} defunct
 * @property {string} [contact_url]
 * @property {boolean} comingSoon
 */

/**
 * @typedef LegislatorPickerScope
 * @property {boolean} loadingDelay
 * @property {() => void} goBack
 * @property {AugmentedLegislator[]} legislators The Legislator objects the user can pick from.
 * @property {Object<string, boolean>} bioguideIdsBySelection Map from bioguideId to whether the user has selected that rep to message.
 * @property {() => boolean} anyRepSelected Whether any rep has been selected to message.
 * @property {(canonicalAddress: any) => void} fetchLegislators
 * @property {() => void} setLocalData
 * @property {() => void} submit
 */

/**
 * 
 * @param {LegislatorPickerScope} $scope 
 * @param {ng.ILocationService} $location 
 * @param {*} $timeout 
 * @param {*} dioData 
 * @param {*} dioAPI 
 */
var LegislatorPickerController = /*@ngInject*/ function($scope, $location, $timeout, dioData, dioAPI) {

  // TODO(leah): Wire this on to the rootscope?
  $scope.loadingDelay = true;

  $timeout(function() {
    $scope.loadingDelay = false;
  }, 350);

  $scope.goBack = function(){
    $location.path('/');
  };

  /**
   * The Legislator objects the user can pick from.
   */
  $scope.legislators = [];

  /**
   * Map from bioguideId to whether the user has selected that rep to message.
   */
  $scope.bioguideIdsBySelection = {};

  /**
   * Whether any rep has been selected to message.
   */
  $scope.anyRepSelected = function() {
    return isEmpty(filter($scope.bioguideIdsBySelection, function(selected) {
      return selected;
    }));
  };

  $scope.fetchLegislators = function(canonicalAddress) {

    var cb = function(err, legislators) {
      var legislatorsFound = !isEmpty(legislators);
      var serverErr = !isEmpty(err);

      if (legislatorsFound && !serverErr) {
        dioData.setLegislators(legislators);
        $scope.setLocalData();
      } else {
        if (serverErr) {
          // TODO(sina): Show a server error, try again later
	  console.log("SERVER ERR!");
	  console.log(serverErr);
        } else {
          console.log("OTHER ERR! - legislatorsFound?");
          console.log(legislatorsFound);
          // TODO(sina): Decide what to do here. Maybe clear dio-data and kick the user back?
        }
      }
    };

    dioAPI.findLegislatorsByDistrict(
      canonicalAddress.components.stateAbbreviation, canonicalAddress.district, cb);
  };

	$scope.submit = function() {
    dioData.setBioguideIdsBySelection($scope.bioguideIdsBySelection);
    $location.path('/compose');
	};

  /**
   * Stitches data from dio data to the local $scope.
   */
  $scope.setLocalData = function() {
    $scope.legislators = dioData.getLegislators();
    $scope.bioguideIdsBySelection = dioData.getBioguideIdsBySelection();
  };

  if (!dioData.hasCanonicalAddress()){
    $scope.goBack();
  }

  if (!dioData.hasLegislators()) {
    $scope.fetchLegislators(dioData.getCanonicalAddress());
	} else {
    $scope.setLocalData();
  }

};

module.exports = LegislatorPickerController;
