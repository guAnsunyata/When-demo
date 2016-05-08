var result = [];
var counter = 0;
var global = this; //test Object in global by console
var CTP = new CommonTimeProccess([]);

$(document).ready(function() {
	$('#submit').click(function(){
		if(result.length <= 0){
			$('.error').css('display','block');
		}
    });

	$calendar = $('.calendar');
	var now = new Date();
	var month = now.getMonth()+1;
	var defaultDate = now.getFullYear()+'-'+month+'-'+now.getDate();

	$calendar.fullCalendar({
		defaultView: 'agendaWeek',
		lang: 'zh-tw',
		timezone: '',
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
			console.log(start,end);
			var title = 'available';
			var eventData;

				eventData = {
					id: counter,
					title: title,
					start: start,
					end: end
				};
				counter ++;

				function check(){
					var check = ' ';
					var new_start = eventData.start._d.getTime();
					var new_end = eventData.end._d.getTime();
					if(result.length > 0){
						result.forEach(function (e){
							var test_id = e.id
							var test_start = e.start._d.getTime();
							var test_end = e.end._d.getTime();
							if(((new_start > test_start) && (new_start < test_end)) || ((new_end > test_start) && (new_end < test_end))){
								check = false;
								return false;
								//console.log('抓到了！');
							}else{
								if(new_start == test_end){
									result[test_id].end._d = eventData.start._d;
								}else if(new_end == test_start){
										result[test_id].start._d = eventData.start._d;
								}else{
									check = true;
								}
							}
						});
					}else{
						check = true;
					}
					if(check){
						//create new
						result[eventData.id] = eventData;
						$calendar.fullCalendar('renderEvent', eventData, false); // stick? = true
					}
				}
			//check();
			result[eventData.id] = eventData;
			$calendar.fullCalendar('renderEvent', eventData, false); // stick? = true
			$calendar.fullCalendar('unselect');
		},
		eventClick: function(calEvent, jsEvent, view) {
			//console.log(calEvent, jsEvent, view);
			console.log(calEvent);
			// global.e = calEvent;
			var c = confirm('是否刪除該日期區間？');
			if(c){
				var id = calEvent.id;
				console.log('delete : ',id);
				$calendar.fullCalendar('removeEvents', id);
				result.splice(id,1);
			}
		},
		eventResizeStop: function (event, jsEvent, ui, view){
			result[event.id] = event;
		},
		editable: true,
		eventDragStop: function (event, jsEvent, ui, view){
			result[event.id] = event;
			console.log(event);
			// var id = event.id;
			// console.log(result[id].start);
			// result[id].start = event.start;
			// result[id].end = event.end;
			// console.log('pos',event.start);
		},
		eventLimit: true, // allow "more" link when too many events
	});

	$('#submit').click(function (){
		var userName = $('#username').html();
		var activity_id = $('.hashcode').html();
		createUser(activity_id ,userName, result);
		window.location.href = '/result/'+activity_id;
	});

	function createUser (activity_id, userName, result){
	console.log('createUser!!');
	  var events = [];
	  result.forEach(function (e){
	  	//start
	  	var start = e.start._d;
	  	var start_month = formatZero(start.getUTCMonth()+1);
	  	var start_time = formatZero(start.getUTCHours())+':'+formatZero(start.getUTCMinutes())+':'+formatZero(start.getUTCSeconds());
	  	var formattedStart = start.getUTCFullYear()+'-'+start_month+'-'+formatZero(start.getUTCDate())+' '+start_time;
	  	
	  	//end
	  	var end = e.end._d;
	  	var end_month = formatZero(start.getUTCMonth()+1);
	  	var end_time = formatZero(end.getUTCHours())+':'+formatZero(end.getUTCMinutes())+':'+formatZero(end.getUTCSeconds());
	  	var formattedEnd = start.getUTCFullYear()+'-'+end_month+'-'+formatZero(end.getUTCDate())+' '+end_time;
	  	//console.log(formattedStart, formattedEnd);
	  	var eventObj = {
	  		start: formattedStart,
	  		end: formattedEnd
	  	};
	  	events.push(eventObj);
	  });

	  //利用CTP API將時間連續化且撫平避免重複
	  var ctp_events = CTP.procEvent(events);
	  //再次格式化時間
	  var new_events = [];
	  ctp_events.forEach(function(e){
	  	var new_obj = {
	  		start: e[0].toString(),
	  		end: e[1].toString()
	  	}
	  	new_events.push(new_obj);
	  });

	  console.log(new_events);
	  //post
	  $.post(/createUser/,{'_id': activity_id, 'userName': userName, 'events': new_events}, function(res){
	  	console.log('createUser POST return: ',res);
	  });

	  //paser
	  function formatZero(val){
	  	if(val.toString().length <= 1){
	  		return '0'+val;
	  	}else{
	  		return val;
	  	}
	  }
	}
});
