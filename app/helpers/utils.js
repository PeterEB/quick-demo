'use strict';

var _ = require('busyman');

var utils = {};

utils.getPermAddr = function (dev) {
    return dev.clientName;
};

utils.getDevsInfo = function (devs) {
    var devsInfo = {},
        devInfo;

    _.forEach(devs, function (dev) {
        devInfo = utils.getDevInfo(dev);
        devsInfo[devInfo.permAddr] = devInfo;
    });

    return devsInfo;
};

utils.getDevInfo = function (dev) {
    var devInfo = {};

    devInfo.permAddr = utils.getPermAddr(dev);
    devInfo.status = dev.status || 'offline';
    devInfo.gads = utils.getGadsInfo(dev.so);

    return devInfo;
};

utils.getGadsInfo = function (gads) {
    var gadsInfo = {},
        gadInfo;

    _.forEach(gads, function (obj, oid) {
        _.forEach(obj, function (iobj, iid) {
            _.forEach(iobj, function (resce, rid) {
                gadInfo = utils.getGadInfo(oid, iid, rid, resce);

                if (gadInfo)
                    gadsInfo[gadInfo.auxId] = gadInfo;
            });
        });
    });

    return gadsInfo;
};

utils.getGadInfo = function (oid, iid, rid, value) {
    var gadInfo = {};

    switch (oid) {
        case 'temperature':
            gadInfo.type = 'Temperature';
            break;
        case 'humidity':
            gadInfo.type = 'Humidity';
            break;
        case 'illuminance':
            gadInfo.type = 'Illuminance';
            break;
        case 'lightCtrl':
            gadInfo.type = 'Light';
            break;
        case 'presence':
            gadInfo.type = 'Pir';
            break;
        case 'buzzer':
            gadInfo.type = 'Buzzer';
            break;
        case 'onOffSwitch':
            gadInfo.type = 'Switch';
            break;
        case 'dIn':
            gadInfo.type = 'Flame';
            break;
        default:
            return undefined;
    }

    if (rid !== 'dInState' && rid !== 'sensorValue' && rid !== 'onOff' ) {
        return undefined;
    } else {
        gadInfo.auxId = oid + '/' + iid + '/' + rid;
        gadInfo.value = value;
        return gadInfo;
    }
};

utils.pathSlashParser = function (path) {   // '/x/y/z'
    var pathArray = path.split('/');      

    if (pathArray[0] === '') 
        pathArray = pathArray.slice(1);

    if (pathArray[pathArray.length-1] === '')           
        pathArray = pathArray.slice(0, pathArray.length-1);

    return pathArray;  // ['x', 'y', 'z']
};

module.exports = utils;
