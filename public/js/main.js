$(function(){
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
				    {"data":"Register"},
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
				    {"data":"Register"},
				    {"data":"Installed"}
				], 	
			});
		}
	});
});