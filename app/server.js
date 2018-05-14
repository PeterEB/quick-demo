var fs = require('fs'),
    http = require('http'),
    path = require('path');

var _ = require('busyman'),
    chalk = require('chalk'),
    cserver = require('coap-shepherd');

var demoApp = require('./demoApp'),
    utils = require('./helpers/utils'),
    ioServer = require('./helpers/ioServer');

var server = http.createServer();

server.listen(3030);

ioServer.start(server);

var app = function () {
/**********************************/
/* show Welcome Msg               */
/**********************************/
    showWelcomeMsg();

/**********************************/
/* set Leave Msg                  */
/**********************************/
    setLeaveMsg();

/**********************************/
/* register Req handler           */
/**********************************/
    ioServer.regReqHdlr('getDevs', function (args, cb) { 
        var devs = [];

        _.forEach(cserver.list(), function (dev) {
            devs.push(cserver.find(dev.clientName));
        });

        cb(null, utils.getDevsInfo(devs));
    });

    ioServer.regReqHdlr('permitJoin', function (args, cb) { 
        cserver.permitJoin(args.time);

        cb(null);
    });

    ioServer.regReqHdlr('write', function (args, cb) { 
        cserver.find(args.permAddr).writeReq(args.auxId, args.value, function (err, rsp) {
            if (err)
                cb(err); 
            else
                cb(null); 
        });
    });

/************************/
/* Event handle         */
/************************/
/*** ready            ***/
    cserver.on('ready', function () {
        readyInd();
    });

/*** permitJoining    ***/
    cserver.on('permitJoining', function (joinTimeLeft) {
        permitJoiningInd(joinTimeLeft);

        if (joinTimeLeft == 60) {
            demoApp(toastInd);
        }
    });

/*** error            ***/
    cserver.on('error', function (err) {
        errorInd(err);
    });

    cserver.on('ind', function (msg) {
        var cnode = msg.cnode;

        switch (msg.type) {
/*** devIncoming      ***/
            case 'devIncoming':
                if (cnode.clientName === 'cnode1') {
                    cnode.observeReq('temperature/0/sensorValue');
                    cnode.observeReq('presence/0/dInState');
                    cnode.observeReq('lightCtrl/0/onOff');
                } else if (cnode.clientName === 'cnode2') {
                    cnode.observeReq('illuminance/0/sensorValue');
                    cnode.observeReq('onOffSwitch/0/dInState');
                } else if (cnode.clientName === 'cnode3') {
                    cnode.observeReq('humidity/0/sensorValue');
                    cnode.observeReq('buzzer/0/onOff');
                    cnode.observeReq('dIn/0/dInState');
                }

                devIncomingInd(utils.getDevInfo(cnode));
                break;

/*** devStatus        ***/
            case 'devStatus':
                devStatusInd(utils.getPermAddr(cnode), msg.data);
                break;

/*** devNotify        ***/
            case 'devNotify':
                var pathArray = utils.pathSlashParser(msg.data.path),
                    gad = utils.getGadInfo(pathArray[0], pathArray[1], pathArray[2], msg.data.value);

                if (gad) {
                    attrsChangeInd(utils.getPermAddr(cnode), gad);

                    switch (gad.type) {
                        case 'Switch':
                            if (gad.value === true) {
                                cserver.find('cnode1').writeReq('lightCtrl/0/onOff', true);
                            } else if (gad.value === false) {
                                cserver.find('cnode1').writeReq('lightCtrl/0/onOff', false);
                            }
                            break;
                        case 'Illuminance':
                            if (gad.value < 50) {
                                cserver.find('cnode1').writeReq('lightCtrl/0/onOff', true);
                            } else if (gad.value >= 50) {
                                cserver.find('cnode1').writeReq('lightCtrl/0/onOff', false);
                            }
                            break;
                        case 'Pir':
                            if (gad.value === true) {
                                cserver.find('cnode1').writeReq('lightCtrl/0/onOff', true);
                            } else if (gad.value === false) {
                                cserver.find('cnode1').writeReq('lightCtrl/0/onOff', false);
                            }
                            break;
                        case 'Flame':
                            if (gad.value === true) {
                                cserver.find('cnode3').writeReq('buzzer/0/onOff', true);
                            } else if (gad.value === false) {
                                cserver.find('cnode3').writeReq('buzzer/0/onOff', false);
                            }
                            break;
                        default:
                            break;
                    }
                }
                break;
            default:
                break;
        }
    });

/**********************************/
/* start shepherd                 */
/**********************************/
// start your shepherd
    var dbPath = path.resolve(__dirname, '../node_modules/coap-shepherd/lib/database/coap.db');
    fs.exists(dbPath, function (isThere) {
        if (isThere)
            fs.unlink(dbPath, function(err) {
                if (err) throw err;
            });
    });

    cserver.start();
};


/**********************************/
/* welcome function               */
/**********************************/
function showWelcomeMsg() {
var coapPart1 = chalk.blue('   _____ ____   ___    ___          ____ __ __ ____ ___   __ __ ____ ___   ___ '),
    coapPart2 = chalk.blue('  / ___// __ \\ / _ |  / _ \\  ____  / __// // // __// _ \\ / // // __// _ \\ / _ \\'),
    coapPart3 = chalk.blue(' / /__ / /_/ // __ | / ___/ /___/ _\\ \\ / _  // _/ / ___// _  // _/ / , _// // /'),
    coapPart4 = chalk.blue(' \\___/ \\____//_/ |_|/_/          /___//_//_//___//_/   /_//_//___//_/|_|/____/ ');

    console.log('');
    console.log('');
    console.log('Welcome to coap-shepherd webapp... ');
    console.log('');
    console.log(coapPart1);
    console.log(coapPart2);
    console.log(coapPart3);
    console.log(coapPart4);
    console.log(chalk.gray('            An implementation of CoAP device management Server.'));
    console.log('');
    console.log('   >>> Author:     Peter Yi (peter.eb9@gmail.com)');
    console.log('   >>> Version:    coap-shepherd v1.0.0');
    console.log('   >>> Document:   https://github.com/PeterEB/coap-shepherd');
    console.log('   >>> Copyright (c) 2016 Peter Yi, The MIT License (MIT)');
    console.log('');
    console.log('The server is up and running, press Ctrl+C to stop server.');
    console.log('');
    console.log('---------------------------------------------------------------');
}

/**********************************/
/* goodBye function               */
/**********************************/
function setLeaveMsg() {
    process.stdin.resume();

    function showLeaveMessage() {
        console.log(' ');
        console.log(chalk.blue('      _____              __      __                  '));
        console.log(chalk.blue('     / ___/ __  ___  ___/ /____ / /  __ __ ___       '));
        console.log(chalk.blue('    / (_ // _ \\/ _ \\/ _  //___// _ \\/ // // -_)   '));
        console.log(chalk.blue('    \\___/ \\___/\\___/\\_,_/     /_.__/\\_, / \\__/ '));
        console.log(chalk.blue('                                   /___/             '));
        console.log(' ');
        console.log('    >>> This is a simple demonstration of how the shepherd works.');
        console.log('    >>> Please visit the link to know more about this project:   ');
        console.log('    >>>   ' + chalk.yellow('https://github.com/PeterEB/coap-shepherd'));
        console.log(' ');
        process.exit();
    }

    process.on('SIGINT', showLeaveMessage);
}

/**********************************/
/* Indication funciton            */
/**********************************/
function readyInd () {
    ioServer.sendInd('ready', {});
    console.log(chalk.green('[         ready ] '));
}

function permitJoiningInd (timeLeft) {
    ioServer.sendInd('permitJoining', { timeLeft: timeLeft });
    console.log(chalk.green('[ permitJoining ] ') + timeLeft + ' sec');
}

function errorInd (msg) {
    ioServer.sendInd('error', { msg: msg });
    console.log(chalk.red('[         error ] ') + msg);
    throw msg;
}

function devIncomingInd (dev) {
     ioServer.sendInd('devIncoming', { dev: dev });
    console.log(chalk.yellow('[   devIncoming ] ') + '@' + dev.permAddr);
}

function devStatusInd (permAddr, status) {
    ioServer.sendInd('devStatus', { permAddr: permAddr, status: status });

    if (status === 'online')
        status = chalk.green(status);
    else 
        status = chalk.red(status);

    console.log(chalk.magenta('[     devStatus ] ') + '@' + permAddr + ', ' + status);
}

function attrsChangeInd (permAddr, gad) {
    ioServer.sendInd('attrsChange', { permAddr: permAddr, gad: gad });
    console.log(chalk.blue('[   attrsChange ] ') + '@' + permAddr + ', auxId: ' + gad.auxId + ', value: ' + gad.value);
}

function toastInd (msg) {
    ioServer.sendInd('toast', { msg: msg });

}

module.exports = app;
