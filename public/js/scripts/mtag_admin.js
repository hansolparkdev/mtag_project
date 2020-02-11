//100 - 정상, 101 - 미착용, 102 - 미측정, 103 - 스트레스 및 흥분(응급)
var isEmergency_NoUse             = "<span style='color:red'>미착용</span>"
var isEmergency_NoMeasured        = "<span style='color:red'>미측정</span>"
var isEmergency_Stress_Excitement = "<span style='color:red'>응급</span>"
var noEmergency                   = "<span>정상</span>"
var active_on 	= "<span>ON</span>"
var active_off  = "<span style='color:red'>OFF</span>"

var regex_mtagid = /[A-Fa-f0-9]{8}/
var regex_name = /[가-힣]{3,5}/

var current_table
var open_status = false;

function vaild_mtagid(mtag_id) {
    var mtagid_verification = mtag_id.match(regex_mtagid);
    if(mtagid_verification != mtag_id || mtagid_verification == null) {
        return false;
    }
    return true;
}

function vaild_name(name) {
    var name_verification = name.match(regex_name);
    if(name_verification != name || name_verification == null) {
        return false;
    }
    return true;
}

$(function(){
    $.ajax({
        url:"/mtag/getMtagInfo",
        contentType:"application/json",
        method:"get",
        success:function(data){
            var TableList = data

            for (var i = 0; i<TableList.length; i++) {
                var row = TableList[i]

                if (row["isActive"]) {
                    row["ActiveStr"] = active_on;
                }
                else {
                    row["ActiveStr"] = active_off;
                }
            }

            table = $("#tagInfoTable").DataTable({
                "destroy":true,
                "ordering": false,
                "searching": true,
                "lengthChange":false,
                "info": false,
                "data": TableList,
                "paging": true,
                "columns":[
                    {"data":"tag_id"},
                    {"data":"tag_name"},
                    {"data":"type"},
                    {"defaultContent":"<button id='status_btn' class='status_btn'>상태 확인</button>"},
                    {"defaultContent":"<button id='modi_btn' class='modi_btn'>수정</button>"},
                    {"defaultContent":"<button id='del_btn' class='del_btn'>삭제</button>"}
                ],
            });

            $("#tagInfoTable").on("click","#status_btn",function(){
                var data = table.row($(this).parents("tr")).data()
                var tag_id = data.tag_id;
                $("#status_tagid").html(tag_id)

                $.ajax({
                    url:"/mtag/StatusTagInfo?tag_id="+tag_id,
                    contentType:"application/json",
                    method:"get",
                    success:function(data){
                        if(data.length > 0) {
                            $("#status_tagid").html(data[0].tag_id)
                            $("#status_tagname").html(data[0].tag_name)
                            $("#status_tag_location").html(data[0].location)
                            if(data[0].isActive == 0) {
                                $("#status_tag_active").html(active_off)
                            }else if(data[0].isActive == 1) {
                                $("#status_tag_active").html(active_on)
                            }
                            var datetime = new Date(data[0].update_time)
                            $("#status_tag_updatetime").html(getDateTime(datetime)) // -> datetime
                            open_status = true;
                        } else {
                            //Tag 데이터 존재하지 않음
                            open_status = false;
                        }

                        if(!open_status) {
                            alert("확인 요청한 Mtag는 사용된 적이 없는 Tag입니다.")
                        } else {
                            $("#status_tag_form").dialog({
                                resizable : false,
                                height:"auto",
                                width:400,
                                modal:true,
                                buttons:{
                                    "확인" : function() {
                                        $(this).dialog("close");
                                    }
                                }
                            })
                        }
                    }
                })
            })

            $("#tagInfoTable").on("click","#del_btn",function(){
                var data = table.row($(this).parents("tr")).data()
                var tag_id = data.tag_id;
                $("#delete_tagid").html(tag_id)

                $("#tag_delete-form").dialog({
                    resizable : false,
                    height:"auto",
                    width:400,
                    modal:true,
                    buttons:{
                        "삭제" : function () {
                            $.ajax({
                                url:"/mtag/deleteTag?tag_id="+tag_id,
                                contentType:"application/json",
                                method:"delete",
                                success:function(data){
                                    if(data == true) {
                                        alert("Mtag 삭제 성공")
                                        $.ajax({
                                            url:"/mtag/getMtagInfo",
                                            contentType:"application/json",
                                            method:"get",
                                            success:function(data){
                                                var TableList = data

                                                var active_on 	= "<span>ON</span>"
                                                var active_off  = "<span style='color:red'>OFF</span>"

                                                for(var i = 0; i<TableList.length; i++){
                                                    var row = TableList[i]

                                                    if (row["isActive"]) {
                                                        row["ActiveStr"] = active_on;
                                                    }
                                                    else {
                                                        row["ActiveStr"] = active_off;
                                                    }
                                                }

                                                table = $("#tagInfoTable").DataTable({
                                                    "destroy":true,
                                                    "ordering": false,
                                                    "searching": true,
                                                    "lengthChange":false,
                                                    "info": false,
                                                    "data": TableList,
                                                    "paging": true,
                                                    "columns":[
                                                        {"data":"tag_id"},
                                                        {"data":"tag_name"},
                                                        {"data":"type"},
                                                        {"defaultContent":"<button id='status_btn' class='status_btn'>상태 확인</button>"},
                                                        {"defaultContent":"<button id='modi_btn' class='modi_btn'>수정</button>"},
                                                        {"defaultContent":"<button id='del_btn' class='del_btn'>삭제</button>"}
                                                    ],
                                                });
                                            }
                                        })
                                    } else {
                                        alert("데이터베이스 오류로 인한 Mtag 삭제 실패")
                                    }
                                }
                            })
                            $(this).dialog("close")
                        },
                        "취소" : function() {
                            $(this).dialog("close");
                        }
                    }
                })
            })

            $("#tagInfoTable").on("click","#modi_btn",function(){
                var data = table.row($(this).parents("tr")).data()
                var tag_id = data.tag_id;

                $.ajax({
                    url:"/mtag/ModifyTagInfo?tag_id="+tag_id,
                    contentType:"application/json",
                    method:"get",
                    success:function(data){
                        $("#update_tag_id_txt").html(data[0].tag_id)
                        $("#update_tag_name_txt").val(data[0].tag_name)
                        $("#update_tag_type option").filter(function() {
                            return this.text == data[0].type;
                        }).prop('selected', 'selected')
                    }
                })

                $("#update-form").dialog({
                    resizable : false,
                    height:"auto",
                    width:400,
                    modal:true,
                    buttons:{
                        "수정":function(){
                            var tag_id = $("#update_tag_id_txt").html()
                            var tag_name = $("#update_tag_name_txt").val()
                            var type = $("#update_tag_type option:selected").text()
                            
                            if(!vaild_name(tag_name)) {
                                alert("이름은 3~5자리 한글 문자로 입력해주세요.")
                                return
                            }
                            
                            data = {"tag_id":tag_id, "tag_name":tag_name, "type":type}

                            $.ajax({
                                url:"/mtag/ModifyTag",
                                contentType:"application/json",
                                method:"put",
                                data:JSON.stringify(data),
                                success:function(data){
                                    if (data == true) {
                                        alert("Mtag 수정 성공")
                                        $.ajax({
                                            url:"/mtag/getMtagInfo",
                                            contentType:"application/json",
                                            method:"get",
                                            success:function(data){
                                                var TableList = data

                                                //100 - 정상, 101 - 미착용, 102 - 미측정, 103 - 스트레스 및 흥분(응급)
                                                var active_on 	= "<span>ON</span>"
                                                var active_off  = "<span style='color:red'>OFF</span>"

                                                for (var i = 0; i<TableList.length; i++) {
                                                    var row = TableList[i]

                                                    if (row["isActive"]) {
                                                        row["ActiveStr"] = active_on;
                                                    }
                                                    else {
                                                        row["ActiveStr"] = active_off;
                                                    }
                                                }

                                                table = $("#tagInfoTable").DataTable({
                                                    "destroy":true,
                                                    "ordering": false,
                                                    "searching": true,
                                                    "lengthChange":false,
                                                    "info": false,
                                                    "data": TableList,
                                                    "paging": true,
                                                    "columns":[
                                                        {"data":"tag_id"},
                                                        {"data":"tag_name"},
                                                        {"data":"type"},
                                                        {"defaultContent":"<button id='status_btn' class='status_btn'>상태 확인</button>"},
                                                        {"defaultContent":"<button id='modi_btn' class='modi_btn'>수정</button>"},
                                                        {"defaultContent":"<button id='del_btn' class='del_btn'>삭제</button>"}
                                                    ],
                                                });
                                            }
                                        })
                                    } else if(data == 'ER_DUP_ENTRY') {
                                        alert('Mtag ID 데이터 중복으로 인한 Mtag 데이터 수정 실패')
                                    } else {
                                            alert("데이터베이스 오류로 인한 Mtag 수정 실패")
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
    })
})

function getDateTime(updateTime) {
    return updateTime.getFullYear().toString()+"-"+((updateTime.getMonth()+1).toString().length==2?(updateTime.getMonth()+1).toString():"0"+
            (updateTime.getMonth()+1).toString())+"-"+
            (updateTime.getDate().toString().length==2?updateTime.getDate().toString():"0"+updateTime.getDate().toString())+" "+
            (updateTime.getHours().toString().length==2?updateTime.getHours().toString():"0"+updateTime.getHours().toString())+":"+
            ((parseInt(updateTime.getMinutes()/5)*5).toString().length==2?(parseInt(updateTime.getMinutes()/5)*5).toString():"0"+
            (parseInt(updateTime.getMinutes()/5)*5).toString())+":00";
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
        now_time();
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
        url : "mtag/getTempInfo?layer=" + layer,
        contenType : "application/json",
        method : "get",
        success : function(data) {
            var TableList = data
            table = $("#temp_info").DataTable({
                "destroy" : true,
                "ordering" : true,
                "searching" : false,
                "info" : false,
                "data" : TableList,
                "paging" : false,
                "columns" : [
                    {"data" : temperature},
                    {"data" : humidity}
                ],
            });
        }
    });
}

function tagAdd(){
    $("#tagad-form").dialog({
        resizable : false,
        height:"auto",
        width:400,
        modal:true,
        buttons:{
            "추가":function(){
                var tag_id = $("#add_tag_id_txt").val()
                var tag_name = $("#add_tag_name_txt").val()
                //var type = $("#add_type_txt").val()
                var type = $("#add_tag_type option:selected").text()
                if(tag_id == '' || tag_id == undefined) {
                    alert("Mtag ID가 입력되지 않음")
                    return
                }

                if(!vaild_mtagid(tag_id)) {
                    alert("Mtag ID 규격은 16진수 8자리 문자입니다.")
                    return
                }

                if(!vaild_name(tag_name)) {
                    alert("이름은 3~5자리 한글 문자로 입력해주세요.")
                    return
                }

                data = {"tag_id":tag_id, "tag_name":tag_name, "type":type}

                $.ajax({
                    url: "/mtag/tagAdd",
                    contentType:"application/json",
                    method:"post",
                    data:JSON.stringify(data),
                    success:function(data){
                        if (data == true) {
                            alert("Mtag 추가 성공")
                            $.ajax({
                                url:"/mtag/getMtagInfo",
                                contentType:"application/json",
                                method:"get",
                                success:function(data){
                                    var TableList = data

                                    var active_on 	= "<span>ON</span>"
                                    var active_off  = "<span style='color:red'>OFF</span>"

                                    for (var i = 0; i<TableList.length; i++) {
                                        var row = TableList[i]

                                        if (row["isActive"]) {
                                            row["ActiveStr"] = active_on;
                                        }
                                        else {
                                            row["ActiveStr"] = active_off;
                                        }
                                    }

                                    table = $("#tagInfoTable").DataTable({
                                        "destroy":true,
                                        "ordering": false,
                                        "searching": true,
                                        "lengthChange":false,
                                        "info": false,
                                        "data": TableList,
                                        "paging": true,
                                        "columns":[
                                            {"data":"tag_id"},
                                            {"data":"tag_name"},
                                            {"data":"type"},
                                            {"defaultContent":"<button id='status_btn' class='status_btn'>상태 확인</button>"},
                                            {"defaultContent":"<button id='modi_btn' class='modi_btn'>수정</button>"},
                                            {"defaultContent":"<button id='del_btn' class='del_btn'>삭제</button>"}
                                        ],
                                    });
                                }
                            })
                        } else if(data == 'ER_DUP_ENTRY') {
                            alert('Mtag ID 데이터 중복으로 인한 Mtag 데이터 추가 실패')
                        } else {
                            alert("데이터베이스 오류로 인한 Mtag 데이터 추가 실패")
                        }
                    }
                })
                $("#add_tag_id_txt").val("")
                $("#add_tag_name_txt").val("")
                $(this).dialog("close")
            },
            "취소":function(){
                $("#add_tag_id_txt").val("")
                $("#add_tag_name_txt").val("")
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