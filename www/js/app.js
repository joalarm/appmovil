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

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider){
  $ionicConfigProvider.tabs.position('bottom');

  $stateProvider
    .state('app',{
      url: '/app',
      abstract: true,
      templateUrl: 'templates/menu.html',
      controller: 'appController'
    })

    .state('app.home',{
      url: '/',
      views: {
        'menuContent': {
            templateUrl: 'templates/home.html',
              controller: 'homeController'
            }
        }
    })

    .state('app.search',{
      url: '/search',
      views: {
        'menuContent': {
            templateUrl: 'templates/search.html',
            controller: 'searchController'
          }
        }
    })

    .state('app.detail',{
      url: '/detail/:id',
      views: {
        'menuContent': {
            templateUrl: 'templates/detail.html',
            controller: 'detailController'
          }
        }
    })

    .state('app.checkins',{
      url: '/checkins',
      views: {
        'menuContent': {
            templateUrl: 'templates/checkins.html',
            controller: 'checkinController'
          }
        }
    })

    .state('app.login',{
      url: '/login/:return',
      views: {
        'menuContent': {
            templateUrl: 'templates/login.html',
            controller: 'loginController'
          }
        }
    })

    .state('app.register',{
      url: '/register/:return',
      views: {
        'menuContent': {
            templateUrl: 'templates/register.html',
            controller: 'registerController'
          }
        }
    })

    .state('app.rate',{
      url: '/rate/:id',
      views: {
        'menuContent': {
            templateUrl: 'templates/rate.html',
            controller: 'rateController'
          }
        }
    });

  $urlRouterProvider
    .otherwise('/app/');
})

.controller('appController', function($scope, $location){
  /*$scope.searchRumba = function() {
    $location.path('/search');
  }*/
})

.controller('homeController', function($scope, $location){
  $scope.searchRumba = function() {
    $location.path('/app/search');
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
  $ionicLoading.show({
      template: 'Cargando...'
    });
  //listar los establecimientos
  $http.get('http://appmovil.joalar.com/web/index.php?r=establecimiento/list-establecimiento')
  .then(function (response){
    $scope.establecimientos = response.data;
    $scope.total = $scope.establecimientos.length+' coincidencias';
    $ionicLoading.hide();
  })
})

.controller('detailController', function($scope, $ionicHistory, $ionicLoading,
  $cordovaGeolocation, $ionicPopup, $stateParams, $window, $location, $http, $timeout){
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

  // Confirm popup code
  $scope.showConfirm = function() {

      //$window.localStorage.clear();
     var confirmPopup = $ionicPopup.confirm({
        title: 'Deseas hacer check-in?',
        template: 'Al hacer check-in en este establecimiento podras calificar luego tu experiencia',
        cancelText: 'Cancelar',
        okText: 'Claro!',
        okType: 'button-assertive'
     });
     confirmPopup.then(function(res) {
        if (res) {
          if($window.localStorage['user_id'] == null)
              $location.path('/app/login/'+$stateParams.id);
          else
              hacerCheckin();
        }
     });
     /*$timeout(function() {
     confirmPopup.close(); //close the popup after 3 seconds for some reason
  }, 3000);*/
  };
  //funcion para hacer el checkin, primero se obtiene la georeferenciacion y luego se llama la URL del server
  var hacerCheckin = function(){
    $ionicLoading.show({
        template: 'Cargando...'
      });
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      $http.get('http://localhost/basic/web/index.php?r=checkin/create-checkin&cliente='
                  +$window.localStorage['user_id']+'&establecimiento='+$stateParams.id+'&latitud='
                  +position.coords.latitude+'&longitud='+position.coords.longitude)
      .then(function(response){
        $ionicLoading.hide();
        if(response.data != 0 && response.data != -1){
          var alertPopup = $ionicPopup.alert({
             title: 'Que bien! El check-in ha sido registrado!',
             template: '',
             okText: 'Aceptar',
             okType: 'button-assertive'
          });
          alertPopup.then(function(res) {
          });
          $timeout(function() {
          alertPopup.close(); //close the popup after 3 seconds for some reason
           }, 3000);
        } else {
          var alertPopup = $ionicPopup.alert({
             title: 'Ops! Parece que se presento un error',
             template: '',
             okText: 'Aceptar',
             okType: 'button-assertive'
          });
          alertPopup.then(function(res) {
          });
          $timeout(function() {
          alertPopup.close(); //close the popup after 3 seconds for some reason
           }, 3000);
        }
      });
    }, function(error){
      $ionicLoading.hide();
      $http.get('http://localhost/basic/web/index.php?r=checkin/create-checkin&cliente='
                  +$window.localStorage['user_id']+'&establecimiento='+$stateParams.id+'&latitud=null&longitud=null')
      .then(function(response){
        $ionicLoading.hide();
        if(response.data != 0 && response.data != -1){
          var alertPopup = $ionicPopup.alert({
             title: 'Que bien! El check-in ha sido registrado!',
             template: '',
             okText: 'Aceptar',
             okType: 'button-assertive'
          });
          alertPopup.then(function(res) {
          });
          $timeout(function() {
          alertPopup.close(); //close the popup after 3 seconds for some reason
           }, 3000);
        } else {
          var alertPopup = $ionicPopup.alert({
             title: 'Ops! Parece que se presento un error',
             template: '',
             okText: 'Aceptar',
             okType: 'button-assertive'
          });
          alertPopup.then(function(res) {
          });
          $timeout(function() {
          alertPopup.close(); //close the popup after 3 seconds for some reason
           }, 3000);
        }
      });
    });

  };
})

.controller('checkinController', function($scope, $ionicHistory, $http, $ionicLoading, $window){
  //funcion para el boton volver
  $scope.volver = function() {
    $ionicHistory.goBack();
  }
  $ionicLoading.show({
      template: 'Cargando...'
    });
  $http.get('http://localhost/basic/web/index.php?r=checkin/list-checkins&id='+$window.localStorage['user_id'])
  .then(function(response){
    $scope.checkins = response.data;
    $scope.total = $scope.checkins.length+' Check-In';
    $ionicLoading.hide();
  });
})

.controller('loginController', function($scope, $ionicHistory, $http, $ionicLoading, $ionicPopup, $stateParams, $window, $location, $timeout){

  $scope.$on('$stateChangeSuccess', function () {
    if($window.localStorage['user_id'] != null)
       $location.path('/');
  });

  $scope.email = '';
  //funcion para el boton volver
  $scope.volver = function() {
    $ionicHistory.goBack();
  }

  $scope.showAlert = function() {
     var alertPopup = $ionicPopup.alert({
        title: 'Vaya! Parece que no estas registrado',
        template: '',
        okText: 'Aceptar',
        okType: 'button-assertive'
     });
     alertPopup.then(function(res) {
     });
     $timeout(function() {
     alertPopup.close(); //close the popup after 3 seconds for some reason
      }, 3000);
  };

  $scope.iniciarSesion = function(){
    if(this.email != ''){
      $http.get('http://localhost/basic/web/index.php?r=cliente/search-cliente&email='+this.email)
      .then(function(response){
        if(response.data != -1){
          $window.localStorage['user_id'] = response.data;
          if($stateParams.return != -1)
            $location.path('/app/detail/'+$stateParams.return);
          else
            $location.path('/');
        } else {
          $scope.showAlert();
        }
      })
    }
  }

  $scope.registro = function(){
    if($stateParams.return != -1)
      $location.path('/app/register/'+$stateParams.return);
    else
      $location.path('/app/register/-1');
  }

})

.controller('registerController', function($scope, $ionicHistory, $http, $ionicLoading, $ionicPopup, $stateParams, $window, $location, $timeout, $filter){
  $scope.$on('$stateChangeSuccess', function () {
    if($window.localStorage['user_id'] != null)
       $location.path('/');
  });

  $scope.email = '';
  $scope.genero = 'Femenino';
  $scope.f_nac ={value: new Date(1901,01,01)};
  var error = '';

  //funcion para el boton volver
  $scope.volver = function() {
    $ionicHistory.goBack();
  }

  $scope.showAlert = function() {
     var alertPopup = $ionicPopup.alert({
        title: error,
        template: '',
        scope: $scope,
        okText: 'Aceptar',
        okType: 'button-assertive'
     });
     alertPopup.then(function(res) {
     });
     $timeout(function() {
     alertPopup.close(); //close the popup after 3 seconds for some reason
      }, 3000);
  };

  $scope.registrarCliente = function(){
    this.f_nac = $filter('date')(new Date(this.f_nac.value),'yyyy-MM-dd');
    console.log(this.email+this.f_nac);
    if(this.email != '' && this.f_nac != null){

      $http.get('http://localhost/basic/web/index.php?r=cliente/create-cliente&email='+this.email+'&genero='+this.genero+'&f_nac='+this.f_nac)
      .then(function(response){
        if(response.data == -1){
           error = 'Ops!! Se ha presentado un error';
           $scope.showAlert();
        } else if(response.data == 0){
          error = 'Vaya!! Parece que ya estás registrado, intenta iniciar sesión';
          $scope.showAlert();
        } else {
          $window.localStorage['user_id'] = response.data;
          if($stateParams.return != -1)
            $location.path('/app/detail/'+$stateParams.return);
          else
            $location.path('/');
        }
      })
    }
  }

  $scope.login = function(){
    if($stateParams.return != -1)
      $location.path('/app/login/'+$stateParams.return);
    else
      $location.path('/app/login/-1');
  }
})

.controller('rateController', function($scope, $ionicHistory, $http, $ionicLoading, $stateParams, $filter, $ionicPopup, $timeout, $location){
  $scope.puntaje = "2";
  //funcion para el boton volver
  $scope.volver = function() {
    $ionicHistory.goBack();
  }
  $ionicLoading.show({
      template: 'Cargando...'
    });
  $http.get('http://localhost/basic/web/index.php?r=checkin/list-checkin&id='+$stateParams.id)
    .then(function(response){
      $scope.fecha = Date.parse(response.data.Fecha);
      $scope.establecimiento = response.data.Nombre;
      $ionicLoading.hide();
    });

  $scope.registrar = function(){
    //console.log(this.puntaje + " " + this.observaciones);
    $ionicLoading.show({
          template: 'Cargando...'
        });
    $http.get('http://localhost/basic/web/index.php?r=calificacion/create-calificacion&puntaje='+this.puntaje+'&checkin='+$stateParams.id+'&observaciones='+this.observaciones)
    .then(function(response){
      if(response.data == 0 || response.data == -1){
        var alertPopup = $ionicPopup.alert({
           title: 'Ops!! Se ha presentado un error',
           template: '',
           okText: 'Aceptar',
           okType: 'button-assertive'
        });
        alertPopup.then(function(res) {
        });
        $timeout(function() {
        alertPopup.close(); //close the popup after 3 seconds for some reason
         }, 3000);
      } else {
        var alertPopup = $ionicPopup.alert({
           title: 'Tu calificación ha sido almacenada, muchas gracias!',
           template: '',
           okText: 'Aceptar',
           okType: 'button-assertive'
        });
        alertPopup.then(function(res) {
        });
        $timeout(function() {
        alertPopup.close(); //close the popup after 3 seconds for some reason
         }, 3000);
         $location.path('/app/checkins');
      }
    });
  }
})
