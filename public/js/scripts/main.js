$(function(){
	getInfoData()
});

function getInfoData() {
	$.ajax({
		url : "/main/getOnBoardInfo",
		contentType : "application/json",
		method : "GET",
		success:function(data){
			var TableList = data;

			onboard_table = $("#viewer").DataTable({
				"destroy":true,
	            "ordering": false,
	            "searching": false,
	            "info": false, 
	            "data": TableList,
	            "paging": false,
				"columns":[
				    {"data":"deck"},
				    {"data":"Boarder"},
				    {"data":"Passenger"},
				    {"data":"Cargo"}
				], 	
			});
		}
	});
	$.ajax({
		url : "/main/getTagInfo",
		contentType : "application/json",
		method : "GET",
		success:function(data){
			var TableList = data;

			tag_table = $("#mtag_list").DataTable({
				"destroy":true,
	            "ordering": false,
	            "searching": false,
	            "info": false, 
	            "data": TableList,
	            "paging": false,
				"columns":[
				    {"data":"TYPE"},
				    {"data":"Active"},
				    {"data":"Emergency"}
				], 	
			});
		}
	});
	$.ajax({
		url : "/main/getBeaconInfo",
		contentType : "application/json",
		method : "GET",
		success:function(data){
			var TableList = data;

			beacon_table = $("#beacon_list").DataTable({
				"destroy":true,
	            "ordering": false,
	            "searching": false,
	            "info": false, 
	            "data": TableList,
	            "paging": false,
				"columns":[
				    {"data":"deck"},
				    {"data":"Installed"}
				], 	
			});
		}
	});
}

setInterval(function(){getInfoData()}, 3000);

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