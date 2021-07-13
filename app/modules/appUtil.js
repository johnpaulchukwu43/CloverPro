const angular = require("angular");

function modifyProductUrl(url,pageSize,pageNumber,sortBy,orderBy,isAppend){
    const baseUrl = isAppend ? url+"&":url+"?";
    return baseUrl+"pageSize="+pageSize+"&pageNum="+pageNumber+"&sortBy="+sortBy+"&order="+orderBy;
}

function normalizeData(list_of_data,pageNumber,pageSize){
    var data_id = (pageSize *pageNumber) - (pageSize - 1);
    angular.forEach(list_of_data,function(data){
        data.serial_no = data_id;
        data_id++;
    });
    return list_of_data;
}

module.exports = {
    modifyProductUrl,
    normalizeData
};
