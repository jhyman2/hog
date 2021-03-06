/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';
angular.module('hog')
  .controller('HeaderCtrl', function ($scope, $log, $mdSidenav, $state) {

    /**
     * Description
     * @method close
     */
    $scope.close = function (){
        $mdSidenav('left').close();
    }
    var vm = this;

    $scope.$on('stateChangeSuccess',
        function()
        {
            $mdSidenav('left').close();
            console.log('closing side menu');
        });
    angular.extend(vm, {
        name: 'Hog',
        menu: [
          {
              name: 'Complex',
              state: 'home.complex',
              substates: [
                {
                  name: 'List',
                  state: 'home.complex.list',
                  tooltip: 'List Section will allow you the ability to run Pig command '
                },
                {
                  name: 'New',
                  state: 'home.complex.new',
                  tooltip: 'Complex Section Information goes here'
                }
              ]
          },
          {
            name: 'Simple',
            state: 'home.simple',
            substates: [
              {
                name: 'List',
                state: 'home.simple.list',
                tooltip: 'List Section will allow you the ability to run Pig command '
              },
              {
                name: 'New',
                state: 'home.simple.new',
                tooltip: 'Simple Section Information goes here'
              }
            ]
          },

        ],
        /**
         * Description
         * @method toggleNav
         */
        toggleNav: function()
        {
            $mdSidenav('left').toggle();
        },
        originatorEv: null,
        /**
         * Description
         * @method openMenu
         * @param {} $mdOpenMenu
         * @param {} ev
         */
        openMenu: function($mdOpenMenu, ev)
        {
          vm.originatorEv = ev;
          $mdOpenMenu(ev);
        },
        /**
         * Description
         * @method goState
         * @param {} state
         */
        goState: function(state)
        {
          $state.go(state);
        },
        /**
         * Description
         * @method clicked
         * @param {} nav
         * @param {} $mdOpenMenu
         * @param {} ev
         */
        clicked: function(nav, $mdOpenMenu, ev)
        {
          if(nav.substates)
          {
            vm.openMenu($mdOpenMenu, ev);
          }
          else
          {
            vm.goState(nav.state);
          }
        }
    });

  });
