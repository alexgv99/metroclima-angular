'use strict';

angular.module('myApp', ['ngRoute', 'leaflet-directive'])

.directive('procempaPopup', ['$http', '$compile', function($http, $compile) {
    return {
        restrict: 'E',
        scope: {
            estacao: "="
        },
        templateUrl: 'procempaPopup.html'
    };
}])

.controller('MainCtrl', ['$scope', '$log', 'ServicoEstacoes', 
    function($scope, $log, ServicoEstacoes) {
        var promiseEstacoes = ServicoEstacoes.getEstacoes();
        promiseEstacoes.then(function(estacoes) {
            $scope.estacoes             = estacoes.estacoes;
            $scope.estacaoSelecionada   = estacoes.estacaoSelecionada;
        });
    }
])

.controller('PredictionCtrl', ['$http', '$scope', '$log', 'ServicoEstacoes', 'ServicoPrevisoes', '$rootScope',
    function($http, $scope, $log, ServicoEstacoes, ServicoPrevisoes) {
        var promiseEstacoes = ServicoEstacoes.getEstacoes();
        $scope.markers = [];
        promiseEstacoes.then(function(estacoes) {
            $rootScope.estacoes = estacoes.estacoes;
            var i = 0;
            angular.forEach($scope.estacoes, function(estacao) {
                $log.error(i + ": " + estacao.estacao);
                $scope.markers.push({
                    lat: estacao.latitude, 
                    lng: estacao.longitude, 
                    message: "<procempa-popup estacao='estacoes[" + i + "]'></procempa-popup>"
                });
                i++;
            });
        });
        var promisePrevisoes = ServicoPrevisoes.getPrevisoes();
        promisePrevisoes.then(function(previsoes) {
            $scope.previsoes = previsoes.previsoes;
        });
        angular.extend($scope, {
            poaCenter: {
                lat: -30.035,
                lng: -51.17,
                zoom: 12
            }
        });
    }
])

.factory('ServicoEstacoes', ['$http', '$log', '$q', function($http, $log, $q) {
    return {
        getEstacoes: function() {
            var d = $q.defer();
            var url = 'https://metroclimaestacoes.procempa.com.br/metroclima/seam/resource/rest/externalRest/ultimaLeitura';
            var saida = { estacoes: [], estacaoSelecionada: null }
            $http.get(url)
            .success(function(estacoes){
                angular.forEach(estacoes, function(estacao) {
					if (saida.estacaoSelecionada == null) {
						saida.estacaoSelecionada = estacao.estacao;
					}
					saida.estacoes.push(estacao);
                });
                d.resolve(saida);
            })
            .error(function(msg, code) {
                d.reject(msg);
            });
            return d.promise;
        }
    }
}])

.factory('ServicoPrevisoes', function($http, $log, $q) {
    return {
        getPrevisoes: function() {
            var d = $q.defer();
            var url = 'https://metroclimaestacoes.procempa.com.br/metroclima/seam/resource/rest/externalRest/previsaoFutura';
            var saida = { previsoes: null };
            $http.get(url)
            .success(function(data) { 
                saida.previsoes = data;
                d.resolve(saida);
            })
            .error(function(msg, code) {
                d.reject(msg);
                $log.error(msg, code);
            });
            return d.promise;
        }
    }
})

.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/view1', {
			templateUrl: 'view1.html',
			controller: 'MainCtrl'
		})
		.when('/view2', {
			templateUrl: 'view2.html',
			controller: 'MainCtrl'
		})
		.when('/view3', {
			templateUrl: 'view3.html',
			controller: 'MainCtrl'
		})
		.when('/view4', {
			templateUrl: 'view4.html',
			controller: 'PredictionCtrl'
		})
		.when('/view5', {
			templateUrl: 'view5.html',
			controller: 'PredictionCtrl'
		})
		.otherwise({
			redirectTo: '/view1'
		});
}]);