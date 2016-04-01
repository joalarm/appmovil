// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state('home',{
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'homeController'
    })

    .state('search',{
      url: '/search',
      templateUrl: 'templates/search.html',
      controller: 'searchController'
    })

    .state('detail',{
      url: '/detail/:id',
      templateUrl: 'templates/detail.html',
      controller: 'detailController'
    })

    .state('checkins',{
      url: '/checkins',
      templateUrl: 'templates/checkins.html',
      controller: 'checkinController'
    })

    .state('login',{
      url: '/login/:return',
      templateUrl: 'templates/login.html',
      controller: 'loginController'
    })

    .state('register',{
      url: '/register/:return',
      templateUrl: 'templates/register.html',
      controller: 'registerController'
    })

    .state('rate',{
      url: '/rate/:id',
      templateUrl: 'templates/rate.html',
      controller: 'rateController'
    });

  $urlRouterProvider
    .otherwise('/');
})

.controller('homeController', function($scope, $location){
  $scope.searchRumba = function() {
    $location.path('/search');
  }
})

.controller('searchController', function($scope, $ionicHistory, $ionicModal, $http, $ionicLoading){
  $scope.selservicios = [];

  //funcion para el boton volver
  $scope.volver = function() {
    $ionicHistory.goBack();
  }

  //funciones para el modal
  $ionicModal.fromTemplateUrl('modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  })

  $scope.openModal = function() {
    $scope.modal.show()
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
    console.log($scope.selservicios);
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  //listar los servicios del modal
  $http.get('http://localhost/basic/web/index.php?r=producto-servicio/list-servicio')
  .then(function (response){
    $scope.servicios = response.data;
  })
  //manejo array servicios seleccionados
  $scope.toggleSelection = function toggleSelection(servicio) {
  var idx = $scope.selservicios.indexOf(servicio.id);
  if (idx > -1) {// is currently selected
    $scope.selservicios.splice(idx, 1);
  }
  else { // is newly selected
    $scope.selservicios.push(servicio.id);
  }
  };

  //listar los establecimientos
  $http.get('http://appmovil.joalar.com/web/index.php?r=establecimiento/list-establecimiento')
  .then(function (response){
    $scope.establecimientos = response.data;
    $scope.total = $scope.establecimientos.length;
  })
})

.controller('detailController', function($scope, $ionicHistory, $ionicLoading, $cordovaGeolocation, $ionicModal){
  $scope.volver = function() {
    $ionicHistory.goBack();
  }
  var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

  }, function(error){
    console.log("Could not get location");
  });

  //funciones para el modal
  $ionicModal.fromTemplateUrl('modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal
  })

  $scope.openModal = function() {
    $scope.modal.show();
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
})

.controller('checkinController', function($scope, $ionicHistory, $http, $ionicLoading){
  //funcion para el boton volver
  $scope.volver = function() {
    $ionicHistory.goBack();
  }
})

.controller('loginController', function($scope, $ionicHistory, $http, $ionicLoading){
  //funcion para el boton volver
  $scope.volver = function() {
    $ionicHistory.goBack();
  }
})

.controller('registerController', function($scope, $ionicHistory, $http, $ionicLoading){
  //funcion para el boton volver
  $scope.volver = function() {
    $ionicHistory.goBack();
  }
})

.controller('rateController', function($scope, $ionicHistory, $http, $ionicLoading){
  //funcion para el boton volver
  $scope.volver = function() {
    $ionicHistory.goBack();
  }
})
