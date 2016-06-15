/* eslint-disable */
$(function () {
// 基于准备好的dom，初始化echarts实例
  var myActivityChart = echarts.init(document.getElementById('echarts-activity'));

  var xData = [];
  var yDataActivity = [];
// 指定图表的配置项和数据
  var optionActivity = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      top: 'bottom',
      data: ['Activity数量']
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '100%']
    },
    series: [{
      name: 'Activity数量',
      type: 'line',
      smooth: true,
      sampling: 'average',
      itemStyle: {
        normal: {
          color: 'rgb(255, 70, 131)'
        }
      },
      areaStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: 'rgb(255, 158, 68)'
          }, {
            offset: 1,
            color: 'rgb(255, 70, 131)'
          }])
        }
      },

      data: []
    }]
  };

// 使用刚指定的配置项和数据显示图表。
  myActivityChart.setOption(optionActivity);
  var record_id = record._id;

  setInterval(function () {

    $.ajax({
      url: "/api/v1/records/" + record_id + "/data",
      type: 'GET',
      success: function (result) {
        myActivityChart.setOption({
          xAxis: {
            data: result.xData
          },
          series: [{
            // 根据名字对应到相应的系列
            name: 'Activity数量',
            data: result.yDataActivity
          }]
        });


        var toAppend = ''
        result.logs.forEach(function (log) {
          toAppend += '<tr><td>' + log + '</td></tr>'
        })

        $('#log').empty().append(toAppend)

        var td = $('#log tr:nth-child(' + (result.logs.length) + ') td');
        var scrollBottom = td.parent().height() * (result.logs.length);
        $('#log-table-wrapper').scrollTop(scrollBottom);
      },
      error: function (error) {
      }
    });
  }, 2000);

  $('#cancel-task').click(function (e) {
    e.preventDefault();
    $.ajax({
      url: '/api/v1/records/' + record_id + "/cancel",
      type: 'PUT',
      success: function (message) {
        window.location.href = "/records/"
      },
      error: function (message) {
        alert("取消任务失败");
      }
    });
  });
});