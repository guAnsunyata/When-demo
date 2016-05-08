$(document).ready(function() {

var now = new Date();
var month = now.getMonth()+1;
var defaultDate = now.getFullYear()+'-'+month+'-'+now.getDate();

var result = [];

$('.calendar').fullCalendar({
	lang: 'zh-tw',
	contentHeight: 650,
	Height: 2000,
	allDaySlot: false,
	timeFormat: 'H:mm',
	columnFormat: 'ddd M/D',
	eventColor: '#dfbf00',
	header: {
		left: 'prev,next today',
		center: 'title',
		right: 'month,agendaWeek,agendaDay'
	},
	defaultDate: defaultDate,
	selectable: true,
	selectHelper: true,
	select: function(start, end) {
		var title = 'available';
		var eventData;
		if (title) {
			eventData = {
				title: title,
				start: start,
				end: end
			};
			$('.calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
		}
		$('.calendar').fullCalendar('unselect');
	},
	editable: true,
	eventLimit: true, // allow "more" link when too many events
	events: [
		{
			id: 1,
			title: '',
			start: '2015-11-29 8:00:00',
			end: '2015-11-29 9:00:00',
			color: '#fff3e0'
		},
		{
			id: 2,
			title: '',
			start: '2015-11-29 9:00:00',
			end: '2015-11-29 12:00:00',
			color: '#ffa726'
		},
		{
			id: 3,
			title: '',
			start: '2015-11-29 13:00:00',
			end: '2015-11-29 15:00:00',
			color: '#fff3e0'
		},
		{
			id: 4,
			title: '',
			start: '2015-11-30 8:00:00',
			end: '2015-11-30 9:00:00',
			color: '#fff3e0'
		},
		{
			id: 6,
			title: '',
			start: '2015-11-30 9:00:00',
			end: '2015-11-30 12:00:00',
			color: '#ffa726'
		},
		{
			id: 7,
			title: '',
			start: '2015-11-30 13:00:00',
			end: '2015-11-30 15:00:00',
			color: '#e65100'
		},
		{
			id: 8,
			title: '',
			start: '2015-11-30 15:00:00',
			end: '2015-11-30 17:00:00',
			color: '#ffa726'
		},
		{
			id: 11,
			title: '',
			start: '2015-12-1 8:00:00',
			end: '2015-12-1 10:30:00',
			color: '#fff3e0'
		},
		{
			id: 13,
			title: '',
			start: '2015-12-1 10:30:00',
			end: '2015-12-1 12:00:00',
			color: '#ffa726'
		},
		{
			id: 14,
			title: '',
			start: '2015-12-1 12:00:00',
			end: '2015-12-1 13:00:00',
			color: '#fff3e0'
		},
		{
			id: 15,
			title: '3 people',
			start: '2015-12-1 13:00:00',
			end: '2015-12-1 17:00:00',
			color: '#e65100'
		},
		{
			id: 17,
			title: '',
			start: '2015-12-4 13:00:00',
			end: '2015-12-4 17:00:00',
			color: '#fff3e0'
		},
		{
			id: 19,
			title: '',
			start: '2015-12-3 8:00:00',
			end: '2015-12-3 11:00:00',
			color: '#ffa726'
		},
		{
			id: 20,
			title: '',
			start: '2015-12-3 11:00:00',
			end: '2015-12-3 12:00:00',
			color: '#fff3e0'
		},
	],
});
});