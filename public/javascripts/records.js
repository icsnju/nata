/* eslint-disable */
$(function () {
  getSetupActions();


  function getSetupActions() {
    var apk_id = $('#apk').val();
    console.log(apk_id);
    if(!apk_id){
      return ;
    }
    $.ajax({
      url: '/api/v1/apks/'+apk_id + '/testcases',
      type: 'GET',
      success: function (testcases) {
        console.log(testcases);
        var toAppend = '<option value="">无</option>';
        for(var i = 0 ; i < testcases.length ;i++){
          toAppend += '<option value="' + testcases[i]._id +'" >' + testcases[i].name +'</option>';
        }
        $('#setup').empty().append(toAppend);
      },
      error: function (message) {
        alert('获取失败')
      }
    });
  }

  $('#btn-create').on('click', function (e) {
    e.preventDefault();
    var record = $('#record-form').serialize();

    $.ajax({
      url: "/api/v1/records",
      data: record,
      type: 'POST',
      success: function (record) {
        location.reload();
      },
      error: function (request) {
        alert("创建任务失败");
      }
    });
  });

  $('#apk').on('change', function(e){
    getSetupActions()
    return false;
  })

  $('.btn-start').on('click', function (e) {
    e.preventDefault();
    var record_id = $(this).data('id');
    $.ajax({
      url: '/api/v1/records/' + record_id + '/start',
      type: 'PUT',
      success: function (message) {
        window.location.href = "/records/" + record_id + "/run";
      },
      error: function (message) {
        alert("开始运行失败");
        return false;
      }
    });
  });

  $('.btn-remove').on('click', function (e) {
    e.preventDefault();
    var record_id = $(this).data('id');
    $.ajax({
      url: '/api/v1/records/' + record_id,
      type: 'DELETE',
      success: function (message) {
        location.reload();
      },
      error: function (message) {
        alert("删除失败");
      }
    });

  });

  $('.btn-cancel').on('click', function (e) {
    e.preventDefault();
    var record_id = $(this).data('id');
    $.ajax({
      url: '/api/v1/records/' + record_id + "/cancel",
      type: 'PUT',
      success: function (message) {
        location.reload();
      },
      error: function (message) {
        alert("设置任务状态失败");
      }
    });
  });
});
