/*
 * @license MIT
 * @file
 * @copyright KeyW Corporation 2016
 */


angular.module('hog.hog-templates', [])
  .factory('HogTemplates', function()
      {
        /**
         * Controller Templates
         * @method GraphInfoController
         * @param {} $mdDialog
         * @param {} $scope
         * @param {} $timeout
         * @param {} graph_data
         * @param {} script
         */
        function GraphInfoController($mdDialog, $scope, $timeout, graph_data, script)
        {
          $scope.script_name = script.name;
          $scope.graph_data = graph_data;
          $scope.graph_layout = [];
          $scope.indexs = [];

          $scope.show_graph = false;
          $scope.selectedIndex = 1;

          $scope.x_location = -1;
          $scope.x_axis = -1;
          $scope.y_location = -1;
          $scope.y_axis = 0;

          $scope.sliderNum;
          $scope.graph_type;
          $scope.total_data = {};

          $scope.graph_structure = {};
          $scope.output_selection = $scope.graph_data[0].length;
          $scope.refreshed_data = true;

          $scope.graph = {
            Bar: false,
            Line: false,
            Radar: false
          };

          /**
           * Description
           * @method reloadData
           * @param {} cb
           */
          function reloadData (cb)
          {

            $scope.graph_structure = {};

            $scope.graph_data.map(function (item)
                {
                  if ($scope.graph_structure[item.length])
                  {
                    $scope.graph_structure[item.length].push(item);
                  }
                  else
                  {
                    $scope.graph_structure[item.length] = [item];
                  }
                });

            /*
             * Set number of outputs to saved setting
             * if it is greater than 0 and less than
             * the number of outputs, else set to
             * number of outputs
             */
            $scope.slider_max = $scope.graph_structure[$scope.output_selection].length;
            $scope.sliderNum = (Number($scope.slider_max) >= Number(script.graph_count) && Number(script.graph_count) > 0) ? script.graph_count : $scope.slider_max;
            $scope.graph_type = script.graph_type || "Bar";

            $scope.graph[$scope.graph_type] = true;


            if ($scope.refreshed_data)
            {
              $scope.graph_layout = [];
              $scope.indexs = [];

              $scope.graph_structure[$scope.output_selection][0].forEach(function (item, i)
                  {
                    $scope.graph_layout.push(i);
                    $scope.indexs.push({value: i, disabled: false});

                    if (i + 1 >= $scope.graph_structure[$scope.output_selection][0].length)
                    {
                      if (cb)
                      {
                        cb();
                      }
                    }
                  });

              $scope.refreshed_data = false;
            }


          };

          var myNewChart;
          var ctx;

          /**
           * Description
           * @method setX
           * @param {} x_axis
           */
          $scope.setX = function (x_axis)
          {
            if (x_axis === -1)
            {
              $scope.graph_layout[$scope.x_axis] = $scope.x_axis;
              $scope.x_axis = x_axis;
              $scope.x_location = x_axis;
            }
            else
            {
              $scope.graph_layout[$scope.x_axis] = $scope.x_axis;
              $scope.x_axis = x_axis;
              $scope.indexs.map(function (item, i)
                  {
                    if (Number(item.value) === Number($scope.x_axis))
                    {
                      $scope.graph_layout[i] = "X";
                      $scope.x_location = i;

                      if ($scope.y_location >= 0)
                      {
                        $scope.show_graph = true;
                      }
                    }
                  });

              if (x_axis === $scope.y_axis)
              {
                $scope.y_axis = -1;
                $scope.y_location = -1;
                $scope.show_graph = false;
              }
            }
          };

          /**
           * Description
           * @method graphToString
           */
          $scope.graphToString = function ()
          {
            return $scope.graph_layout.toString();
          };

          /**
           * Description
           * @method setY
           * @param {} y_axis
           */
          $scope.setY = function (y_axis)
          {
            $scope.graph_layout[$scope.y_axis] = $scope.y_axis;
            $scope.y_axis = y_axis;
            $scope.indexs.map(function (item, i)
                {
                  if (Number(item.value) === Number($scope.y_axis))
                  {
                    $scope.graph_layout[i] = "Y";
                    $scope.y_location = i;

                    if ($scope.y_location >= 0)
                    {
                      $scope.show_graph = true;
                    }
                  }
                });

            if (y_axis === $scope.x_axis)
            {
              $scope.x_axis = -1;
              $scope.x_location = -1;
            }
          };


          /**
           * Description
           * @method showGraph
           * @param {} graph_type
           */
          $scope.showGraph = function(graph_type)
          {
            if ($scope.y_location != -1)
            {
              if (graph_type)
              {
                $scope.graph_type = graph_type;
              }

              if (myNewChart) {
                myNewChart.destroy();
              }

              var x_data = [];
              var y_data = [];

              $scope.graph_structure[$scope.output_selection].forEach(function (item, i)
                  {
                    if ($scope.x_location >= 0)
                    {
                      x_data.push(item[$scope.x_location]);
                    } else {
                      x_data.push(i);
                    }

                    y_data.push(item[$scope.y_location]);

                  });


              $scope.total_data = {
                labels: x_data.slice(0, $scope.sliderNum),
                datasets: [{
                  labels: x_data.slice(0, $scope.sliderNum),

                  // Blue
                  fillColor: "rgba(33,150,243,0.3)",
                  strokeColor: "rgba(33,150,243,1)",
                  pointColor: "rgba(33,150,243,1)",
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(33,150,243,1)",

                  data: y_data.slice(0, $scope.sliderNum)
                }]
              };

              var container = document.getElementById("myChart");
              if (container)
              {
                ctx = container.getContext("2d");
                myNewChart = new Chart(ctx)[$scope.graph_type]($scope.total_data);
                myNewChart.resize();
              }
            }

          };

          // wait for data before calling graph
          $timeout(function ()
              {
                $scope.showGraph();
              }, 200);

          $scope.$watch("sliderNum", function ()
              {
                $scope.showGraph();
              });

          $scope.$watch("graph_data", function ()
              {
                reloadData();
              }, true);

          $scope.$watch("output_selection", function ()
              {
                $scope.refreshed_data = true;
                reloadData(function ()
                    {
                      $scope.setY($scope.indexs[0].value);
                      $scope.showGraph();
                    });
              });


          /**
           * Description
           * @method cancel
           */
          $scope.cancel = function()
          {
            $mdDialog.cancel();
          };

          reloadData(function ()
              {
                $scope.setY($scope.indexs[0].value);
              });
        };



        // Controller for Info Modal
        /**
         * Description
         * @method InfoController
         * @param {} $mdDialog
         * @param {} $scope
         * @param {} script_name
         * @param {} info_outputs
         * @param {} outputs
         * @param {} logs
         * @param {} warnings
         * @param {} errors
         * @param {} filter_type
         * @param {} graph_data
         * @param {} openGraphInfo
         * @param {} script_id
         */
        function InfoController(
          $mdDialog,
          $scope,
          script_name,
          info_outputs,
          outputs,
          logs,
          warnings,
          errors,
          filter_type,
          graph_data,
          openGraphInfo,
          script_id)
        {
          $scope.script_name = script_name;
          $scope.info_outputs = info_outputs;
          $scope.outputs = outputs;
          $scope.logs = logs;
          $scope.warnings = warnings;
          $scope.errors = errors;
          $scope.filter_type = filter_type || "all";

          $scope.graph_data = graph_data;
          $scope.openGraphInfo = openGraphInfo;
          $scope.script_id = script_id;

          /**
           * Description
           * @method filteredInfo
           */
          $scope.filteredInfo = function ()
          {
            return $scope.info_outputs.filter(function (info)
                {
                  if ($scope.filter_type === "all")
                  {
                    return true;
                  } else
                  {
                    return info.type === $scope.filter_type;
                  }
                });
          };

          /**
           * Description
           * @method filterByAll
           */
          $scope.filterByAll = function ()
          {
            $scope.filter_type = "all";
          };

          /**
           * Description
           * @method filterByOutput
           */
          $scope.filterByOutput = function ()
          {
            $scope.filter_type = "output";
          };

          /**
           * Description
           * @method filterByLog
           */
          $scope.filterByLog = function ()
          {
            $scope.filter_type = "log";
          };

          /**
           * Description
           * @method filterByWarning
           */
          $scope.filterByWarning = function ()
          {
            $scope.filter_type = "warning";
          };

          /**
           * Description
           * @method filterByError
           */
          $scope.filterByError = function ()
          {
            $scope.filter_type = "error";
          };

          /**
           * Description
           * @method cancel
           */
          $scope.cancel = function()
          {
            $mdDialog.cancel();
          };
        };



        /**
         * Description
         * @method VersionDiffController
         * @param {} $mdDialog
         * @param {} $window
         * @param {} $scope
         * @param {} $timeout
         * @param {} $q
         * @param {} lodash
         * @param {} vm
         */
        function VersionDiffController($mdDialog, $window, $scope, $timeout, $q, lodash, vm)
        {
          var _ = lodash;
          var dmp = new $window.diff_match_patch();
          vm.loading = true;
          vm.leftVers = vm.versions[vm.leftIdx];
          vm.rightVers = vm.versions[vm.rightIdx];

          /**
           * Description
           * @method processDiff
           * @param {} lIdx
           * @param {} rIdx
           */
          vm.processDiff = function(lIdx, rIdx)
          {
            var p = $q.defer();

            if(lIdx >= vm.versions.length || lIdx < 0 || rIdx >= vm.versions.length || rIdx < 0)
            {
              p.reject('Index out of bounds');
            }
            else
            {
              var leftDiff = vm.versions[lIdx].diff;
              var rightDiff = vm.versions[rIdx].diff;
              var lp = dmp.patch_make(leftDiff);
              var lt = _.transform(leftDiff, function(result, e) {
                if(e[0] == 0)
                {
                  result.push(e[1]);
                  return true;
                }
              }, []);
              lt = lt.join('');
              var ls = dmp.patch_apply(lp, lt);
              var rt = _.transform(rightDiff, function(result, e) {
                if(e[0] == 0)
                {
                  result.push(e[1]);
                  return true;
                }
              }, []);
              console.log('right transform: ', rt);
              rt = rt.join('');
              var rp = dmp.patch_make(rightDiff);
              var rs = dmp.patch_apply(rp, rt);
              console.log('process left side: ', ls, lt, '\nright side:', rs, rt);
              p.resolve({ls: ls[0], rs: rs[0]});
            }
            return p.promise;
          }


          vm.processDiff(vm.leftIdx, vm.rightIdx)
            .then(
              function(data)
              {
                $timeout(function()
                    {
                      $scope.vm.ls = data.ls;
                      $scope.vm.rs = data.rs;
                      $scope.vm.loading = false;
                      console.log('left side: ', $scope.vm.ls, 'right side:', $scope.vm.rs);
                    })

              },
              function(err)
              {
                console.error(err);
              }
            );


          /**
           * Description
           * @method setLIdx
           * @param {} vers
           */
          vm.setLIdx = function(vers)
          {
            vm.leftIdx = _.findIndex(vm.versions, ['version', vers.version])
          }


          /**
           * Description
           * @method setRIdx
           * @param {} vers
           */
          vm.setRIdx = function(vers)
          {
            vm.rightIdx = _.findIndex(vm.versions, ['version', vers.version])
          }


          /**
           * Description
           * @method diff
           */
          vm.diff = function()
          {
            $scope.vm.loading = true;
            vm.processDiff(vm.leftIdx, vm.rightIdx)
              .then(
                function(data)
                {
                  $timeout(function()
                      {
                        $scope.vm.ls = data.ls;
                        $scope.vm.rs = data.rs;
                        $scope.vm.loading = false;
                        console.log('left side: ', $scope.vm.ls, 'right side:', $scope.vm.rs);
                      })
                },
                function(err)
                {
                  console.error(err);
                });
          }


          $scope.vm = vm;
          /**
           * Description
           * @method revert
           * @param {} vIdx
           * @param {} source
           */
          $scope.revert = function(vIdx, source)
          {
            $mdDialog.hide({revertIdx: vIdx, source: source});
          }


          /**
           * Description
           * @method cancel
           */
          $scope.cancel = function()
          {
            $mdDialog.cancel();
          };
        };



        // Controller for Info Modal
        /**
         * Description
         * @method DeleteDialogController
         * @param {} $mdDialog
         * @param {} $scope
         * @param {} Runner
         * @param {} script_id
         * @param {} cb
         */
        function DeleteDialogController(
          $mdDialog,
          $scope,
          Runner,
          script_id,
          cb)
        {
          $scope.script_id = script_id;

          /**
           * Description
           * @method deleteScript
           */
          $scope.deleteScript = function ()
          {
            Runner.destroy($scope.script_id)
              .then(
                function(data)
                {
                  Runner.list()
                    .then(
                      function(data)
                      {
                        console.log("Deleted script");
                        cb();
                        $mdDialog.cancel();
                      });
                });
          };
          /**
           * Description
           * @method cancel
           */
          $scope.cancel = function()
          {
            $mdDialog.cancel();
          };
        };



        /**
         * Description
         * @method SettingsController
         * @param {} $mdDialog
         * @param {} $scope
         * @param {} vm
         */
        function SettingsController( $mdDialog, $scope, vm)
        {
          $scope.vm = vm;
          /**
           * Description
           * @method cancel
           */
          $scope.cancel = function()
          {
            $mdDialog.cancel();
          };


          $scope.graph = {
            Bar: false,
            Line: false,
            Radar: false
          };

          $scope.graph_type = $scope.vm.script.graph_type || "Bar";
          $scope.graph[$scope.graph_type] = true;

          $scope.graph_output_count = $scope.vm.script.graph_count;

          /**
           * Description
           * @method save
           */
          $scope.save = function()
          {
            if ($scope.graph.Bar)
            {
              $scope.graph_type = "Bar";
            }
            else if ($scope.graph.Line)
            {
              $scope.graph_type = "Line";
            }
            else if ($scope.graph.Radar)
            {
              $scope.graph_type = "Radar";
            }
            else
            {
              $scope.graph_type = "Bar";
            }

            $scope.vm.save($scope.graph_type, $scope.graph_output_count);
            $scope.cancel();
          }
        };



        /**
         * Description
         * @method parseOutput
         * @param {} data
         * @param {} myList
         */
        function parseOutput (data, myList)
        {
          var failed = false;
          try
          {
            var tmp_data = data
              .replace(/\(/g, "[")
              .replace(/\)/g, "]")
              .replace(/(?:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|([\w\.]+))/g, '"$1$2"');

            var output_data = JSON.parse(tmp_data);
          }
          catch (err)
          {
            failed = true;
          }
          finally
          {
            if (!failed)
            {
              myList.push(output_data);
            }
          }
        };


        return {
          // Controllers
          GraphInfoController: GraphInfoController,
          InfoController: InfoController,
          VersionDiffController: VersionDiffController,
          DeleteDialogController: DeleteDialogController,
          SettingsController: SettingsController,

          // functions
          parseOutput: parseOutput,

          // Views
          outputInfoTemplate: "services/templates/html/outputInfoTemplate.html",
          graphInfoTemplate: "services/templates/html/graphInfoTemplate.html",
          complexEditSettingsTemplate: "services/templates/html/complexEditSettingsTemplate.html",
          versionDiffTemplate: 'views/complex/edit/edit.complex.diff.html',
          deleteDialogTemplate: "services/templates/html/deleteDialogTemplate.html"
        };
      });
