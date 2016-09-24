'use strict';

var _ = require('busyman'), 
    cserver = require('coap-shepherd'),
    CoapNode = require('coap-node'),
    SmartObject = require('smartobject');

var so1 = new SmartObject(),
    so2 = new SmartObject(),
    so3 = new SmartObject();

var value = {
    temp: function () {
        return ((Math.random() * (35 - 20 + 1) ) + 20).toFixed(1);
    },
    humi: function () {
        return ((Math.random() * (70 - 50 + 1) ) + 50).toFixed(1);
    },
    illu: 87,
    pir: 0,
    onOff: 0,
    flame: 0,
    lightCtrl: 0,
    buzzerCtrl: 0,
};

/************************/
/* so1 init             */
/************************/
so1.init('temperature', 0, {
    sensorValue: {
        read: function (cb) {
            cb(null, value.temp());
        }
    }
});

so1.init('lightCtrl', 0, {
    onOff: {
        read: function (cb) {
            cb(null, value.lightCtrl);
        },
        write: function (val, cb) {
            value.lightCtrl = val;
            cb(null, val);
        }
    }
});

so1.init('dIn', 0, {
    dInState: {
        read: function (cb) {
            cb(null, value.flame);
        }
    }
});

/************************/
/* so2 init             */
/************************/
so2.init('humidity', 0, {
    sensorValue: {
        read: function (cb) {
            cb(null, value.humi());
        }
    }
});

so2.init('presence', 0, {
    dInState: {
        read: function (cb) {
            cb(null, value.pir);
        }
    }
});

/************************/
/* so3 init             */
/************************/
so3.init('illuminance', 0, {
    sensorValue: {
        read: function (cb) {
            cb(null, value.illu);
        }
    }
});

so3.init('buzzer', 0, {
    onOff: {
        read: function (cb) {
            cb(null, value.buzzerCtrl);
        },
        write: function (val, cb) {
            value.buzzerCtrl = val;
            cb(null, val);
        }
    }
});

so3.init('onOffSwitch', 0, {
    dInState: {
        read: function (cb) {
            cb(null, value.onOff);
        }
    }
});

/************************/
/* cnode init           */
/************************/
var cnode1 = new CoapNode('cnode1', so1),
    cnode2 = new CoapNode('cnode2', so2),
    cnode3 = new CoapNode('cnode3', so3);

var remoteCnode1,
    remoteCnode2,
    remoteCnode3;

function demoApp (toastInd) {
    setTimeout(function () {
        toastInd('Device node1 will join the network');

        setTimeout(function () {
            cnode1.register('127.0.0.1', 5683, function (err, rsp) {
                if (err) console.log(err);

                setInterval(function () {
                    cnode1.so.read('temperature', 0, 'sensorValue', undefined, function () {});
                    cnode1.so.read('dIn', 0, 'dInState', undefined, function () {});
                }, 1000);
            });
        }, 2000);
    }, 100);

    setTimeout(function () {
        toastInd('Device node2 will join the network');

        setTimeout(function () {
            cnode2.register('127.0.0.1', 5683, function (err, rsp) {
                if (err) console.log(err);

                setInterval(function () {
                    cnode2.so.read('humidity', 0, 'sensorValue', undefined, function () {});
                    cnode2.so.read('presence', 0, 'dInState', undefined, function () {});
                }, 1000);
            });
        }, 2000);
    }, 3500);

    setTimeout(function () {
        toastInd('Device node3 will join the network');

        setTimeout(function () {
            cnode3.register('127.0.0.1', 5683, function (err, rsp) {
                if (err) console.log(err);

                setInterval(function () {
                    cnode3.so.read('illuminance', 0, 'sensorValue', undefined, function () {});
                    cnode3.so.read('onOffSwitch', 0, 'dInState', undefined, function () {});
                }, 1000);
            });
        }, 2000);
    }, 7000);

    setTimeout(function () {
        toastInd('You can click on a lamp or a buzzer');
    }, 11000);

    setTimeout(function () {
        toastInd('User will turn on the light switch');
        setTimeout(function () {
            value.onOff = 1;
        }, 2000);

        setTimeout(function () {
            toastInd('User will turn off the light switch');
        }, 6000);

        setTimeout(function () {
            value.onOff = 0;
        }, 9000);
    }, 17000);

    setTimeout(function () {
        toastInd('Illumination is less than 50 lux, light would be turned on');
        setTimeout(function () {
            value.illu = 32;
        }, 2000);

        setTimeout(function () {
            toastInd('Illumination is greater than 50 lux, light would be turned off');
        }, 6000);

        setTimeout(function () {
            value.illu = 108;
        }, 9000);
    }, 29000);

    setTimeout(function () {
        toastInd('PIR sensed someone walking around, light would be turned on');
        setTimeout(function () {
            value.pir = 1;
        }, 2000);

        setTimeout(function () {
            value.pir = 0;
        }, 9000);
    }, 41000);

    setTimeout(function () {
        toastInd('Flame sensor detect the presence of a flame or fire, buzzer would be turned on');
        setTimeout(function () {
            value.flame = 1;
        }, 2000);

        setTimeout(function () {
            value.flame = 0;
        }, 9000);
    }, 53000);

}

module.exports = demoApp;
