/**
 * Created by anjaria.janit on 17/08/15.
 */

var stage = false;
var offset = 0;
var markers = new Array();
var polylines = new Array();
var arrowHeads = new Array();
var delmarkers = new Array();
var allLocmarkers = new Array();
var shipmentMarkers = new Array();
var shipmentGeoFenceArray = new Array();
var locationmarkers = new Array();
var shown = true;
var alert_request ={};
var agents = {};
var dispValue = 0;
var source = "fsd";
var type = "location"

var instantiateUrls = function() {
    if (stage) {
        LOCATION_ENDPOINT = "https://ekl-lmp-3.stage.ch.flipkart.com:7789/event/latest/";
        LOCATION_HISTORY_ENDPOINT = "https://ekl-lmp-3.stage.ch.flipkart.com:7789/event/";
        DELIVERY_ENDPOINT = "https://ekl-lmp-3.stage.ch.flipkart.com:7789/geotag/";
    }
    else if (!stage) {
        LOCATION_ENDPOINT = "https://ekl-spyglass.nm.flipkart.com/event/latest/";
        LOCATION_HISTORY_ENDPOINT = "https://ekl-spyglass.nm.flipkart.com/event/";
        DELIVERY_ENDPOINT = "https://ekl-spyglass.nm.flipkart.com/geotag/";
    }
    PROCESSED_LOCATION_HISTORY_ENDPOINT = "/ekl-mapping/maps/location_hist";
};

var transformDataObject = function(deviceData){
    var newDeviceData = {}
    for (var attributeKey in deviceData){
        if (attributeKey == "attributes"){
            var attributMap = deviceData[attributeKey];
            for (var attribute in attributMap){
                newDeviceData[attribute] = attributMap[attribute];
            }
        }
        else {
            newDeviceData[attributeKey] = deviceData[attributeKey];
        }
    }
    return newDeviceData;
};

function showValue(newValue)
{
    if (newValue > 5 && newValue <= 12){
        dispValue = newValue
        document.getElementById("range").innerHTML=dispValue + " Hours";
    }
    else{
        dispValue = newValue;
        document.getElementById("range").innerHTML=dispValue + " Hours" ;
    }
    console.info("Time selected from slide bar : " + dispValue);
}

var transformDataForLatestEvent = function(data) {
    console.info("in transform");
    var selectedTime = String(dispValue) + ":00:00";
    selectedTime = (new Date()).getFullYear() +"-"+ ((new Date()).getMonth() + 1) +"-"+ (new Date()).getDate() +" "+ selectedTime ;
    selectedTime = new Date(selectedTime);
    var newData = {};
    var today = new Date();
    today = today.toISOString().substring(0, 10);
    for (var deviceKey in data){
        var deviceData = data[deviceKey];
        var latest_time = new Date(deviceData['time']);
        if(deviceData['time'].split(" ")[0] == today && latest_time >= selectedTime){
            newData[deviceKey] = transformDataObject(deviceData);
        }
    }
    return newData;
};

var transformDataForEventGeoTag = function(data) {
    var newData = {};
    for (var deviceKey in data){
        var newDeviceDataArray = [];
        for (var deviceData in data[deviceKey]) {
            var selectedTime = String(dispValue) + ":00:00";
            selectedTime = (new Date()).getFullYear() +"-"+ ((new Date()).getMonth() + 1) +"-"+ (new Date()).getDate() +" "+ selectedTime ;
            selectedTime = new Date(selectedTime);
            var del_time = new Date(data[deviceKey][deviceData]['time']);
            if(del_time >= selectedTime){
                newDeviceDataArray.push(transformDataObject(data[deviceKey][deviceData]));
            }

        }
        newData[deviceKey] = newDeviceDataArray;
    }
    return newData;
}

FE_IMG = '/static/images/FEnew.png';
DELIVERY_IMG = '/static/images/gift.png';
HUB_IMG = '/static/images/hub.png';

$(function () {
    $('#datetimepicker').datetimepicker({
        pickTime: false
    });
});

$.getScript("/static/js/moment.js", function(){
});

function get_Date() {
    if($('#datetimepicker').data('date') === undefined){
        var date = new Date();
        return "" + date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + (date.getDate() + offset)).slice(-2);
    } else {
        return $('#datetimepicker').data('date');
    }
}

function position(info) {
    return "(" + info.latitude.toFixed(5) + ", " + info.longitude.toFixed(5) + ") &plusmn; " + String(info.accuracy_level) + "m";
}

function signal_strength(signal) {
    if (signal == 99) {
        return '<b>Unknown</b>';
    } else if (signal <= 10) {
        return '<span style="color: red">Poor</span>';
    } else if (signal <= 20){
        return '<span style="color: orange">Good</span>';
    } else {
        return '<span style="color: green">Excellent</span>';
    }
}

var g_flightPath = null;
var g_deliveryMarkers = null;
var g_allLocationMarkers = null;
var last_pos = null;
var last_pos_time = null;
function HubMarker(hub_location,map) {
    this.map = map;
    var icon = L.icon({
        iconUrl: HUB_IMG,
        iconSize: [20,20]
    });

    var gmarker = L.marker([hub_location[0],hub_location[1]],{icon: icon}).addTo(map);
    var that = this;

    gmarker.on('mouseover',that.showInfoWindow);

    gmarker.on('mouseout',that.hideInfoWindow);
}


HubMarker.prototype.showInfoWindow = function () {
    <!--TODO Infowindow on all hubs(or a PopUp is okay !)-->
    this.infowindow = null;
};

HubMarker.prototype.hideInfoWindow = function () {
    <!--TODO Infowindow on all hubs(or a PopUp is okay !)-->
    this.infowindow = null;
};

HubMarker.prototype.createInfo = function() {
    return this.name;
};

function DeliveryMarker(deliveryInfo, map,locationInfo) {
    this.map = map;
    this.deliveryInfo = deliveryInfo;
    this.locationInfo = locationInfo;

    var icon = L.icon({
        iconUrl: DELIVERY_IMG,
        iconSize: [20,20]
    });
    var content = this.createInfo();

    var gmarker = L.marker([this.deliveryInfo.latitude,this.deliveryInfo.longitude],{icon: icon}).addTo(this.map).bindPopup("<b>"+content+"</b>");
    delmarkers.push(gmarker);
    //map.addLayer(gmarker);

    var that = this;

    //gmarker.on('mouseover', that.showInfoWindow());
    //gmarker.on('mouseout', that.hideInfoWindow());

    this.update(deliveryInfo);
}

DeliveryMarker.prototype.showInfoWindow = function () {
    var content = this.createInfo();
    var infopopup = L.popup().setLatLng(L.latLng([this.deliveryInfo.latitude,this.deliveryInfo.longitude])).setContent(content);
    $("abbr.timeago").timeago();
};

DeliveryMarker.prototype.hideInfoWindow = function () {
    this.infopopup = null;
};

DeliveryMarker.prototype.createInfo = function() {

    return "<table class=\"info\">" +
        "<tr><td><b>Runsheet ID</b></td><td>" + this.deliveryInfo.runsheet_id + "</td></tr>" +
        "<tr><td><b>Shipment ID</b></td><td>" + this.deliveryInfo.shipment_id + "</td></tr>" +
        "<tr><td><b>Time</b></td><td>" + this.deliveryInfo.time +
        " ( <abbr class='timeago' title=\""+this.deliveryInfo.time+"\">" + this.deliveryInfo.time + "</abbr> ) " + "</td></tr>" +
        "<tr><td><b>Position</b></td><td>" + position(this.deliveryInfo) + "</td></tr>" +
        "<tr><td><b>Address</b></td><td>" + this.deliveryInfo.address + "</td></tr>" +
        "<tr><td><b>Network Signal</b></td><td>" + signal_strength(this.deliveryInfo.network_signal_strength) + "</td></tr>" +
        "</table>";
};

DeliveryMarker.prototype.update = function (devlieryInfo) {
    this.devlieryInfo = devlieryInfo;

    var position = new L.latLng(this.devlieryInfo.latitude, this.devlieryInfo.longitude);
    //this.gmarker.setLatLng(position).update();
    this.map.panTo(position);
};

DeliveryMarker.prototype.hide = function() {
    this.map.removeLayer(delmarkers);
};

function AllLocationMarker(deliveryInfo, map, locationInfo) {
    console.info("inside All Location !");
    this.map = map;
    this.deliveryInfo = deliveryInfo;
    this.locationInfo = locationInfo ;
    var icon = L.MakiMarkers.icon({icon: 'circle', size:"s"});

    var content = this.createInfo();
    var gmarker = L.marker([this.deliveryInfo.latitude,this.deliveryInfo.longitude],{icon: icon}).addTo(map).bindPopup("<b>"+this.createInfo()+"</b>");

    allLocmarkers.push(gmarker);
    this.map.addLayer(allLocmarkers);
    var that = this;

    gmarker.on('mouseover', that.showInfoWindow());
    gmarker.on('mouseout', that.hideInfoWindow());
    this.update(deliveryInfo);
}

AllLocationMarker.prototype.showInfoWindow = function () {
    var content = this.createInfo();
    var infopopup = L.popup().setLatLng(L.latLng([this.deliveryInfo.latitude,this.deliveryInfo.longitude])).setContent(content);
    $("abbr.timeago").timeago();
};

AllLocationMarker.prototype.hideInfoWindow = function () {
    this.infopopup = null ;
};

AllLocationMarker.prototype.createInfo = function() {

    for(i=0;i<agents.length;i++){
        if (this.deviceId == agents[i]['imei'] || this.deviceId == agents[i]['imei2']){
            var agentName = agents[i]['name'];
            break;
        }
    }
    return "<table class=\"info\">" +
        "<tr><td><b>Agent Name </b></td><td>" + agentName + "</td></tr>" +
        "<tr><td><b>Time</b></td><td>" + this.deliveryInfo.time +
        " ( <abbr class='timeago' title=\""+this.deliveryInfo.time+"\">" + this.deliveryInfo.time + "</abbr> ) " + "</td></tr>" +
        "<tr><td><b>Position</b></td><td>" + position(this.deliveryInfo) + "</td></tr>" +
        "<tr><td><b>Altitude</b></td><td>" + this.deliveryInfo.altitude.toFixed(1) + "m</td></tr>" +
        "<tr><td><b>Network Signal</b></td><td>" + signal_strength(this.deliveryInfo.network_signal_strength) + "</td></tr>" +
        "</table>";
};

AllLocationMarker.prototype.update = function (devlieryInfo) {
    this.devlieryInfo = devlieryInfo;
    var position = new L.latLng(this.deliveryInfo.latitude, this.deliveryInfo.longitude);
    this.map.panTo(position);
};

AllLocationMarker.prototype.hide = function() {
    // this.gmarker = '' ;
    this.map.removeLayer(allLocmarkers);
};

function hide_markers(markers) {
    $(markers).map(function (idx, elem) {
        elem.hide();
    });
}

function LocationMarker(deviceId, map, locationInfo) {
    this.deviceId = deviceId;
    this.map = map;
    this.locationInfo = locationInfo;
    this.flightPath = null;
    var icon = L.icon({
        iconUrl: FE_IMG,
        iconSize: [28,46]
    });

    var gmarker = L.marker([this.locationInfo.latitude,this.locationInfo.longitude],{icon: icon}).addTo(map);
    locationmarkers.push(gmarker);

    var that3 = this;
    gmarker.on('click', function () {
        var selectedTime = String(dispValue) + ":00:00";
        selectedTime = (new Date()).getFullYear() +"-"+ ((new Date()).getMonth() + 1) +"-"+ (new Date()).getDate() +" "+ selectedTime ;
        console.info("selectedTime:", selectedTime);
        var that= that3;
        var that2 = this;
        var params = {"device_id": that.deviceId, "selected_time": selectedTime};
        function battery_status(level, charging) {
            return "" + level + "% " + (charging ? '<span style="color: green">Charging</span>' : '<span style="color: red">Not Charging</span>');
        }

        for(i=0;i<agents.length;i++){
            if (that.deviceId == agents[i]['imei'] || that.deviceId == agents[i]['imei2']){
                var agentName = agents[i]['name'];
                break;
            }
        }

        var tempInfo = "<table class=\"info\">" +
            "<tr><td><b>Agent Name </b></td><td>" + agentName + "</td></tr>" +
            "<tr><td><b>Device ID </b></td><td>" + that.deviceId + "</td></tr>" +
            "<tr><td><b>Last Update </b></td><td>" + that.locationInfo.time +
            " ( <abbr class='timeago' title=\""+that.locationInfo.time+"\">" + that.locationInfo.time + "</abbr> ) " + "</td></tr>" +
            "<tr><td><b>Position </b></td><td>" + position(that.locationInfo) + "</td></tr>" +
            "<tr><td><b>Altitude </b></td><td>" + that.locationInfo.altitude.toFixed(1) + "m</td></tr>" +
            "<tr><td><b>Battery </b></td><td>" + battery_status(that.locationInfo.battery_level, that.locationInfo.charging_status) + "</td></tr>" +
            "<tr><td><b>Network Signal </b></td><td>" + signal_strength(that.locationInfo.network_signal_strength) + "</td></tr>" +
            "<tr><td><b>Delivered </b></td><td>" + '<img src="static/images/loading.gif">'+"</td></tr>" +
            "<tr><td><b>OFD </b></td><td>" + '<img src="static/images/loading.gif">'+ "</td></tr>" +
            "<tr><td><b>Total Count </b></td><td>" + '<img src="static/images/loading.gif">'+ "</td></tr>" +
            "</table>";

        L.popup().setLatLng([that.locationInfo.latitude,that.locationInfo.longitude]).setContent("<b>"+tempInfo+"</b>").openOn(that.map);
        $.ajax({
            url:'/ekl-mapping/maps/delivery_count',
            type: "post",
            data:  JSON.stringify(params),
            dataType: 'json',
            contentType: "application/json",
            success: function(deliveryCountInfo){
                var OFDCount = deliveryCountInfo['Out_For_Delivery'];
                var DeliveredCount = deliveryCountInfo['Delivered'];
                var TotalCount = deliveryCountInfo['Total_Delivery_Count'];
                console.info('deliveryCountInfo: ', deliveryCountInfo);

                var info = "<table class=\"info\">" +
                    "<tr><td><b>Agent Name </b></td><td>" + agentName + "</td></tr>" +
                    "<tr><td><b>Device ID </b></td><td>" + that.deviceId + "</td></tr>" +
                    "<tr><td><b>Last Update </b></td><td>" + that.locationInfo.time +
                    " ( <abbr class='timeago' title=\""+that.locationInfo.time+"\">" + that.locationInfo.time + "</abbr> ) " + "</td></tr>" +
                    "<tr><td><b>Position </b></td><td>" + position(that.locationInfo) + "</td></tr>" +
                    "<tr><td><b>Altitude </b></td><td>" + that.locationInfo.altitude.toFixed(1) + "m</td></tr>" +
                    "<tr><td><b>Battery </b></td><td>" + battery_status(that.locationInfo.battery_level, that.locationInfo.charging_status) + "</td></tr>" +
                    "<tr><td><b>Network Signal </b></td><td>" + signal_strength(that.locationInfo.network_signal_strength) + "</td></tr>" +
                    "<tr><td><b>Delivered </b></td><td>" + DeliveredCount + "</td></tr>" +
                    "<tr><td><b>OFD </b></td><td>" + OFDCount + "</td></tr>" +
                    "<tr><td><b>Total Count </b></td><td>" + TotalCount + "</td></tr>" +
                    "</table>";
                L.popup().setLatLng([that.locationInfo.latitude,that.locationInfo.longitude]).setContent("<b>"+info+"</b>").openOn(that.map);
                //that2.bindPopup("<b>"+info+"</b>");

                //map.addLayer(gmarker);
                //gmarker.on('mouseout', function(){
                //    gmarker.closePopup();
                //});

            },
            error: function(){
                alert("No Delivery Count Info found for the deviceId");
            }
        });
        console.info("Device id : ", that.deviceId);
        $("abbr.timeago").timeago()
        if (g_flightPath === null) {
            that.showPath();
        } else {
            if (g_flightPath == this.flightPath) {
                that.hideAll();
            } else {
                clearMap(that.map);
                that.showPath();
            }
        }
    });


    //gmarker.addTo(map);
}

LocationMarker.prototype.hideAll = function () {

    clearMap(this.map);
    this.flightPath = null;
    g_flightPath = null;
    g_deliveryMarkers = null;
    g_allLocationMarkers = null;

};

LocationMarker.prototype.remove = function() {
    this.map.removeLayer();
};

LocationMarker.prototype.plotPath =function(locationInfo, deliveryInfo, granular, color, device_id) {
    var that = this ;
    console.info("Plotpath_deviceId: ", deliveryInfo['device_id']);
    console.info("Plotpath_deviceId2: ", device_id);
    var params = {"device_id": that.deviceId, "date": get_Date(),"selected_time": String(String(dispValue) + ":00:00"), "source": source, "type": type};
    $.ajax({
        url:'/ekl-mapping/maps/location-data',
        type: "post",
        data:  JSON.stringify(params),
        dataType: 'json',
        contentType: "application/json",
        success: function(data){
            var points = {};
            if (granular)
                if ('granular' in data){
                    points = data['granular'];
                }
                else{
                    points = data['raw'];
                }
            else
                points = data['raw'];
            var latlngs = points.map(function (r) {
                return L.latLng(r[1], r[0])
            });
            var flightPath = L.polyline(latlngs, {color: color});
            var decorator = L.polylineDecorator(flightPath, {
                patterns: [
                    // define a pattern of 10px-wide dashes, repeated every 20px on the line
                    {
                        offset: 40, repeat: '400px', symbol: new L.Symbol.arrowHead({pixelSize: 10,pathOptions: {fillOpacity:
                        0.75, color: 'blue',weight: 0}})}
                ]
            }).addTo(that.map);


            that.map.addLayer(flightPath);
            polylines.push(flightPath);
            arrowHeads.push(decorator);
            g_flightPath    = flightPath;
            this.flightPath = flightPath;
            var map = that.map;
            var deliveryMarkers = $(deliveryInfo[that.deviceId]).map(function (idx, elem) {
                if(elem['latitude'] != 0 && elem['longitude'] != 0){
                    return new DeliveryMarker(elem, map,this.locationInfo);
                }
                else{
                    console.info("Latitude: ",elem['latitude'],"Longitude :",elem['longitude'])
                }
            });

            this.deliveryMarkers = deliveryMarkers;
            g_deliveryMarkers = deliveryMarkers;

            var allLocationMarkers = $(locationInfo[this.deviceId]).map(function (idx, elem) {
                return new AllLocationMarker(elem, map,this.locationInfo);
            });

            this.allLocationMarkers = allLocationMarkers;
            g_allLocationMarkers = allLocationMarkers;
        },
        error: function(){
            alert("Snap to Road failed");
        }
    });
}
//
//LocationMarker.prototype.plotPath = function(locationInfo, deliveryInfo) {
//    var that = this ;
//    var polyLinePath = $(locationInfo).map(
//        function (idx, elem) {
//            return L.latLng(elem[0], elem[1]);
//        });
//
//    //console.info('polylinePath1', polyLinePath);
//    var flightPath = L.polyline(polyLinePath,{color: 'blue' , weight:1 , opacity: 1 , smoothFactor:1}).addTo(that.map);
//
//    var decorator = L.polylineDecorator(flightPath, {
//        patterns: [
//            // define a pattern of 10px-wide dashes, repeated every 20px on the line
//            {
//                offset: 25, repeat: '80px', symbol: new L.Symbol.arrowHead({pixelSize: 10,pathOptions: {fillOpacity:
//                0.75, color: 'blue',weight: 0}})}
//        ]
//    }).addTo(that.map);
//
//    polylines.push(flightPath);
//    arrowHeads.push(decorator);
//    that.map.addLayer(flightPath);
//    that.map.addLayer(decorator);
//
//    g_flightPath    = flightPath;
//    this.flightPath = flightPath;
//
//    var map = that.map;
//    var deliveryMarkers = $(deliveryInfo[this.deviceId]).map(function (idx, elem) {
//        if(elem['latitude'] != 0 && elem['longitude'] != 0){
//            return new DeliveryMarker(elem, map,this.locationInfo);
//        }
//        else{
//            console.info("Latitude: ",elem['latitude'],"Longitude :",elem['longitude'])
//        }
//    });
//
//    this.deliveryMarkers = deliveryMarkers;
//    g_deliveryMarkers = deliveryMarkers;
//
//    var allLocationMarkers = $(locationInfo[this.deviceId]).map(function (idx, elem) {
//        return new AllLocationMarker(elem, map,this.locationInfo);
//    });
//
//    this.allLocationMarkers = allLocationMarkers;
//    g_allLocationMarkers = allLocationMarkers;
//};


LocationMarker.prototype.showPath = function() {
    var that = this;
    instantiateUrls();

    var selectedTime = (new Date()).getFullYear() +"-"+ ((new Date()).getMonth() + 1) +"-"+ (new Date()).getDate() +" "+ String(dispValue) + ":00:00" ;
    var current_date = new Date();
    if(selectedTime > current_date){
        alert("The time you have selected is out of bounds");
    }
    else{
        var data = {"device_id": that.deviceId, "date": get_Date(),"selected_time": String(String(dispValue) + ":00:00"), "source": source, "type": type};
        $.ajax({
            url:PROCESSED_LOCATION_HISTORY_ENDPOINT,
            type: "post",
            data:  JSON.stringify(data),
            dataType: 'json',
            contentType: "application/json",
            success: function(locationInfo){
                console.info("locationInfo:", locationInfo);
                $.getJSON(DELIVERY_ENDPOINT + that.deviceId, {date: get_Date(), source: source, type: "DEL"}, function (deliveryInfo) {
                    deliveryInfo = transformDataForEventGeoTag(deliveryInfo);

                    that.plotPath(locationInfo, deliveryInfo, true , "red",that.deviceId);

                    // for get alerts
                    console.info("delivery_endpoint!");

                    $.getJSON(LOCATION_ENDPOINT + that.deviceId, {source: source, type: type}, function (data) {
                        if (data != null && data[that.deviceId] != null){
                            eventInfo = data[that.deviceId];
                        }

                        getAlerts(that.deviceId, eventInfo,deliveryInfo[that.deviceId]);
                    });

                });
            }
        })

    }

};

LocationMarker.prototype.createInfo = function() {
    var selectedTime = String(dispValue) + ":00:00";
    selectedTime = (new Date()).getFullYear() +"-"+ ((new Date()).getMonth() + 1) +"-"+ (new Date()).getDate() +" "+ selectedTime ;
    console.info("selectedTime:", selectedTime);
    var params = {"device_id": this.deviceId, "selected_time": selectedTime};
    var that = this;
    $.ajax({
        url:'/ekl-mapping/maps/delivery_count',
        type: "post",
        data:  JSON.stringify(params),
        dataType: 'json',
        contentType: "application/json",
        success: function(deliveryCountInfo){
            var OFDCount = deliveryCountInfo['Out_For_Delivery'];
            var DeliveredCount = deliveryCountInfo['Delivered'];
            var TotalCount = deliveryCountInfo['Total_Delivery_Count'];
            console.info('deliveryCountInfo: ', deliveryCountInfo);

            function battery_status(level, charging) {
                return "" + level + "% " + (charging ? '<span style="color: green">Charging</span>' : '<span style="color: red">Not Charging</span>');
            }

            for(i=0;i<agents.length;i++){
                if (that.deviceId == agents[i]['imei'] || that.deviceId == agents[i]['imei2']){
                    var agentName = agents[i]['name'];
                    break;
                }
            }
            return "<table class=\"info\">" +
                "<tr><td><b>Agent Name </b></td><td>" + agentName + "</td></tr>" +
                "<tr><td><b>Device ID </b></td><td>" + that.deviceId + "</td></tr>" +
                "<tr><td><b>Last Update </b></td><td>" + that.locationInfo.time +
                " ( <abbr class='timeago' title=\""+that.locationInfo.time+"\">" + that.locationInfo.time + "</abbr> ) " + "</td></tr>" +
                "<tr><td><b>Position </b></td><td>" + position(that.locationInfo) + "</td></tr>" +
                "<tr><td><b>Altitude </b></td><td>" + that.locationInfo.altitude.toFixed(1) + "m</td></tr>" +
                "<tr><td><b>Battery </b></td><td>" + battery_status(that.locationInfo.battery_level, that.locationInfo.charging_status) + "</td></tr>" +
                "<tr><td><b>Network Signal </b></td><td>" + signal_strength(that.locationInfo.network_signal_strength) + "</td></tr>" +
                "<tr><td><b>Delivered </b></td><td>" + DeliveredCount + "</td></tr>" +
                "<tr><td><b>OFD </b></td><td>" + OFDCount + "</td></tr>" +
                "<tr><td><b>Total Count </b></td><td>" + TotalCount + "</td></tr>" +
                "</table>";
        },
        error: function(){
            alert("No Delivery Count Info found for the deviceId");
        }
    });

};

LocationMarker.prototype.hideInfoWindow = function () {
    this.infopopup = null;
};

LocationMarker.prototype.update = function (locationInfo) {
    this.locationInfo = locationInfo;
    var position = new L.latLng(locationInfo.latitude, locationInfo.longitude);
    this.map.panTo(position);
};

function AddressTracker(map, deviceIds) {
    this.map = map;
    this.mapCenterSetFlag = false;
    this.deviceIds = deviceIds;
    this.markers = {};
}

AddressTracker.prototype.stop = function() {
    console.info("in stop()");
    if (delmarkers.length>0){
        clearMap(this.map);
    }

    for (var idx in locationmarkers) {
        console.info("removing Markers: " + this.markers[idx]);
        this.map.removeLayer(locationmarkers[idx]);

    }
};

AddressTracker.prototype.updateLocation = function(deviceId, locationInfo) {
    if (this.markers[deviceId] === undefined) {
        this.markers[deviceId] = new LocationMarker(deviceId, this.map, locationInfo);
    }

    var position = L.latLng(locationInfo.latitude, locationInfo.longitude,locationInfo.altitude);
    if(this.mapCenterSetFlag == true){
        this.map.panTo(position);
    }
    this.mapCenterSetFlag = false;
    var marker = this.markers[deviceId];
    marker.update(locationInfo);
};

AddressTracker.prototype.doTrack = function() {
    var that = this;
    instantiateUrls();
    $.getJSON(LOCATION_ENDPOINT + this.deviceIds.join(',') , {source: source, type: type}, function (data) {
        data = transformDataForLatestEvent(data)
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    that.updateLocation(key, data[key]);
                }
            }
        });


};

AddressTracker.prototype.start = function() {
    this.doTrack();
    console.info("Do Track Called");
};



function showPanel(show) {
    if (show) {
        $('.filter-panel').animate({width: '30%'}, 500);
        $('.maps-panel').animate({width: '69%'}, 500, function () {
            $('.filter-button').html('Filter &raquo;');
        });
    } else {
        $('.filter-panel').animate({width: '0%'}, 500);
        $('.maps-panel').animate({width: '99%'}, 500, function () {
            $('.filter-button').html('&laquo; Filter');
        });
    }
}

function clearMap(map) {

    //Removing all the markers according to the Array() in which they are pushed .
    map.removeLayer(g_flightPath);
    for (var idx in delmarkers) {
        console.info("removing deliveryMarkers: " + delmarkers[idx]);
        map.removeLayer(delmarkers[idx]);
    }
    for(var idx in arrowHeads){
        console.info("removing Arrowheads: " + arrowHeads[idx]);
        //   map.removeLayer(polylines[i]);
        map.removeLayer(arrowHeads[idx]);
    }
    for (var idx in allLocmarkers) {
        console.info("removing AllLocationMarkers: " + allLocmarkers[idx]);
        map.removeLayer(allLocmarkers[idx]);
    }
}

function clearShipmentMarkers(map){
    for(var idx in shipmentMarkers){
        console.info("removing shipmentMarkers: " + shipmentMarkers[idx]);
        console.info("removing shipmentGeoFenceArray: " + shipmentGeoFenceArray[idx]);
        //   map.removeLayer(polylines[i]);
        map.removeLayer(shipmentMarkers[idx]);
        map.removeLayer(shipmentGeoFenceArray[idx]);
    }
}

function getAlerts(deviceId, eventInfo , deliveryInfo){

    if(alert_request['hub_id'] == undefined){
        alert_request['hub_id'] = null;
    }
    if(eventInfo == undefined){
        eventInfo = null;
    }
    if(deliveryInfo == undefined){
        deliveryInfo = null;
    }
    //The hub_id in the alert_request is already pushed in the fetchAgents() method where the hubid is used .
    var params = {"hub_id": alert_request['hub_id'],"latestEventInfo": eventInfo , "deliveryInfo": deliveryInfo};
    console.info("in Alerts :", params);
    (function(deviceId){
        $.ajax({
            url:"/ekl-mapping/maps/alerts",
            type:"POST",
            data:JSON.stringify(params),
            datatype:"json",
            contentType:"application/json",
            success:function(response){
                for(i=0;i<agents.length;i++){
                    if (deviceId == agents[i]['imei'] || deviceId == agents[i]['imei2']){
                        var agentName = agents[i]['name'];
                        break;
                    }
                }
                data = JSON.parse(response);
                for(ctr=0;ctr<data['warn'].length;ctr++)
                {
                    $.notify( agentName.substring(0,10) + " " + data['warn'][ctr]+"","warn",{position:"right",showAnimation: 'slideDown', autoHideDelay: 5000000});
                }
                for(ctr=0;ctr<data['error'].length;ctr++)
                {
                    $.notify( agentName.substring(0,10) + " " + data['error'][ctr]+"","error",{position:"right",showAnimation: 'slideDown', autoHideDelay: 5000000});
                }
            }
        })
    })(deviceId);

}

function init() {
    var scale = (L.Browser.retina == true) ? 2 : 1;
    var ourlayer = L.tileLayer('https://maps.flipkart.com/{z}/{x}/{y}.png?scale={scale}', {
        maxZoom: 19,
        attribution: '<a href="http://www.flipkart.com/" target="_blank">&copy; Flipkart 2016</a>',
        scale: scale
    });
    //This was done to avoid the refreshing problem of the rendered map .
    var map = L.map('map-canvas',{center:[23.248987, 77.331696],zoom:4,layers:ourlayer});
    var geofenceCircle = L.circle(hub_latlng, 4000,{color:'green',fillOpacity:0.03});
    console.info(hub_latlng);
    geofenceCircle.addTo(map);
    showPanel(true);
    var tracker = null;

    function updateDeviceIds(deviceIds) {
        if (tracker !== null) {
            tracker.stop();
        }
        console.info('updating deviceIds', deviceIds);
        if (deviceIds.length === 0) {
            $.notify("No Devide Ids","warn");
            tracker = null;
        } else {

            tracker = new AddressTracker(map, deviceIds);
            tracker.mapCenterSetFlag = true;
            tracker.start();
        }
    }


    function getRandomColor(count) {
        return randomColor({luminosity: 'dark', count: count});
    }

    function evaluateShipmentIds(shipmentIds,map){
        clearShipmentMarkers(map);
        if (shipmentIds.length === 0){
            alert("No shipment Ids entered");
        }
        else{
            var data = {"shipment_id_list": shipmentIds};
            var max = shipmentIds.length;
            var colors    = getRandomColor(max);
            $.ajax({
                url:'/ekl-mapping/maps/shipment_location_track',
                type: "post",
                data:  JSON.stringify(data),
                dataType: 'json',
                contentType: "application/json",
                success: function(latlngInfo){
                    console.info('latlngInfo: ', latlngInfo);
                    for (var id in latlngInfo['latlng']){
                        console.info("latitude: ", latlngInfo['latlng'][id][0]);
                        var icon = L.MakiMarkers.icon({icon: "circle", color: colors[id], size: "m"});
                        var shipmentMarker = L.marker([latlngInfo['latlng'][id][0],latlngInfo['latlng'][id][1]], {icon: icon}).addTo(map);
                        var ShipmentGeoFence = L.circle([latlngInfo['latlng'][id][0],latlngInfo['latlng'][id][1]], 2500,{color:'blue',fillOpacity:0.03});
                        ShipmentGeoFence.addTo(map);
                        shipmentGeoFenceArray.push(ShipmentGeoFence);
                        shipmentMarkers.push(shipmentMarker);
                    }
                },
                error: function(){
                    alert("No Location found for the shipment Ids");
                }
            })
        }
    }

    var shown = true;
    $('.filter-button').click(function () {
        shown = !shown;
        showPanel(shown);
        $(this).blur();
    });

    var engine = new Bloodhound({
        name: 'hubs',
        prefetch: {
            url: '/static/hubs.json'
        },
        limit: 5,
        datumTokenizer: function(d) {
            return Bloodhound.tokenizers.whitespace(d.display_name);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace
    });

    engine.initialize();

    function fetchAgents(hubId) {

        //recentering the map to the hub location .
        map.panTo(new L.latLng(hub_latlng));

        $('.loading').show();
        console.info("Agents fetched");
        alert_request['hub_id'] = hubId  ;
        console.info("Hub id :", alert_request['hub_id']);
        $.getJSON("/ekl-mapping/maps/hub/" + hubId + "/agents" ).done(function (data) {
            console.info("Got the JSON !")
            console.info("data:", data);
            agents = data.filter(function (v) { return v.deviceId !== null; });

            var template = '<div class="checkbox"><label><input type="checkbox" value="{{imei}},{{imei2}}" checked>{{name}}</label></div>';
            var html = "";
            for (var i = 0; i < agents.length; ++i) {
                var output = Mustache.render(template, agents[i]);
                html += output;
            }
            $('.agent-results').html(html);
            $('.loading').hide();
        }).fail(function () {
            $('.loading').hide();
        });
    }

    $('.btn-apply').click(function () {

        var selected = $('input[type="checkbox"]:checked');
        console.info("in checkbox!"+ selected.length);
        var deviceIds = [];
        for (var i = 0; i < selected.length; ++i) {
            deviceIds = deviceIds.concat($(selected.get(i)).val().split(/,/).filter(function (x) {
                return x.length > 0;
            }));
        }
        console.info(deviceIds.length);
        updateDeviceIds(deviceIds);

        showPanel(false);
        shown = false;
    });

    fetchAgents(hub_id);

    $('#device_list').on('keydown', function (evt) {
        if (evt.keyCode == 13) {
            var deviceIds = $(this).val().trim();
            if (deviceIds.length === 0) {
                updateDeviceIds([]);
            } else {
                deviceIds = deviceIds.split(/,/).map(function(x) {
                    return x.trim();
                });
                updateDeviceIds(deviceIds);
                evaluateShipmentIds(shipmentIds);
            }
            showPanel(false);
            shown = false;
        }
    });

    $('#shipment_list').on('keydown', function (evt) {
        if (evt.keyCode == 13) {
            var shipmentIds = $(this).val().trim();
            if (shipmentIds.length === 0) {
                evaluateShipmentIds([]);
            } else {
                shipmentIds = shipmentIds.split(/,/).map(function(x) {
                    return x.trim();
                });
                evaluateShipmentIds(shipmentIds,map);
            }
            showPanel(false);
            shown = false;
        }
    });

    var hub1 = new HubMarker(hub_latlng, map);

}

/**
 * Creates a LatLon point on the earth's surface at the specified latitude / longitude.
 *
 * @classdesc Tools for geodetic calculations
 * @requires Geo
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 * @param {number} [height=0] - Height above mean-sea-level in kilometres.
 * @param {number} [radius=6371] - (Mean) radius of earth in kilometres.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 */
function LatLon(lat, lon, height, radius) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLon)) return new LatLon(lat, lon, height, radius);

    if (typeof height == 'undefined') height = 0;
    if (typeof radius == 'undefined') radius = 6371;
    radius = Math.min(Math.max(radius, 6353), 6384);

    this.lat    = Number(lat);
    this.lon    = Number(lon);
    this.height = Number(height);
    this.radius = Number(radius);
}

LatLon.prototype.toRadians = function(num){
    return num * Math.PI / 180;
}


L.DomEvent.addListener(window, 'load', init)