(function(angular) {
	"use strict";

	myCtrl.$inject = ["$scope", "$rootScope", "$timeout", "SiteTitle"];
	function myCtrl($scope, $rootScope, $timeout, SiteTitle) {

		$scope.message = SiteTitle;

		$rootScope.$watch(function() {
			console.log("rootScope is being digested...");
		});

		$scope.$watch(function() {
			console.log("child scope is being digested...");
		});

		setTimeout(function() {

			//$scope.$apply(function() {
				console.log("timeout expired...");
				$scope.message = "Bye Everyone!";
				console.log($scope.message);
			//});

			$scope.$digest();

		}, 2000);

	}

	angular.module("MyApp.Controllers")
		.controller("MyCtrl", myCtrl);

})(angular);
