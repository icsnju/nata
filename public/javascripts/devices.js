/* eslint-disable */
$(function() {

  function getOnlineDevices() {
    console.log('hello')
    $.ajax({
      url: '/api/v1/devices',
      type: 'GET',
      success: function (devices) {
        var toAppend = ""
        devices.forEach(function(device){
          toAppend += "<tr>";
          toAppend += "<td>" + device.id + "</td>";
          toAppend += "<td>" + device.type+ "</td>";
          toAppend += "<td>" + '<a href="#" class="btn-success btn btn-xs" role="button" data-id='+device.id +'>登记</a>' + "</td>";
          toAppend += "</tr>"
        })
        $('#online_devices').empty().append(toAppend)

      },
      error: function (request) {

      }
    });
  }

  getOnlineDevices();

  $('#refresh-span').click(getOnlineDevices);


  $('#online_devices').delegate('a','click', function(e) {
    e.preventDefault();
    var device_id = $(this).data('id');
    $.ajax({
      url: '/api/v1/devices/' + device_id,
      type: 'POST',
      success: function(message) {
        location.reload()
      },
      error: function(message) {
        alert("登记设备失败,请检查设备是否已存在");
      }
    });
  });

  $('#device_table').delegate('a','click', function(e) {
    e.preventDefault();
    var device_id = $(this).data('id');
    $.ajax({
      url: '/api/v1/devices/' + device_id,
      type: 'DELETE',
      success: function(message) {
        $(e.target).parent().parent().remove();
      },
      error: function(message) {
        alert("删除失败");
      }
    });
  });


});