(function () {
  'use strict';

  angular.module('imageApprovalApp')
    .factory('ApproveService', ApproveService);

  ApproveService.$inject = ['$http'];

  function ApproveService($http) {
    var service = {
      getImages:          getImages,
      getArchivedImages:  getArchivedImages,
      sendImageToArchive: sendImageToArchive
    };

    return service;

    ////////////////

    function getImages() {
      return $http.get('./../server/data/images.json');
    }

    function getArchivedImages() {
      return $http.get('./../server/data/archived-images.json');
    }

    function sendImageToArchive(removableImg, updatedImages) {
      //$http.post('/images/remove', {
      //  id:     removableImg,
      //  update: updatedImages
      //});
      console.log('removableImg: ', removableImg);
      console.log('updatedImages: ', updatedImages);
    }
  }
})();