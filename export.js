var doctordata = [];
var data_title = '';
var header_s = [];
$('#export').click(function(){
    xls_export(doctordata,"Exported Data",true);
});
$('#reload').click(function(){
    reload();
});
$('#search_by').on('change', function() {
	if($(this).val() > 0) set_typeahead($(this).val());
});

reload();

function set_typeahead(search_fields){
	if(!search_fields) search_fields = header_s;
	$('#search').typeahead({
		display: search_fields,
		source: {
			doctors: {
				data: doctordata
			}
		},
		callback: {
			onSearch: function (node,query) {

			},
			onSubmit: function (node, form, item, event){

			}
		}
	});
}
function reload (launch) {
	$.get('https://openpaymentsdata.cms.gov/resource/v3nw-usd7.json',{},function(response){
		doctordata = response;
		buildHtmlTable('#table_display');
		set_typeahead();
	})
}
function buildHtmlTable(selector) {
    $(selector).empty();
    var columns = addAllColumnHeaders(doctordata, selector);
    for (var i = 0 ; i < doctordata.length ; i++) {
        var row$ = $('<tr/>');
        for (var colIndex = 0 ; colIndex < columns.length ; colIndex++) {
            var cellValue = doctordata[i][columns[colIndex]];

            if (cellValue == null) { cellValue = ""; }

            row$.append($('<td/>').append($('<div/>').html(cellValue)));
            row$.attr("data-"+header_s[colIndex],cellValue);
        }
        $(selector).append(row$);
    }
}
function addAllColumnHeaders(data, selector) {	
	var fill_header = false;
	if(!header_s.length) fill_header = true;
    var columnSet = [];
    var headerTr$ = $('<tr/>');

    for (var i = 0 ; i < data.length ; i++) {
        var rowHash = data[i];
        for (var key in rowHash) {
            if ($.inArray(key, columnSet) == -1){
                columnSet.push(key);
                headerTr$.append($('<th/>').append($('<div/>').html(key)));
                if(fill_header) {
                	header_s.push(key);
                	$('#search_by').append($('<option value="'+key+'"/>').html(key));
                }
            }
        }
    }
    $(selector).append(headerTr$);

    return columnSet;
}
function xls_export(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line
    
    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "MyReport_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}