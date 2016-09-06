var data = {
    'shipments': [{
        'status': 'Expected',
        'hubId': 278,
        "facility_type": "motherhub",
        'updatedAt': "2016-08-29 20:24:20"
    }, {
        'status': 'InScan_Success',
        'hubId': 278,
        "facility_type": "motherhub",
        'updatedAt': '2016-08-29 20:24:20'
    }, {
        'status': 'Received',
        'hubId': 278,
        "facility_type": "motherhub",
        'updatedAt': '2016-08-29 20:27:56'
    }, {
        'status': 'Undelivered_Not_Attended',
        'hubId': 278,
        "facility_type": "motherhub",
        'updatedAt': '2016-08-29 22:27:56'
    }, {
        'status': 'Expected',
        'hubId': 278,
        "facility_type": "motherhub",
        'updatedAt': '2016-08-30 04:00:41'
    }, {
        'status': 'Expected',
        'hubId': 278,
        "facility_type": "motherhub",
        'updatedAt': '2016-08-30 04:00:41'
    }, {
        'status': 'Recieved',
        'hubId': 119,
        "facility_type": "motherhub",
        'updatedAt': '2016-08-30 18:52:54'
    }, {
        'status': 'Undelivered_Not_Attended',
        'hubId': 119,
        "facility_type": "motherhub",
        'updatedAt': '2016-08-30 18:52:54'
    }, {
        'status': 'Expected',
        'hubId': 119,
        "facility_type": "motherhub",
        'updatedAt': '2016-08-31 01:41:04'
    }, {
        'status': 'Received',
        'hubId': 2270,
        "facility_type": "DELIVERY_HUB",
        'updatedAt': '2016-08-31 05:23:24'
    }, {
        'status': 'Undelivered_Incomplete_Address',
        'hubId': 2270,
        "facility_type": "DELIVERY_HUB",
        'updatedAt': '2016-08-31 10:47:15'
    }, {
        'status': 'Undelivered_Incomplete_Address',
        'hubId': 2270,
        "facility_type": "DELIVERY_HUB",
        'updatedAt': '2016-09-01 16:29:27'
    }, {
        'status': 'Undelivered_Incomplete_Address',
        'hubId': 2270,
        "facility_type": "DELIVERY_HUB",
        'updatedAt': '2016-09-01 16:29:41'
    }, {
        'status': 'Undelivered_Incomplete_Address',
        'hubId': 2270,
        "facility_type": "DELIVERY_HUB",
        'updatedAt': '2016-09-03 11:10:13'
    }],

    'bags': [{
        'bagid': "22046017",
        "hubid": 278,
        "facility_type": "motherhub",
        'updatedAt': "2016-08-29 20:46:37",
        'status': 'OPEN'
    }, {
        'bagid': 22046017,
        "hubid": 278,
        "facility_type": "motherhub",
        'updatedAt': "2016-08-29 20:46:40",
        'status': 'CLOSED'
    }, {
        'bagid': 22046017,
        "hubid": 278,
        "facility_type": "motherhub",
        'updatedAt': "2016-08-30 04:00:01",
        'status': 'INTRANSIT'
    }, {
        'bagid': 22046017,
        "hubid": 119,
        "facility_type": "motherhub",
        'updatedAt': "2016-08-30 13:30:02",
        'status': 'REACHED'
    }, {
        'bagid': 22046017,
        "hubid": 119,
        "facility_type": "motherhub",
        'updatedAt': "2016-08-30 18:52:37",
        'status': 'RECEIVED'
    }, {
        'bagid': 22087601,
        "hubid": 119,
        'updatedAt': "2016-08-31 00:17:30",
        'status': 'OPEN'
    }, {
        'bagid': 22087601,
        "hubid": 119,
        "facility_type": "motherhub",
        'updatedAt': "2016-08-31 00:17:33",
        'status': 'CLOSED'
    }, {
        'bagid': 22087601,
        "hubid": 119,
        "facility_type": "motherhub",
        'updatedAt': "2016-08-31 01:41:00",

        'status': 'INTRANSIT'
    }, {
        'bagid': 22087601,
        "hubid": 2270,
        "facility_type": "DELIVERY_HUB",
        'updatedAt': "2016-08-31 05:18:38",
        'status': 'REACHED'
    }, {
        'bagid': 22087601,
        "hubid": 2270,
        "facility_type": "DELIVERY_HUB",
        'updatedAt': "2016-08-31 05:22:03",
        'status': 'RECEIVED'
    }],


    'consignments': [{
        "consignmentid": 20173310,
        'updatedAt': "2016-08-30 03:59:39",
        "hubid": 278,
        'status': 'Created'
    }, {
        "consignmentid": 20173310,
        'updatedAt': "2016-08-30 03:59:58",
        "hubid": 119,
        'status': 'Expected'
    }, {
        "consignmentid": 20173310,
        'updatedAt': "2016-08-30 13:12:16",
        "hubid": 119,
        'status': 'Received'
    }, {
        "consignmentid": 20177020,
        'updatedAt': "2016-08-31 01:40:54",
        "hubid": 119,
        'status': 'Created'
    }, {
        "consignmentid": 20177020,
        'updatedAt': "2016-08-31 01:40:57",
        "hubid": 2270,
        'status': 'Expected'
    }, {
        "consignmentid": 20177020,
        'updatedAt': "2016-08-31 05:16:56",
        "hubid": 2270,
        'status': 'Received'
    }],
    'sfc': {
        'shipment': {
            'id':'FMPC0149499495',
            'status': 'Undelivered_Incomplete_Address',
            'hubId': 2270,
            "facility_type": "DELIVERY_HUB",
            'updatedAt': '2016-09-03 11:10:13'
        },
        'bag': {
            'id': 22087601,
            "hubid": 2270,
            "facility_type": "DELIVERY_HUB",
            'updatedAt': "2016-08-31 05:22:03",
            'status': 'RECEIVED'
        },
        'consignment': {
            "id": 20177020,
            'updatedAt': "2016-08-31 05:16:56",
            "hubid": 2270,
            'status': 'Received'
        }
    },

};