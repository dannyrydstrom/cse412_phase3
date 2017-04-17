$(document).ready(function() {
    // page is now ready, initialize the calendar...
    // options and github  - http://fullcalendar.io/
    $('#calendar').fullCalendar({
        events: [{
            id: 123,
            title: "Test Event",
            allDay: true,
            start: "2017-04-15",
            end: "2017-04-16",
            url: "www.google.com"
        }],
        defaultDate: '2017-04-12',
        defaultView: 'month'
        // eventClick:  function(event, jsEvent, view) {
        //     //set the values and open the modal
        //     $("#eventInfo").html(event.description);
        //     $("#eventLink").attr('href', event.url);
        //     $("#eventContent").dialog({ modal: true, title: event.title });
        // }
    });

});

