$(document).ready(function() {

    let events = [];

    calendar.forEach(function(event){
        events.push({
            id: event.EventID,
            title: event.Title,
            start: event.FromDate,
            end: event.ToDate,
            description: event.Description
        });
    });

    $('#calendar').fullCalendar({
        events: events,
        defaultDate: '2017-03-12',
        defaultView: 'month',
        header: {
            left: 'title today',
            center: 'prevYear prev next nextYear',
            right: 'month basicWeek basicDay listMonth'
        },
        eventRender: function (event, element) {
            element.attr('href', 'javascript:void(0);');
            element.click(function () {
                $("#startTime").html(moment(event.start).format('MMM Do h:mm A'));
                $("#endTime").html(moment(event.end).format('MMM Do h:mm A'));
                $("#eventInfo").html(event.description);
                $("#eventLink").attr('href', event.url);
                $("#eventContent").dialog({modal: true, title: event.title, width: 350});
            })
        }
    });

});

