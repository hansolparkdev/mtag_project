var canvasx = 800;
var canvasy = 500;
var areax = 10;
var areay = 10;

//100 - 정상, 101 - 미착용, 102 - 미측정, 103 - 스트레스 및 흥분(응급)
var isEmergency_NoUse             = "<span style='color:red'>미착용</span>"
var isEmergency_NoMeasured        = "<span style='color:red'>미측정</span>"
var isEmergency_Stress_Excitement = "<span style='color:red'>응급</span>"
var noEmergency                   = "<span>정상</span>"

var regex_message = /[\S\s]{8,20}/g
var regex_blank = /^\s+|\s+$/g

var from_layer = 1;
var to_layer = 1;

var current_click_beacon = '';
var beacon_matching_tag_alive = false;

var RealtimeTable = null;

function vaild_blank(text) {
    if(text.replace(regex_blank, '') == "") {
        return false;
    }
    return true;
}

function vaild_Message(message) {
    var message_verification = message.match(regex_message);
    console.log(message_verification)
    if(message_verification == null) {
        //8글자 미만 문자열이어서 null 반환함
        alert("최소 8글자까지 입력해주세요.")
        return false;
    } else if(message_verification != message) {
        //8글자 이상이라 잘렸음
        alert("20글자 이내로 입력해주세요.")
        return false;
    }
    return true;
}

$(function(){
    // 추가
    viewMap(1);
    viewTable(1);
    viewMtag(1);
    viewCount(1);

    $(".button[value*='1F']").css("backgroundColor","white");
    $("#emergency_button").click(function(){viewEmergencyTable()});
    $("#notice").click(function(){viewNoticeDialog()})
    $.ajax({
        url :"/monitoring/req_layer",
        contentType :"application/json",
        method : "get",
        success : function(data){
            for ( var i = 0; i < data.length; i++ ) {
                var layer = i + 1;
            }
            $(".button").click("change", function(){
                $('canvas').removeLayers().drawLayers();
                var layer = this.value
                $("#hidden_layer").val(layer)
                viewMap(layer)
                viewTable(layer)
                viewMtag(layer)
                viewCount(layer)
                color(this)
                $("#location_name").html("위치를 선택해주세요.")
                $("#realtime_table > tbody").empty();
            })
        }
    })
})

function realtimeMonitoring() {
	if(beacon_matching_tag_alive) {
		//True 일 시 실행
		$.ajax({
			url : "/monitoring/getMtagInfo?beacon_id=" + current_click_beacon,
			method : "GET",
			contentType : "application/json",
			success : function(data){
				var TableList = data
				for (var i = 0; i < TableList.length; i++) {
					var row = TableList[i]

					if(row["emergencyCode"] == 0) {
						row["EmergencyStr"] = noEmergency;
					} else if(row["emergencyCode"] == 100) {
						row["EmergencyStr"] = noEmergency;
					} else if(row["emergencyCode"] == 101) {
						row["EmergencyStr"] = isEmergency_NoUse;
					} else if(row["emergencyCode"] == 102) {
						row["EmergencyStr"] = isEmergency_NoMeasured;
					} else if(row["emergencyCode"] == 103) {
						row["EmergencyStr"] = isEmergency_Stress_Excitement;
					} else {
						row["EmergencyStr"] = isEmergency_Stress_Excitement;
					}
					
					var index = findRowIndexForMTag(row["tag_id"])
					
					if(index != undefined) {
						var realTimeData = RealtimeTable.row(index).data();
						
						realTimeData["EmergencyStr"] = row["EmergencyStr"]
					
						RealtimeTable.row(index).data(realTimeData).draw(false);
					}
				}
			}
		})
	}
}

function findRowIndexForMTag(tag_id) {
	var dataSet = RealtimeTable.rows().data();
	for(var index=0;index<dataSet.legnth;index++) {
		if(dataSet[index]["tag_id"] == tag_id) {
			return index;
		}
	}
	
	return undefined;
}

function findRowIndex(beacon_id){
    var dataSet = table.rows().data();
     for(var idx = 0; idx < dataSet.length; idx++) {
        if(dataSet[idx]["beacon_id"] == beacon_id) {
            return idx;
        }
    }

    return undefined;
};

function color(obj) {
    var buttons = obj.form.change;
    for(var i=0 ; i<buttons.length ; i++) {
        buttons[i].style.backgroundColor = "";
    }
    obj.style.backgroundColor = "white";
}

function now_time(){
    var today = new Date();
    var dd = today.getDate();
    var month = today.getMonth()+1;
    var year = today.getFullYear();
    var hour = today.getHours();
    var minute = today.getMinutes();
    minute = one_place(minute);

    if (dd < 10) {
        dd = "0" + dd
    }

    if (month < 10) {
        month = "0" + month
    }

    date = year + "/" + month + "/" + dd
    time = hour + ":" + minute

    $("#date").html(date);
    $("#time").html(time);
    var refresh = setTimeout(function(){
        now_time()
    }, 1000);
}

function one_place(i){
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function viewTemp(layer){
    $.ajax({
        url : "/monitoring/getTempInfo?layer=" + layer,
        contentType : "application/json",
        method : "get",
        success : function(data) {
            var TableList = data
            table = $("#time_table").DataTable({
                "destroy" : true,
                "ordering" : false,
                "searching": false,
                "info" : false,
                "data" : TableList,
                "paging" : false,
                "columns" : [
                    {"data" : "temperature"},
                    {"data" : "humidity"}
                ],
            });
        }
    });
}

function viewCount(layer){
    $.ajax({
        url : "/monitoring/getTagCount?layer=" + layer,
        contentType : "application/json",
        method : "get",
        success : function(data) {
            var TableList = data
            table = $("#tagCount").DataTable({
                "destroy" : true,
                "ordering" : false,
                "searching" : false,
                "info" : false,
                "data" : TableList,
                "paging" : false,
                "columns" : [
                    {"data" : "Boarder"},
                    {"data" : "Passenger"},
                    {"data" : "Cargo"}
                ],
            });
        }
    });
}

function viewMap(layer){
    $('canvas').removeLayers().drawLayers();
    $.ajax({
        url : "/monitoring/req_map?layer=" + layer,
        contentType : "application/json",
        method : "get",
        success : function(data){
            var path = data[0].path
            $("#canvas").css({"background-image":"url(" + path + ")","background-size":"100% 100%"})
        }
    })
}

function viewMtag(layer){
    $.ajax({
        url :"/monitoring/getMtagPosition?layer=" + layer,
        contentType :"application/json",
        method : "get",
        success : function(data){
            $("canvas").removeLayers().drawLayers();
            for (var i = 0; i < data.length; i++) {
                var beacon_id = data[i].beacon_id;
                var loc_x = data[i].x;
                var loc_y = data[i].y;
                var count = data[i].count;
                var xValue = loc_x * (canvasx / 10);
                var yValue = canvasy - loc_y * (canvasy / 10);

                viewModal(xValue, yValue, beacon_id, count)
            }

            for (var i = 0; i < data.length; i++) {
                if(current_click_beacon == data[i].beacon_id){
                    beacon_matching_tag_alive = true;
                    break;
                }
                beacon_matching_tag_alive = false;
            }

            if(data.length==0) {
                beacon_matching_tag_alive = false;
            }
        }
    })

    if(!beacon_matching_tag_alive) {
        $("#location_name").html("위치를 선택해주세요.")
        $("#realtime_table > tbody").empty();
    }

    viewTable(layer);
    setEmergencyButton();
}

function viewModal(x_value, y_value, beacon_id, count){
    if ($("canvas").getLayer(beacon_id)) {
        $("canvas").removeLayers().drawLayers();
        $("canvas").drawArc({
            layer :true,
            name : beacon_id,
            bringToFont : true,
            strokeStyle : "#36c",
            strokeWidth : 2,
            x : x_value,
            y : y_value,
            radius : 30,
            concavity : 1,
            data : {id : beacon_id},
            click : function(){
                current_click_beacon = beacon_id
                beacon_matching_tag_alive = true
                $.ajax({
                  url : "/monitoring/getLocation?beacon_id="+beacon_id,
                  method: "GET",
                  contentType:"application/json",
                  success: function(data){
                    // console.log(data[0].location)
                    $("#location_name").html(data[0].location)
                  }
                });
                $.ajax({
                    url : "/monitoring/getMtagInfo?beacon_id=" + beacon_id,
                    method : "GET",
                    contentType : "application/json",
                    success:function(data){
                        var TableList = data

                        for (var i = 0; i<TableList.length; i++) {
                            var row = TableList[i]

                            if(row["emergencyCode"] == 0) {
                                row["EmergencyStr"] = noEmergency;
                            } else if(row["emergencyCode"] == 100) {
                                row["EmergencyStr"] = noEmergency;
                            } else if(row["emergencyCode"] == 101) {
                                row["EmergencyStr"] = isEmergency_NoUse;
                            } else if(row["emergencyCode"] == 102) {
                                row["EmergencyStr"] = isEmergency_NoMeasured;
                            } else if(row["emergencyCode"] == 103) {
                                row["EmergencyStr"] = isEmergency_Stress_Excitement;
                            } else {
                                row["EmergencyStr"] = isEmergency_Stress_Excitement;
                            }
                        }
                    }
                })
            }
        })
        .drawText({
            layer : true,
            name : beacon_id + "_count",
            fillStyle : 'red',
            fontStyle : "bold",
            strokeWidth : 10,
            x : x_value,
            y : y_value,
            fontSize : '20pt',
            text : count
        });
    } else {
        $("canvas").drawArc({
            layer :true,
            name : beacon_id,
            bringToFont : true,
            strokeStyle : "#36c",
            strokeWidth : 2,
            x :x_value,
            y :y_value,
            radius : 15,
            concavity : 1,
            data : {id : beacon_id},
            click:function(){
                current_click_beacon = beacon_id
                beacon_matching_tag_alive = true
                $.ajax({
                  url : "/monitoring/getLocation?beacon_id="+beacon_id,
                  method: "GET",
                  contentType:"application/json",
                  success: function(data){
                    $("#location_name").html(data[0].location)
                  }
                });
                $.ajax({
                    url : "/monitoring/getMtagInfo?beacon_id=" + beacon_id,
                    method : "GET",
                    contentType : "application/json",
                    success : function(data){
                        var TableList = data
                        for (var i = 0; i < TableList.length; i++) {
                            var row = TableList[i]

                            if(row["emergencyCode"] == 0) {
                                row["EmergencyStr"] = noEmergency;
                            } else if(row["emergencyCode"] == 100) {
                                row["EmergencyStr"] = noEmergency;
                            } else if(row["emergencyCode"] == 101) {
                                row["EmergencyStr"] = isEmergency_NoUse;
                            } else if(row["emergencyCode"] == 102) {
                                row["EmergencyStr"] = isEmergency_NoMeasured;
                            } else if(row["emergencyCode"] == 103) {
                                row["EmergencyStr"] = isEmergency_Stress_Excitement;
                            } else {
                                row["EmergencyStr"] = isEmergency_Stress_Excitement;
                            }
                        }

                        RealtimeTable = $("#realtime_table").DataTable({
                            "destroy" : true,
                            "ordering" : false,
                            "searching" : false,
                            "info": false,
                            "data": TableList,
                            "paging" : false,
                            "scrollY": "420px",
                            "scrollCollapse": true,
                            "stripeClasses": [ 'odd-row', 'even-row' ],
                            "columns" : [
                                {"data" : "tag_id"},
                                {"data" : "tag_name"},
                                {"data" : "type"},
                                {"data" : "EmergencyStr"},
                            ],
                        });
                    }
                })
            }
        })
        .drawText({
            layer : true,
            name: beacon_id + "_count",
            fillStyle : 'red',
            fontStyle : "bold",
            strokeWidth : 10,
            x : x_value,
            y : y_value,
            fontSize : '15pt',
            text : count
        });
    }
}

function viewTable(layer){
    $.ajax({
        url : "/monitoring/getMonitoringInfo?layer=" + layer,
        contentType : "application/json",
        method : "get",
        success : function(data){
            var TableList = data

            for (var i = 0; i < TableList.length; i++) {
                var row = TableList[i]

                if(row["emergencyCode"] == 0) {
                    row["EmergencyStr"] = noEmergency;
                } else if(row["emergencyCode"] == 100) {
                    row["EmergencyStr"] = noEmergency;
                } else if(row["emergencyCode"] == 101) {
                    row["EmergencyStr"] = isEmergency_NoUse;
                } else if(row["emergencyCode"] == 102) {
                    row["EmergencyStr"] = isEmergency_NoMeasured;
                } else if(row["emergencyCode"] == 103) {
                    row["EmergencyStr"] = isEmergency_Stress_Excitement;
                } else {
                    row["EmergencyStr"] = isEmergency_Stress_Excitement;
                }
            }

            beaconTable = $("#beaconInfoTable").DataTable({
                "destroy" : true,
                "ordering" : false,
                "searching" : false,
                "info" : false,
                "data" : TableList,
                "paging" : false,
                "columns": [
                    {"data" : "tag_id"},
                    {"data" : "tag_name"},
                    {"data" : "type"},
                    {"data" : "location"},
                    {"data" : "EmergencyStr"},
                ],
            });
            
            /*
            $("#beaconInfoTable tbody").on("click", "tr", function() {
                var data = beaconTable.row(this).data();
                var tag_id = data.tag_id;
                $("#ReceiveMessage_UserName").html(tag_id);

                $("#SendMessageToUser-Form").dialog({
                    resizable : false,
                    height:"auto",
                    width:450,
                    modal:true,
                    buttons:{
                        "전송":function(){
                            var message = $("#send_message_text").val()
                            if(message != ""){
                                if(!vaild_blank(message)) {
                                    alert("공백 문자만 입력할 수 없습니다.")
                                    return;
                                }
                                if(!vaild_Message(message)) {
                                    return;
                                }
                                data = {"tag_id":tag_id, "message":message}

                                $.ajax({
                                    url:"/monitoring/tagSendMessage",
                                    contentType:"application/json",
                                    method:"post",
                                    data:JSON.stringify(data),
                                    success:function(data){
                                        $("#send_message_text").val("")
                                        if (data) {
                                            alert(tag_id + " 태그로 메세지 전송 완료")
                                        } else {
                                            alert(tag_id + " 태그로 메세지 전송 실패")
                                        }
                                   }
                                })
                                $(this).dialog("close")
                            } else {
                                alert("태그로 전송할 메세지가 입력되지 않음")
                            }
                        },
                        "취소":function(){
                            $(this).dialog("close")
                        }
                    }
                })
            })
            */
        }
    })
}

function setEmergencyButton() {
    $.ajax({
        url : "/monitoring/getEmergencyCount",
        contentType : "application/json",
        method : "get",
        success : function(data) {
            var count = data.length

            if(count > 0) {
                $("#emergency_button")
                    .prop("disabled", false)
                    .addClass('on')
                    .removeClass('off');
            } else if(count <= 0) {
                $("#emergency_button")
                    .prop("disabled", true)
                    .addClass('off')
                    .removeClass('on');
            }
        }
    });
}

function viewEmergencyTable() {
    $.ajax({
        url : "/monitoring/getEmergencyInfo",
        contentType : "application/json",
        method : "get",
        success : function(data) {
            var TableList = data

            emergencyTable = $("#EmergencyInfoTable").DataTable({
                "destroy" : true,
                "ordering" : false,
                "searching" : false,
                "info" : false,
                "data" : TableList,
                "paging" : false,
                "columns": [
                    {"data" : "tag_id"},
                    {"data" : "tag_name"},
                    {"data" : "type"},
                    {"data" : "location"},
                    {"data" : "layer"},
                ],
            });

            $("#EmergencyInfoTable tbody").on("click", "tr", function() {
                var data = emergencyTable.row(this).data();
                var tag_id = data.tag_id;
                $("#Emergency_TagID").html(tag_id);

                $("#EmergencyRelease-Form").dialog({
                    resizable : false,
                    height:"auto",
                    width:450,
                    modal:true,
                    buttons:{
                        "해제":function(){
                            data = {"tag_id":tag_id}

                            $.ajax({
                                url:"/monitoring/tagEmergencyRelease",
                                contentType:"application/json",
                                method:"put",
                                data:JSON.stringify(data),
                                success:function(data){
                                    if (data) {
                                        $.ajax({
                                            url : "/monitoring/getEmergencyInfo",
                                            contentType : "application/json",
                                            method : "get",
                                            success : function(data) {
                                                var TableList = data

                                                emergencyTable = $("#EmergencyInfoTable").DataTable({
                                                    "destroy" : true,
                                                    "ordering" : false,
                                                    "searching" : false,
                                                    "info" : false,
                                                    "data" : TableList,
                                                    "paging" : false,
                                                    "columns": [
                                                        {"data" : "tag_id"},
                                                        {"data" : "tag_name"},
                                                        {"data" : "type"},
                                                        {"data" : "location"},
                                                        {"data" : "layer"},
                                                    ],
                                                });
                                                location.href="/monitoring"
                                            }
                                        })
                                    } else {
                                        alert("데이터베이스 오류로 인한 위험상황 해제 오류 발생")
                                    }
                               }
                            })
                            $(this).dialog("close")
                        },
                        "취소":function(){
                            $(this).dialog("close")
                        }
                    }
                })
            })
        }
    });

    $("#EmergencyInfo-Form").dialog({
        position: {my: "left+630 top+140", at: "left top", of: document},
        resizable : false,
        height :700,
        width : 500,
        modal : false
    })
}

function viewNoticeDialog() {
    $("#Notice-Form").dialog({
        resizable : false,
        height:"auto",
        width:450,
        modal:true,
        buttons:{
            "전송":function(){
                var message = $("#send_notice_text").val()

                if(message != "") {
                    if(!vaild_blank(message)) {
                        alert("공백 문자만 입력할 수 없습니다.")
                        return;
                    }
                    if(!vaild_Message(message)) {
                        return;
                    }
                    $.ajax({
                        url:"/monitoring/getEnableTagsID",
                        contentType:"application/json",
                        method:"get",
                        success:function(TagsID) {
                            //현재 존재하는 태그들 배열로 추가
                            data = {"tagsID":TagsID, "message":message}

                            $.ajax({
                                url:"/monitoring/tagSendNoticeToAll",
                                contentType:"application/json",
                                method:"post",
                                data:JSON.stringify(data),
                                success:function(data){
                                    $("#send_notice_text").val("")
                                    if (data) {
                                        alert("전체 공지사항 전송 완료")
                                    } else {
                                        alert("전체 공지사항 전송 실패")
                                    }
                               }
                            })
                        }
                    })
                    $(this).dialog("close")
                } else {
                    alert("공지사항 내용이 입력되지 않음")
                }
            },
            "취소":function(){
                $(this).dialog("close")
            }
        }
    })
}

var isAlert = false

function getCurrentLoginID() {
    if(!isAlert) {
        $.ajax({
            url:"/login/currentLoginID",
            contentType:"application/json",
            method:"get",
            success:function(data) {
                if(!data) {
                    isAlert = true
                    alert("다른 클라이언트에서의 로그인이 감지되어 로그아웃합니다.")
                    window.location.href = "/login/autologout"
                }
            }
        })        
    }
}

setInterval(function(){getCurrentLoginID()}, 5000);
setInterval(function(){viewMtag($("#hidden_layer").val())}, 3000);
setInterval(function(){viewCount($("#hidden_layer").val())}, 3000);
setInterval(function(){realtimeMonitoring()}, 1000);
