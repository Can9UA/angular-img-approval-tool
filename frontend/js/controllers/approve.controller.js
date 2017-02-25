(function () {
  'use strict';

  angular.module('imageApprovalApp')
    .controller('ApproveCtrl', ApproveCtrl);

  ApproveCtrl.$inject = ['ApproveService'];

  /* @ngInject */
  function ApproveCtrl(ApproveService) {
    var vm = this;

    var lazyLoad = {
      first:    0,
      pageSize: 9,
      images:   [],
    };

    // variables
    vm.activeTab = 'images';
    vm.images = [];
    vm.archivedImages = [];

    // methods
    vm.setActiveTab = setActiveTab;
    vm.deleteImage = deleteImage;
    vm.loadArchivedImages = loadArchivedImages;
    vm.getNewItems = getNewItems;

    // filters
    vm.greaterThan = greaterThan;
    vm.equal = equal;

    function equal(prop, val) {
      return function (item) {
        if (val !== +val) return true;

        return item[prop] === val;
      }
    }

    function greaterThan(prop, val) {
      return function (item) {
        if (val !== +val) return true;

        return item[prop] >= val;
      }
    }

    function setActiveTab(tab) {
      vm.activeTab = tab;

      switch (tab) {
        case 'images':
          loadImages();
          break;
        case 'archived-images':
          loadArchivedImages();
          break;
        default:
          break;
      }
    }

    function deleteImage(index) {
      var updatedImages = addPointsToEarlierImages(index);
      var removableImg = vm.images.splice(index, 1)[0];

      getNewItems(1);
      ApproveService.sendImageToArchive(removableImg['_id'], updatedImages);
    }

    function loadImages() {
      lazyLoad.first = 0;

      ApproveService.getImages().then(function (response) {
        lazyLoad.images = response.data;
        vm.images = lazyLoad.images.slice(lazyLoad.first, lazyLoad.pageSize);
        lazyLoad.first = lazyLoad.pageSize;
      });
    }

    function loadArchivedImages() {
      ApproveService.getArchivedImages().then(function (response) {
        vm.archivedImages = response.data;
      });
    }

    function addPointsToEarlierImages(index) {
      if (!vm.images.length) return [];

      var updatedImages = [];

      for (var i = 0; i < index; i++) {
        vm.images[i].points++;
        updatedImages.push(vm.images[i]['_id']);
      }

      return updatedImages;
    }

    function getNewItems(quantity) {
      if (lazyLoad.first === 0) {
        loadImages();
        return;
      }

      var newArray;
      var fromItem = lazyLoad.first;
      var items = quantity ? fromItem + quantity : fromItem + lazyLoad.pageSize;

      newArray = lazyLoad.images.slice(fromItem, items);

      lazyLoad.first = items;

      vm.images = vm.images.concat(newArray);
    }

  }
})();