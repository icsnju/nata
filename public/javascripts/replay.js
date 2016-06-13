/* eslint-disable */
$(function() {
  var actionCount = 1;
  var td = $('#actions tr:nth-child(' + (actionCount) + ') td');
  td.css('background-color', '#44ba92');

  var replayBtn = $('#btn-replay');

  replayBtn.on('click', function (e) {
    e.preventDefault();
    var action = td.text().trim()
    replayBtn.prop("disabled", true);
    $.ajax({
      url: "/api/v1/devices/" + device_id + "/action",
      data: {
        "action": action
      },
      type: 'POST',
      success: function (actions) {
        var scrollBottom = td.parent().height() * (actionCount);
        $('#action-table-wrapper').scrollTop(scrollBottom);
        actionCount++;
        td = $('#actions tr:nth-child(' + (actionCount) + ') td');
        td.css('background-color', '#44ba92');
        replayBtn.prop("disabled", false);
      },
      error: function (error) {
        replayBtn.prop("disabled", false);
      }
    });
  });

  $('#btn-replay-all').on('click', function (e) {
    e.preventDefault();
    var ele = $(this);
    ele.prop("disabled", true);
    $.ajax({
      url: "/api/v1/devices/" + device_id + "/actions",
      data: {
        actions: actions
      },
      traditional: true,
      type: 'POST',
      success: function (message) {
        ele.prop("disabled", false);
      },
      error: function (error) {
        ele.prop("disabled", false);
      }
    });
  });
});