
function appendCalendar(result){
	$modal = $('#detail');
	$modal_total = $('#modal-total');
	$modal_user_list = $('#modal-user-list');
	$modal_time = $('#modal-time');

	var now = new Date();
	var month = now.getMonth()+1;
	var defaultDate = now.getFullYear()+'-'+month+'-'+now.getDate();
	console.log('refreshCalendar : ',now);

	$('.calendar').fullCalendar({
		defaultView: 'agendaWeek',
		lang: 'zh-tw',
		contentHeight: 650,
		Height: 2000,
		allDaySlot: false,
		timeFormat: 'H:mm',
		columnFormat: 'ddd M/D',
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
		defaultDate: defaultDate,
		editable: false,
		eventLimit: true, // allow "more" link when too many events
		eventClick: function(calEvent, jsEvent, view){
			//get userList of the event.
			//result.forEach(function(event){ event.eventUsers })
			console.log(calEvent);
			$modal_user_list.html('');
			var html_user_list = '';
			calEvent.eventUsers.forEach(function(user){
				html_user_list = html_user_list+user+'、 ';
			});
			var l = html_user_list.length;
			$modal_total.html(calEvent.eventUsers.length+'人');
			$modal_user_list.append(html_user_list.substr(0,l-2)); //刪除最後一個頓號
			$modal_time.html('時間：'+calEvent.start._i+' - '+calEvent.end._i);
			$modal.openModal();
			global.opacity_set(0.2);
		},
		events: result
	});
}

function refreshCalendar (result){
	console.log('refreshCalendar');
	$('.calendar').fullCalendar('removeEvents');
	$('.calendar').fullCalendar( 'addEventSource', result );
}
