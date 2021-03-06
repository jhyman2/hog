/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


'use strict';

angular.module('hog')

.controller('EditSimpleCtrl', function ($log, $scope, $state, $stateParams, HogTemplates, Runner, Pig, $mdToast, $mdDialog, FileSaver, Blob)
    {
      var vm = this;

      vm.output_data = {};
      vm.script = {};
      vm.data = {};
      vm.running = false;
      vm.data_ready = false;

      vm.edited = false;
      vm.name_edited = false;
      vm.args_edited = false;
      vm.script_edited = false;

      vm.modes = ['Pig_Latin'];
      vm.themes = ['monokai', 'twilight', 'none'];
      vm.mode = vm.modes[0];
      vm.theme = vm.themes[0];
      vm.selectedArgs = [];
      vm.editorModel = '';
      vm.progress = 0;

      /**
       * Description
       * @method onEditorLoad
       * @param {} _ace
       */
      vm.onEditorLoad = function(_ace)
      {
        /**
         * Description
         * @method modeChanged
         */
        vm.modeChanged = function () {
          console.log('changing mode to: ' + vm.mode.toLowerCase());
          _ace.getSession().setMode("ace/mode/" + vm.mode.toLowerCase());
        }
        _ace.$blockScrolling = Infinity;
      };



      /**
       * Description
       * @method onEditorChange
       * @param {} _ace
       */
      vm.onEditorChange = function(_ace)
      {

      };



      vm.editorOptions = {
        mode: vm.mode.toLowerCase(),
        /**
         * Description
         * @method onLoad
         * @param {} _ace
         */
        onLoad: function(_ace) {vm.onEditorLoad(_ace);},
        useWrapMode: false,
        showGutter: false,
        theme: vm.theme,
        firstLineNumber: 1,
        onChange: vm.onEditorChange(),
        readOnly: true
      };



      /**
       * Description
       * @method downloadScript
       */
      vm.downloadScript = function()
      {
        var data = new Blob([vm.script.data], {type: 'text/plain;charset=utf-8'});
        FileSaver.saveAs(data, vm.script.name + ".pig");
      };



      Runner.get($stateParams.id)
        .then(
            function(data)
            {
              angular.copy(data.json, vm.data);
              vm.script = data.json;


              vm.args = vm.script.args.join(" ");
              $scope.script_args = vm.args;
              $scope.script_name = vm.script.name;

              vm.edited = false;
              vm.name_edited = false;
              vm.args_edited = false;
              vm.script_edited = false;


              vm.data_ready = true;
            });



      $scope.$watch('vm.output_data.nodes', function(newValue, oldValue)
          {
            if (newValue !== vm.script.data)
            {
              vm.script_edited = true;
            }
            else
            {
              vm.script_edited = false;
            }

            vm.script.data = vm.output_data.script;
            vm.script.nodes = vm.output_data.nodes;
            vm.script.links = vm.output_data.links;
            vm.script.type = "simple";

            updateEdit();
          }, true);



      $scope.$watch('vm.output_data.script', function(newValue, oldValue)
          {
            if (newValue !== vm.script.data)
            {
              vm.script_edited = true;
            }
            else
            {
              vm.script_edited = false;
            }

            vm.script.data = vm.output_data.script;
            vm.script.nodes = vm.output_data.nodes;
            vm.script.links = vm.output_data.links;
            vm.script.type = "simple";

            updateEdit();
          });



      $scope.$watch("script_name", function(newValue, oldValue)
      {
        if (vm.script)
        {
          if (vm.script.name !== "undefined")
          {
            if (newValue !== vm.script.name)
            {
              vm.name_edited = true;
            }
            else
            {
              vm.name_edited = false;
            }
            updateEdit();
          }
        }
      });



      $scope.$watch("script_args", function(newValue, oldValue)
      {
        if (vm.args !== "undefined")
        {
          if (newValue !== vm.args)
          {
            vm.args_edited = true;
          }
          else
          {
            vm.args_edited = false;
          }
          updateEdit();
        }
      });



      /**
       * Description
       * @method updateEdit
       */
      function updateEdit ()
      {
        vm.edited = vm.script_edited || vm.name_edited || vm.args_edited;
      };



      /**
       * Description
       * @method editComplex
       */
      vm.editComplex = function ()
      {
        $state.go('home.complex.edit', {id: vm.script._id});
      };



      /**
       * Description
       * @method deleteScript
       * @param {} ev
       */
      vm.deleteScript = function(ev)
      {
        $mdDialog.show({
          controller: HogTemplates.DeleteDialogController,
          templateUrl: HogTemplates.deleteDialogTemplate,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            script_id: vm.script._id,
            /**
             * Description
             * @method cb
             * @param {} data
             */
            cb: function (data)
            {
              $state.go('^.list');
            }
          },
        });
      };



      /**
       * Description
       * @method save
       * @param {} cb
       */
      vm.save = function (cb)
      {
        vm.script.args = $scope.script_args.split(" ");
        vm.script.name = $scope.script_name.replace(/[\s,\.]/g, "_");

        Runner.save(vm.script)
          .then(
              function(data)
              {
                $log.debug('saved: ' + data);
                vm.script = data.json;

                vm.args = vm.script.args.join(" ");
                $scope.script_args = vm.args;
                $scope.script_name = vm.script.name;

                $mdToast.show(
                    $mdToast.simple()
                    .content('Script Saved!')
                    .hideDelay(3000)
                    );
                if (cb)
                {
                  cb();
                }
                vm.edited = false;
                vm.name_edited = false;
                vm.args_edited = false;
                vm.script_edited = false;
              },
              function(err)
              {
                $log.error('error: ' +err);
              });
      };



      Pig.on('run:finished', function ()
          {
            vm.running = false;
          });



      /**
       * Description
       * @method saveAndRun
       */
      vm.saveAndRun = function ()
      {
        vm.save(function ()
            {
              vm.run();
            });
      };



      /**
       * Description
       * @method kill
       */
      vm.kill = function()
      {
        Runner.kill(vm.script._id)
          .then(
              function(data)
              {
                console.log("Killed: " + JSON.stringify(data, null, 2));
              });
      };



      /**
       * Description
       * @method run
       */
      vm.run = function()
      {
        vm.running = true;
        $log.debug('running: ', vm.script._id);

        vm.info_outputs = [];
        vm.outputs = [];
        vm.pigList = [];
        vm.logs = [];
        vm.warnings = [];
        vm.errors = [];

        Runner.run(vm.script._id)
          .then(
              function(end)
              {
                console.log("END");
              },
              function(error)
              {
                console.log("ERROR: " + JSON.stringify(error));
              },
              function(update)
              {
                if (update.type == 'progress')
                {
                  vm.progress = update.data.json;
                }
                else if (update.type == 'log')
                {
                  if (update.data.json !== "null")
                  {
                    vm.logs.push(update.data.json);
                    vm.info_outputs.push({data: update.data.json, type: "log", color: {'color': 'blue.400'}});
                  }
                }
                else if (update.type == 'warning')
                {
                  if (update.data.json !== "null")
                  {
                    vm.warnings.push(update.data.json);
                    vm.info_outputs.push({data: update.data.json, type: "warning", color: {'color': 'orange.400'}});
                  }
                }
                else if (update.type == 'output')
                {
                  if (update.data.json !== "null")
                  {
                    vm.outputs.push(update.data.json);
                    HogTemplates.parseOutput(update.data.json, vm.pigList);

                    vm.info_outputs.push({data: update.data.json, type: "output", color: {'color': 'green.400'}});
                  }
                }
                else if (update.type == 'error')
                {
                  vm.errors.push(update.data.json);
                  vm.info_outputs.push({data: update.data.json, type: "error", color: {'color': 'red.400'}});
                }
              });
      };



      /**
       * Description
       * @method ots
       * @param {} d
       */
      vm.ots = function (d)
      {
        return JSON.stringify(d);
      };



      angular.extend(this, {
        name: 'EditSimpleCtrl',
        running: false
      });



      /**
       * Description
       * @method openGraphInfo
       * @param {} ev
       * @param {} graph_data
       * @param {} script
       */
      vm.openGraphInfo = function(ev, graph_data, script)
      {
        $mdDialog.show({
          templateUrl: HogTemplates.graphInfoTemplate,
          controller: HogTemplates.GraphInfoController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          bindToController: true,
          locals: {
            graph_data: graph_data || vm.pigList,
            script: script || vm.script
          },
        });
      };



      /**
       * Description
       * @method openInfo
       * @param {} ev
       * @param {} filter_type
       */
      vm.openInfo = function(ev, filter_type)
      {
        $mdDialog.show({
          templateUrl: HogTemplates.outputInfoTemplate,
          controller: HogTemplates.InfoController,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          targetEvent: ev,
          locals: {
            script_name: vm.script.name,
            info_outputs: vm.info_outputs,
            outputs: vm.outputs,
            logs: vm.logs,
            warnings: vm.warnings,
            errors: vm.errors,
            filter_type: filter_type,
            graph_data: vm.pigList,
            openGraphInfo: vm.openGraphInfo,
            script_id: null
          },
        });
      };

    });
