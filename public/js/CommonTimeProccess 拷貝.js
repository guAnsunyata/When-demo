var CommonTimeProccess = function (_RGB)
{
	var RGB = _RGB;  //顏色的漸層RGB String由外部傳入(_RGB)
	var twoAppear = false;  //是否有權重等於二的人出現的布林值
	var userList = [];  //儲存所有經由function user被呼叫的user **是以要建立user一定要呼叫function user
	var doc = [];  //存放時間單元的陣列
	var section = [];  //存放權重為二的時間單元的陣列
	var answerList = [];  //在proccess之後的答案時間單元陣列 

	//呼叫回傳一個user的function
	//user.getEvent()回傳所有user轉換後時間的陣列(time型態)
	//user.setWeight()在外部控制權種時才改變，預設權重為1
	function user (_id, _name, _event)
	{
		function fillEvent (_event)
		{
			var event = [];
			_event.forEach(
				function (__event)
				{
					var newEvent = [];
					newEvent.push(new time(__event.start));
					newEvent.push(new time(__event.end));
					event.push(newEvent);
				}
			);
			return event;
		}

		var user = 
		{
			id : _id,
			name : _name,
			event : fillEvent(_event),
			weight : 1,
			getId : function getId()
			{
				return this.id;
			},
			getName : function getName()
			{
				return this.name;
			},
			getEvent : function getEvent()
			{
				return this.event;
			},
			getWeight : function getWeight()
			{
				return this.weight;
			},
			setWeight : function setWeight(_weight)
			{
				if (_weight === 2) twoAppear = true;
				this.weight = _weight;
			}
		}

		userList.push(user);
		return user;
	}

	this.procEvent = function procEvent(_event)
	{
		//console.log('CTP receive:',_event);
		var event = [];
		_event.forEach(
			function (__event)
			{
				var newEvent = [];
				newEvent.push(new time(__event.start));
				newEvent.push(new time(__event.end));
				event.push(newEvent);
			}
		);

		var shibaluma = [];
		event.forEach(
			function (_gunLinLaoSu)
			{
				var start = _gunLinLaoSu[0];
				var end = _gunLinLaoSu[1];
				while (!start.equal(end))
				{
					if (shibaluma.indexOf(start.toString()) === -1) shibaluma.push(start.toString());
					start = minutePlus(start);
				}
				if (shibaluma.indexOf(start.toString()) === -1) shibaluma.push(start.toString());
			}
		);
		shibaluma.sort();
		var newEvent = [];
		var temp = [];
		temp.push(new time(shibaluma[shibaluma.length-1]));
		for (iii = shibaluma.length-1 ; iii >= 1 ; iii--)
		{
			if (shibaluma[iii] == minutePlus(new time(shibaluma[iii-1])).toString())
			{
				if (iii == 1)
				{
					temp.push(new time(shibaluma[0]));
					newEvent.push(temp.reverse());
				}
			}
			else
			{
				temp.push(new time(shibaluma[iii]));
				newEvent.push(temp.reverse());
				temp = [];
				temp.push(new time(shibaluma[iii-1]));
			}
		}

		return newEvent;
	}

	//時間單元cell類別
	function cell(_time)
	{
		var cell = 
		{
			time : _time,
			users : [],
			score : 0,
			addUser : function addUser(_user)
			{
				this.users.push(_user);
			},
			getTime : function getTime(_time)
			{
				return this.time;
			}
		}

		return cell;
	}

	//time類別
	function time(_timeString)
	{
		var time = 
		{
			year : parseInt(_timeString.substr(0,4)),
			month : parseInt(_timeString.substr(5,2)),
			day : parseInt(_timeString.substr(8,2)),
			hour : parseInt(_timeString.substr(11,2)),
			minute : parseInt(parseInt(_timeString.substr(14,2)) / 10),
			//判斷這個時間單元和其他時間單元是否相同
			equal : function equal(_time)
			{
				if (this.year != _time.year) return false;
				if (this.month != _time.month) return false;
				if (this.day != _time.day) return false;
				if (this.hour != _time.hour) return false;
				if (this.minute != _time.minute) return false;
				return true;
			},
			//將此類別轉換為string型態 e.g '2015-11-11 11:00:00'
			toString : function toString()
			{
				return numFormat(this.year) + "-" + numFormat(this.month) + "-" + numFormat(this.day) + " " + numFormat(this.hour) + ":" + numFormat(this.minute * 10) + ":00";
			}
		}
		
		return time;
	}

	//輸出格式
	function event (_start) {
		var event = {
			start: _start,
			end: "abc",
			color: "a",
			eventUsers: [],
			setEnd: function setEnd(_end){
				this.end = _end;
			},
			setColor: function setColor(_color){
				this.color = _color;
			},
			setUsers: function setUsers(_eventUsers){
				var tempUsers = [];
				_eventUsers.forEach(
					function (_user)
					{
						tempUsers.push(_user.getName());
					}
				);
				this.eventUsers = tempUsers.slice(0);
			}
		}

		return event;
	}

	//時間從minute開始加一，並從此確認是否時間都在範圍之內
	function minutePlus(_time)
	{
		var newTime = new time(_time.toString().substr(0,14) + numFormat((_time.minute+1)*10) + ":00");
		return timeCheck(newTime);
	}

	//個位數補0
	function numFormat(_num)
	{
		if (_num < 10)
			return "0" + _num.toString();
		else
			return _num.toString();
	}

	//確認時間是否在正常值範圍內用
	function timeCheck(_time)
	{
		//若minute是6(意即超過60分鐘)...
		if (_time.minute === 6)
		{
			//使minute歸0，hour++
			_time.minute = 0;
			_time.hour++;
			//若hour是24(意即應該換日)...
			if (_time.hour === 24)
			{
				//使小時歸0，day++
				_time.hour = 0;
				_time.day++;
				//確認月份...
				switch(_time.month)
				{
					//若是二月則有閏年和28天問題
					case 2:
						if (isLeapYear(_time.year))
						{
							if (_time.day === 30)
							{
								_time.day = 1;
								_time.month++;
							}
						}
						else
						{
							if (_time.day === 29)
							{
								_time.day = 1;
								_time.month++;
							}
						}
						break;
					//大月
					case 1:
					case 3:
					case 5:
					case 7:
					case 8:
					case 10:
					case 12:
						if (_time.day === 32)
						{
							_time.day = 1;
							_time.month++;
						}
						break;
					//小月
					default:
						if (_time.day === 31)
						{
							_time.day = 1;
							_time.month++;
						}
				}

				//若月份是13(意即新年)
				if (_time.month === 13)
				{
					_time.month = 1;
					_time.year++;
				}
			}
		}

		return _time;
	}

	//判斷是否為閏年
	function isLeapYear(_year) 
	{
		return ((_year % 4 == 0 && _year % 100 != 0) || (_year % 100 ==0 && _year % 400 == 0));
	}

	//public function置入users並開始計算共同時間
	//input users ; output commonTime
	this.inputUser = function inputUser(_users)
	{
		//重新計算，將變數重置
		doc = [];
		twoAppear = false;
		userList = [];
		answerList = [];

		//建立users
		_users.forEach(
			function (_user) 
			{
				new user(_user.user_id, _user.userName, _user.event);
			}
		);

		//若user人數大於二開始計算
		proccessTheTime();

		return answerList;
	}

	//public function置入user的id及權重更改權重參數
	this.weightChange = function weightChange(_id, _weight)
	{
		//重新計算，將變數重置
		doc = [];
		twoAppear = false;
		answerList = [];

		//尋找此id並改變其權重
		userList.forEach(
			function (_user)
			{
				if (_user.getId() == _id) 
				{
					_user.setWeight(_weight);
					return false;
				}
			}
		);

		//若user人數大於二開始計算
		proccessTheTime();

		return answerList;
	}

	//開始計算共同時間
	function proccessTheTime()
	{
		//處理所有的users，將其中的時間放入doc和section
		userList.forEach(
			function (_user)
			{
				if (_user.getWeight() !== 0)
				{
					_user.getEvent().forEach(
						function (_event)
						{
							fillDoc(_event[0], _event[1], _user);
						}
					);
				}
			}
		);
		//開始找出所有時間
		//若沒有權重為二的使用者將section assign doc的clone
		if (! twoAppear) 
		{
			section = doc.slice(0);
		}
		//若有權重為二的使用者將section中cell的users賦予doc中時間相同的cell的users
		else
		{
			section.forEach(
				function (_cell)
				{
					doc.forEach(
						function (__cell)
						{
							if (_cell.getTime().equal(__cell.getTime()))
							{
								_cell.users = __cell.users.slice(0);
								return false;
							}
						}
					);
				}
			);
		}

		while (section.length != 0)
		{
			//找出這次迴圈section時間內最大的人數
			var maxCount = 0;
			section.forEach(
				function (_cell)
				{
					doc.forEach(
						function (__cell)
						{
							if (__cell.getTime().equal(_cell.getTime()))
							{
								if (__cell.users.length > maxCount) maxCount = __cell.users.length;
								return false;
							}
						}
					);
				}
			);

			//找出這次迴圈所有最長的時間
			var maxCellArray = [];
			for (i = section.length-1; i >=0 ; i--)
			{
				if (section[i].users.length == maxCount)
				{
					maxCellArray.push(section[i]);
					section.splice(i,1);
				}
			}

			answerList.push(maxCellArray);
		}
		continuousCheck();
	}

	//將連續的時間轉換為start及end
	function continuousCheck()
	{
		var newAnswerList = [];
		answerList.forEach(
			function (_answer)
			{
				var colorString = RGB[parseInt((_answer[0].users.length / userList.length * RGB.length) - 1)];
				var newEvent = new event(outputCheck(_answer[_answer.length-1].getTime()));
				var count = 1;
				newEvent.setColor(colorString);
				newEvent.setUsers(_answer[_answer.length-1].users);
				for (i = _answer.length-1; i >=1 ; i--)
				{
					if (minutePlus(_answer[i].getTime()).equal(_answer[i-1].getTime()))
					{
						count++;
						if (i == 1)
						{
							newEvent.setEnd(outputCheck(_answer[0].getTime()));
							if (count >= 2) newAnswerList.push(newEvent);
						}
					}
					else
					{
						newEvent.setEnd(outputCheck(_answer[i].getTime()));
						if (count >= 2) newAnswerList.push(newEvent);
						newEvent = new event(outputCheck(_answer[i-1].getTime()));
						newEvent.setColor(colorString);
						newEvent.setUsers(_answer[i-1].users);
						count = 1;
					}
				}
			}
		);

		answerList = newAnswerList.slice(0);
	}

	function outputCheck(_time)
	{
		if (_time.minute === 5 || _time.minute === 2) return minutePlus(_time).toString();
		if (_time.minute === 4 || _time.minute === 1) _time = new time(_time.toString().substr(0,14) + numFormat((_time.minute-1)*10) + ":00");
		return _time.toString();
	}

	//將doc陣列填入event和該event共有的users
	function fillDoc(_start, _end, _user)
	{
		while(! _start.equal(_end))
		{
			pushIntoDoc(_start, _user);
			_start = minutePlus(_start);
		}
		pushIntoDoc(_start, _user);
	}

	//將時間放入doc中
	function pushIntoDoc(_time, _user)
	{
		var newCell = new cell(_time);
		var find = false;
		newCell.addUser(_user);

		//ALL ZONE
		//找doc裡面是否已經有這個時間了
		doc.forEach(
			function (_cell)
			{
				if (_cell.getTime().equal(newCell.getTime()))
				{
					//有的話就把該時間的cell的user加入這個user
					_cell.addUser(_user);
					find = true;
					return false;
				}
			}
		);

		if (! find) 
		{
			doc.push(newCell);
			find = false;
		}
		
		//VIP ZONE
		//找section裡面是否已經有這個時間了
		if (_user.getWeight() === 2)
		{
			find = false;

			section.forEach(
				function (_cell)
				{
					if (_cell.getTime().equal(newCell.getTime()))
					{
						//有的話就把該時間的cell的user加入這個user
						_cell.addUser(_user);
						find = true;
						return false;
					}
				}
			);

			if (! find) section.push(newCell);
		}
	}
}