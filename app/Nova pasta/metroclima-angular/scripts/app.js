'use strict';

angular.module('myApp', ['ngRoute', 'leaflet-directive'])

.controller('MainCtrl', ["$http", "$scope", "$log", function($http, $scope, $log) {
	acessaEstacoes($http, $scope, $log);
}])

.controller('PredictionCtrl', ["$http", "$scope", "$log", function($http, $scope, $log) {
	acessaEstacoes($http, $scope, $log);
	acessaPrevisoes($http, $scope, $log);
	angular.extend($scope, {
		poaCenter: {
			lat: -30.035,
			lng: -51.17,
			zoom: 12
		}
	});
}])

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
}])

function acessaEstacoes($http, $scope, $log) {
	var url = 'https://metroclimaestacoes.procempa.com.br/metroclima/seam/resource/rest/externalRest/ultimaLeitura';
	//var url = 'http://localhost:8080/metroclima/seam/resource/rest/externalRest/leituraAtual';

	$scope.estacoes = [];
	$scope.estacaoSelecionada = null;
	
	$http.get(url)
        .success(function(data){
			var estacoes = data;
			angular.forEach(estacoes, function(value, key) {
				var estacao = value;
				if ($scope.estacaoSelecionada == null) {
					$scope.estacaoSelecionada = estacao.estacao;
				}
				$scope.estacoes.push(estacao);
			});
			preparaMapa($scope, $log);
        })
		.error(function(data, error){ 
			$log.error( "NADA FEITO!!! (" + url + ") " + error); 
		});
};

function acessaPrevisoes($http, $scope, $log) {
	var urlPrevisoes = 'https://metroclimaestacoes.procempa.com.br/metroclima/seam/resource/rest/externalRest/previsaoFutura';

	$scope.previsoes = [];
	
	$http.get(urlPrevisoes)
        .success(function(data){
			$scope.previsoes = data;
        })
		.error(function(data, error){ 
			$log.error( "NADA FEITO!!! (" + url + ") " + error); 
		});
}

function preparaMapa($scope, $log) {
	$scope.markers = [];
	//$scope.poaCenter = { lat: -30.035, lng: -51.17, zoom: 12 };
	angular.forEach($scope.estacoes, function(value) {
		var estacao = value;
		$scope.markers.push(
			{ lat: estacao.latitude, 
			  lng: estacao.longitude, 
			   message: "<p>" + estacao.estacao + "</p>"
			 + "<p><img class='mapa_icone_tempo' src='images/ico_" + estacao.iconePrevisao + ".png' title='" + estacao.iconePrevisao + "'></p>"
			 + "<p class='min_max2'>" + estacao.temperaturaExterna + " ºC</p>"
			 + "<p>Umidade: " + estacao.umidadeExterna + " %</p>"
			 + "<p>Pressão: " + estacao.pressao + " hPa</p>"
			 + "<p>Vento: " + estacao.velocidadeVento + " Km/h&nbsp;&nbsp;&nbsp;<img src='images/vento_" + estacao.quadranteVento + ".png' title='" + estacao.quadranteVento + "'></p>"
			}
		);
	});
}