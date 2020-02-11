var canvasx = 800;
var canvasy = 500;
var areax = 10;
var areay = 10;

var Installed_on = "<span style='color:green'>설치</span>"
var Installed_off = "<span style='color:red'>미설치</span>"
var Register_on = "<span>등록</span>"
var Register_off = "<span style='color:red'>미등록</span>"

var regex_beaconid = /[A-Fa-f0-9]{8}/
var regex_location = /[A-Za-z0-9가-힣]{1,15}/
var regex_blank = /^\s+|\s+$/g

var beaconDraggable = false;

function vaild_BeaconID(beacon_id) {
    var beaconid_verification = beacon_id.match(regex_beaconid);
    if(beaconid_verification != beacon_id || beaconid_verification == null) {
        return false;
    }
    return true;
}

function vaild_location(location) {
    var location_verification = location.match(regex_location);
    if(location_verification != location || location_verification == null) {
        return false;
    }
    return true;
}

function vaild_blank(text) {
    if(text.replace(regex_blank, '') == "") {
        return false;
    }
    return true;
}

$(function(){
    var layer_type = location.href.split("=")[1];

    $.ajax({
        url:"/system/req_layer",
        contentType:"application/json",
        method:"get",
        success:function(data){
            for(var i = 0; i<data.length; i++){
                var layer = i+1;
                $("#select_layer").append("<option value="+layer+">"+layer + "F - " + data[i].deck+"</option>")
                $("#add_select_layer").append("<option value="+layer+">"+layer + "F - " + data[i].deck+"</option>")
            }
            if(layer_type != undefined){
                layer = layer_type;
            } else {
                layer = 1;
            }

            viewMap(layer)
            viewTable(layer)
            $("#select_layer").val(layer)
        }
    })

    $("#select_layer").on("change", function(){
        var layer = this.value
        location.href="/system/beacon_admin?layer=" + layer;
    })
})

function viewMap(layer){
    $.ajax({
        url:"/system/req_map?layer="+layer,
        contentType:"application/json",
        method:"get",
        success:function(data){
            // console.log(data)
            if(data[0].path == undefined){
                return
            }else{
                var path = data[0].path
                $("#canvas").css({"background-image":"url("+path+")","background-size":"100% 100%"})
            }
        }
    })
    $.ajax({
        url:"/system/getBeaconInfo?layer="+layer,
        contentType:"application/json",
        method:"get",
        success:function(data){
            $('canvas').removeLayers().drawLayers();

            for (var i = 0; i<data.length; i++) {
                var beacon_id = data[i].beacon_id;
                var loc_x = data[i].x
                var loc_y = data[i].y
                var x_value = loc_x*(canvasx/10);
                var y_value = canvasy - loc_y*(canvasy/10);

                visibleBeacon(x_value, y_value, beacon_id)
            }
        }
    })

    $('canvas').on("mouseout", function() {
        if(beaconDraggable) {
            //드래그 중에 빠져나가면 ~
            alert("비콘 위치 설정 범위를 벗어났습니다.")
            var layer_value = $("#select_layer option:selected").val()
            viewMap(layer_value)
            beaconDraggable = false;
        }
    })
}

function visibleBeacon(x_value, y_value, beacon_id){
    var x = x_value
    var y = y_value

    if($("canvas").getLayer(beacon_id)) {
        $("canvas").setLayer(beacon_id, {
            x:x,
            y:y
        }).drawLayers();
        $("canvas").setLayer(beacon_id + "_txt", {
            x: x,
            y: y
        }).drawLayers();
    } else {
        $("canvas").drawArc({
            layer: true,
            name: beacon_id,
            draggable: true,
            bringToFront: true,
            strokeStyle: "#36c",
            strokeWidth: 3,
            x: x,
            y: y,
            radius: 15,
            concavity: 1,
            data: {id: beacon_id},
            cursors: {
                // Show pointer on hover
                mouseover: 'pointer',
                // Show 'move' cursor on mousedown
                mousedown: 'move',
                // Revert cursor on mouseup
                mouseup: 'pointer'
            },
            click:function(){
                $("#init_beacon_x").val(x)
                $("#init_beacon_y").val(y)
            },
            dragstart: function(layer) {
                beaconDraggable = true
                setupLocation(layer)
            },
            drag: function(layer) {
                // console.log(layer.eventX)
                setupLocation(layer)
                txt_layer = $("canvas").getLayer(layer.data.id + "_txt");
                if(txt_layer == undefined){
                    var layer_value = $("#select_layer option:selected").val()
                    viewMap(layer_value)
                }else{
                    // if( layer.eventX < 8 || layer.eventX > 792 || layer.eventY < 8 || layer.eventY > 492 ){
                    if( $("#beacon_x").val() < 0.05 || $("#beacon_x").val() > 9.9 || $("#beacon_y").val() < 0.05 || $("#beacon_y").val() > 9.9 ){    
                        alert("비콘 위치 설정 범위를 벗어났습니다.")
                        beaconDraggable = false
                        var layer_value = $("#select_layer option:selected").val()
                        viewMap(layer_value)
                    }
                    txt_layer.x = $("#beacon_x").val()*(canvasx/10);
                    txt_layer.y = canvasy - $("#beacon_y").val()*(canvasy/10);                    
                }
            },
            dragstop: function(layer) {
                beaconDraggable = false
                setupLocation(layer)
                if($("#Beacon_x").val() != x_value && $("#Beacon_y").val() != y_value){
                    if(confirm("비콘위치를 적용하시겠습니까?") == true){
                        var x = $("#beacon_x").val()
                        var y = $("#beacon_y").val()
                        updateBeacon(beacon_id, x, y)
                    } else {
                        //visibleBeacon(x_value, y_value, beacon_id)
                        var layer_value = $("#select_layer option:selected").val()
                        viewMap(layer_value)
                    }
                }
            }
        })
        .drawText({
            layer: true,
            name: beacon_id + "_txt",
            fillStyle: 'red',
            fontStyle: "bold",
            strokeWidth: 10,
            x: x,
            y: y,
            fontSize: '12pt',
            text: beacon_id
        });
    }
}
function updateBeacon(beacon_id, x, y){
    data = {"beacon_id":beacon_id, "x":x, "y":y}
    $.ajax({
        url:"/system/updateBeacon",
        data : JSON.stringify(data),
        contentType:"application/json",
        method: "PUT",
        success:function(data){
            if(data){
                var rowIndex = findRowIndex(beacon_id);
                var rowData = table.row(rowIndex).data()
                $("#init_beacon_x").val(x)
                $("#init_beacon_y").val(y)
                rowData["x"] = x;
                rowData["y"] = y;
                table.row(rowIndex).data(rowData).draw(false);
                alert("비콘위치 적용 성공")
            } else {
                alert("데이터베이스 오류로 인한 비콘위치 적용 실패")
            }
        }
    })
}

function findRowIndex(beacon_id){
    var dataSet = table.rows().data()
    for(var idx = 0; idx < dataSet.length; idx++) {
        if(dataSet[idx]["beacon_id"] == beacon_id) {
            return idx;
        }
    }
}

function setupLocation(layer){
    x_pos1 = layer['x'].toString()
    y_pos1 = layer['y'].toString()
    x_pos = (x_pos1)/80;
    y_pos = (500 - y_pos1)/50
    $("#beacon_x").val(x_pos.toFixed(4))
    $("#beacon_y").val(y_pos.toFixed(4))

    if(layer.x == undefined){
        return;
    }
  
}

function init_table(data){
    var TableList = data

    table = $("#beaconInfoTable").DataTable({
        "destroy":true,
        "ordering": false,
        "searching": false,
        "info": false,
        "data": TableList,
        "paging": false,
        "columns":[
            {"data":"beacon_id"},
            {"data":"location"},
            {"data":"isInstalled"},
            {"defaultContent":"<button class='modi_btn' id='modi_btn'>수정</button>"},
            {"defaultContent":"<button class='del_btn' id='del_btn'>삭제</button>"}
        ],
    });

    Installed_on = "<span style='color:green'class='update_installed'>ON</span>"
    noInstalled_off = "<span style='color:red'class=update_installed'>OFF</span>"
    for(var i = 0; i<TableList.length; i++){
        var beacon_id = TableList[i].beacon_id;
        //var isInstalled = TableList[i].isInstalled;
        rowIndex = findRowIndex(beacon_id)
        rowData  = table.row(rowIndex).data();

        if(rowData["isInstalled"]){
            rowData["isInstalled"] = Installed_on
        }else{
            rowData["isInstalled"] = noInstalled_off
        }
        table.row(rowIndex).data(rowData).draw(false);
    }

    /*
    Register_on = "<span class='update_registered'>등록</span>"
    noRegister_off = "<span style='color:red'class='update_registered'>미동록</span>"
    for(var i = 0; i<TableList.length; i++){
        var beacon_id = TableList[i].beacon_id;
        var isRegister = TableList[i].isRegister;
        rowIndex = findRowIndex(beacon_id)
        rowData  = table.row(rowIndex).data();

        if(rowData["isRegister"]){
            rowData["isRegister"] = Register_on
        }else{
            rowData["isRegister"] = noRegister_off
        }
        table.row(rowIndex).data(rowData).draw(false);
    }
    */
}

function viewTable(layer){
    $.ajax({
        url:"/system/getBeaconInfo?layer="+layer,
        contentType:"application/json",
        method:"get",
        success:function(data){
            init_table(data)

            $("#beaconInfoTable").on("click","#del_btn",function(){
                var data = table.row($(this).parents("tr")).data()
                var beacon_id = data.beacon_id;
                var layer = $("#select_layer").val() //데이터를 미리 가지고있다가 삭제 시 사용.
                $("#delete_beacon_id").html(beacon_id)

                $("#delete-form").dialog({
                    resizable : false,
                    height:"auto",
                    width:400,
                    modal:true,
                    buttons:{
                        "삭제":function() {
                            //데이터 삭제하는 구문
                            $.ajax({
                                url: "/system/deleteBeaconInfo?beacon_id=" + beacon_id,
                                contentType:"application/json",
                                method:"delete",
                                success:function(data){
                                    if(data == true){
                                        alert("비콘 삭제 성공")
                                        $.ajax({
                                            url:"/system/getBeaconInfo?layer="+layer,
                                            contentType:"application/json",
                                            method:"get",
                                            success:function(data){
                                                init_table(data)
                                            }
                                        });
                                        viewMap(layer)
                                        //location.href="/system/beacon_admin?layer=" + layer;
                                    }else{
                                        alert("데이터베이스 오류로 인한 비콘 삭제 실패")
                                    }
                                }
                            })
                            $(this).dialog("close")
                        },
                        "취소":function() {
                            $(this).dialog("close")
                        }
                    }
                });
            })
            //	시작 update_registered
            /*
            $("#beaconInfoTable").on("change", ".update_registered", function(){
                var data = table.row($(this).parents("tr")).data()
                var beacon_id = data.beacon_id;
                var rowIndex = findRowIndex(beacon_id);
                var rowData = table.row(rowIndex).data();

                console.log(rowData)
            })
            */
            $("#beaconInfoTable").on("change", ".update_installed", function(){
                var data = table.row($(this).parents("tr")).data()
                var beacon_id = data.beacon_id;
                var rowIndex = findRowIndex(beacon_id);
                var rowData = table.row(rowIndex).data();

                if(beacon_id == '' || beacon_id == undefined) {
                    alert("비콘 ID가 입력되지 않음")
                    return
                }
                if(!vaild_BeaconID(beacon_id)) {
                    alert("비콘 ID 규격은 16진수 8자리 문자입니다.")
                    return
                }
                if(!vaild_blank(location)) {
                    $("#update_beacon_location_txt").val("")
                    alert("필드에 공백 문자만 입력할 수 없습니다.")
                    return
                }
                if(!vaild_location(location)) {
                    $("#update_beacon_location_txt").val("")
                    alert("설치 장소는 1~15자리로 입력해야합니다.")
                    return
                }

                if(rowData["Installed_on"] == "<span class='update_installed"){
                    data = {"beacon_id":beacon_id}
                    $.ajax({
                        url : "/system/checkInstalled",
                        method : "PUT",
                        contentType: "application/json",
                        data : JSON.stringify(data),
                        success:function(data){
                            if(data) {
                                alert("비콘 설치 완료")
                                $.ajax({
                                    url:"/system/getBeaconInfo?layer="+layer,
                                    contentType:"application/json",
                                    method:"get",
                                    success:function(data){
                                        init_table(data)
                                    }
                                });
                            } else {
                                alert("데이터베이스 오류 발생")
                            }
                        }
                    })
                }else{
                    data = {"beacon_id":beacon_id}
                    $.ajax({
                        url : "/system/noCheckInstalled",
                        method : "PUT",
                        contentType: "application/json",
                        data : JSON.stringify(data),
                        success:function(data){
                            if(data) {
                                $.ajax({
                                    url:"/system/getBeaconInfo?layer="+layer,
                                    contentType:"application/json",
                                    method:"get",
                                    success:function(data){
                                        init_table(data)
                                    }
                                });
                            } else {
                                alert("데이터베이스 오류 발생")
                            }
                        }
                    })
                }
            })
            $("#beaconInfoTable").on("click","#modi_btn",function(){
                var data = table.row($(this).parents("tr")).data()
                var beacon_id = data.beacon_id;

                $.ajax({
                    url:"/system/ModifyBeaconInfo?beacon_id="+beacon_id,
                    contentType:"application/json",
                    method:"get",
                    success:function(data){
                        if(data.length > 0) {
                            $("#update_beacon_id_txt").html(data[0].beacon_id)
                            $("#update_beacon_location_txt").val(data[0].location)
    
                            //데이터를 토대로 radio 데이터 설정 - radio name == install, register
                            //Register Radio Checked 설정
                            /*
                            if(data[0].isRegister == 0) {
                                $("#non_registered").prop('checked', true);
                            } else {
                                $("#registered").prop('checked', true);
                            }
                            */
                            //Install Radio Checked 설정
                            if(data[0].isInstalled == 0) {
                                $("#non_installed").prop('checked', true);
                            } else {
                                $("#installed").prop('checked', true);
                            }
                        }
                    }
                })
                $("#update-form").dialog({
                    resizable : false,
                    height:"auto",
                    width:400,
                    modal:true,
                    buttons:{
                        "수정":function(){
                            var beacon_id = $("#update_beacon_id_txt").html()
                            var location = $("#update_beacon_location_txt").val()
                            //var isRegister = $("input[name=register]:checked").val()
                            var isInstalled = $("input[name=install]:checked").val()
                            if(beacon_id == '' || beacon_id == undefined) {
                                alert("비콘 ID가 입력되지 않음")
                                return
                            }
                            if(!vaild_BeaconID(beacon_id)) {
                                alert("비콘 ID 규격은 16진수 8자리 문자입니다.")
                                return
                            }
                            if(!vaild_blank(location)) {
                                $("#update_beacon_location_txt").val("")
                                alert("필드에 공백 문자만 입력할 수 없습니다.")
                                return
                            }
                            if(!vaild_location(location)) {
                                $("#update_beacon_location_txt").val("")
                                alert("설치 장소는 1~15자리로 입력해야합니다.")
                                return
                            }

                            var data = {"beacon_id":beacon_id, "layer":layer, "location":location, "isInstalled":isInstalled}
                            $.ajax({
                                url:"/system/ModifyBeacon",
                                contentType:"application/json",
                                method:"put",
                                data:JSON.stringify(data),
                                success:function(data){
                                    var selet_layer = $("#select_layer").val()
                                    if(data == true){
                                        alert("비콘 수정 성공")
                                        if(select_layer != layer){
                                            $('canvas').removeLayer(beacon_id).drawLayers();
                                            $('canvas').removeLayer(beacon_id+"_txt").drawLayers();
                                        }
                                        $.ajax({
                                            url:"/system/getBeaconInfo?layer="+selet_layer,
                                            contentType:"application/json",
                                            method:"get",
                                            success:function(data){
                                                init_table(data)
                                            }
                                        });
                                        viewMap(layer)
                                    }else{
                                        alert("데이터베이스 오류로 인한 비콘 수정 실패")
                                    }
                                }
                            })
                            $("#update_beacon_location_txt").val("")
                            $(this).dialog("close")
                        },
                        "취소":function(){
                            $("#update_beacon_location_txt").val("")
                            $(this).dialog("close")
                        }
                    }
                })
            })
        }
    })
}

function addBeacon(){
    //실행 전 add_select_layer 설정 ==> 현재 layer 설정 값으로
    //var layer = $("#select_layer").val() 사용
    var current_layer = $("#select_layer option:selected").text();
    $("#add_select_layer option").filter(function() {
        return this.text == current_layer;
    }).prop('selected', 'selected')

    $("#add-form").dialog({
        resizable : false,
        height:"auto",
        width:400,
        modal:true,
        buttons:{
            "추가":function(){
                var data = table.row($(this).parents("tr")).data()
                var beacon_id = $("#add_beacon_id_txt").val()
                var layer = $("#add_select_layer option:selected").val()
                if(beacon_id == '' || beacon_id == undefined) {
                    alert("비콘 ID가 입력되지 않음")
                    return
                }
                if(!vaild_BeaconID(beacon_id)) {
                    alert("비콘 ID 규격은 16진수 8자리 문자입니다.")
                    return
                }
                $.ajax({
                    url:"/system/addBeacon?beacon_id="+beacon_id+"&layer="+layer,
                    contentType:"application/json",
                    method:"get",
                    success:function(data){
                        if(data == true){
                            alert("비콘 추가 완료")
                            $("canvas").drawArc({
                                layer: true,
                                name: beacon_id,
                                draggable: true,
                                bringToFront: true,
                                strokeStyle: "#36c",
                                strokeWidth: 3,
                                x: 0,
                                y: 500,
                                radius: 15,
                                concavity: 1,
                                data: {id: beacon_id},
                                click:function(){
                                    $("#init_beacon_x").val(x)
                                    $("#init_beacon_y").val(y)
                                },
                                dragstart: function(layer) {
                                    beaconDraggable = true
                                    setupLocation(layer)
                                },
                                drag: function(layer) {
                                    // console.log(layer.eventX)
                                    setupLocation(layer)
                                    txt_layer = $("canvas").getLayer(layer.data.id + "_txt");
                                    if(txt_layer == undefined){
                                        var layer_value = $("#select_layer option:selected").val()
                                        viewMap(layer_value)
                                    }else{
                                        // if( layer.eventX < 8 || layer.eventX > 792 || layer.eventY < 8 || layer.eventY > 492 ){
                                        if( $("#beacon_x").val() < 0.05 || $("#beacon_x").val() > 9.9 || $("#beacon_y").val() < 0.05 || $("#beacon_y").val() > 9.9 ){  
                                            alert("비콘 위치 설정 범위를 벗어났습니다.")  
                                            beaconDraggable = false
                                            var layer_value = $("#select_layer option:selected").val()
                                            viewMap(layer_value)
                                        }
                                        txt_layer.x = $("#beacon_x").val()*(canvasx/10);
                                        txt_layer.y = canvasy - $("#beacon_y").val()*(canvasy/10);                    
                                    }
                                },
                                dragstop: function(layer) {
                                    beaconDraggable = false
                                    setupLocation(layer)
                                    if($("#Beacon_x").val() != x_value && $("#Beacon_y").val() != y_value){
                                        if(confirm("비콘위치를 적용하시겠습니까?") == true){
                                            var x = $("#beacon_x").val()
                                            var y = $("#beacon_y").val()
                                            updateBeacon(beacon_id, x, y)
                                        } else {
                                            //visibleBeacon(x_value, y_value, beacon_id)
                                            var layer_value = $("#select_layer option:selected").val()
                                            viewMap(layer_value)
                                        }
                                    }
                                }
                            })
                            .drawText({
                                layer: true,
                                name: beacon_id + "_txt",
                                fillStyle: 'red',
                                fontStyle: "bold",
                                strokeWidth: 10,
                                x: 0,
                                y: 500,
                                fontSize: '12pt',
                                text: beacon_id
                            });
                            $.ajax({
                                url:"/system/getBeaconInfo?layer="+layer,
                                contentType:"application/json",
                                method:"get",
                                success:function(data){
                                    init_table(data)
                                }
                            });
                            //location.href="/system/beacon_admin?layer=" + layer;
                            viewMap(layer)
                        } else if(data == 'ER_DUP_ENTRY') {
                            alert('비콘 ID 데이터 중복으로 인한 비콘 데이터 추가 실패')
                        }else{
                            alert("데이터베이스 오류로 인한 비콘 데이터 추가 실패")
                        }
                    }
                })
                $("#add_beacon_id_txt").val("")
                $(this).dialog("close")
            },
            "취소":function(){
                $("#add_beacon_id_txt").val("")
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