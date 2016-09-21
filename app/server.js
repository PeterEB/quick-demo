var http = require('http'); 
var chalk = require('chalk');

var ioServer = require('./helpers/ioServer');
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
/* start shepherd                 */
/**********************************/
// start your shepherd

/**********************************/
/* register Req handler           */
/**********************************/
    ioServer.regReqHdlr('getDevs', function (args, cb) { 
        // register your req handler
        // cb(err, data);
        // example:
        cb(null, { 
            'AA:BB:CC:DD:FF': {
                permAddr: 'AA:BB:CC:DD:FF',
                status: 'online',
                gads: { 
                    'illu/0': {
                        type: 'Illuminance',
                        auxId: 'illu/0',
                        value: '108'
                    },
                    'buzzer/0': {
                        type: 'Buzzer',
                        auxId: 'buzzer/0',
                        value: true
                    },
                    'flame/0': {
                        type: 'Flame',
                        auxId: 'flame/0',
                        value: false
                    },
                    'pir/0': {
                        type: 'Pir',
                        auxId: 'pir/0',
                        value: true
                    }
                }
            }
        });
    });

    ioServer.regReqHdlr('permitJoin', function (args, cb) { 
        // register your req handler
        // cb(err, data);
        cb(null, null);
    });

    ioServer.regReqHdlr('write', function (args, cb) { 
        // register your req handler
        // cb(err, data);
        cb(null, false);
    });

/************************/
/* Event handle         */
/************************/
/*** ready            ***/
// readyInd();

/*** permitJoining    ***/
// permitJoiningInd(timeLeft);

/*** error            ***/
// errorInd(msg);

/*** devIncoming      ***/
// devIncomingInd(permAddr);

/*** devStatus        ***/
// devStatusInd(permAddr, status);

/*** attrsChange      ***/
// attrsChangeInd(permAddr, data);

/************************/
/* fake Indication      */
/************************/
    setInterval(function () {
        devIncomingInd({
            permAddr: 'AA:BB:CC:DD:EE',
            status: 'online',
            gads: { 
                'temp/0': {
                    type: 'Temperature',
                    auxId: 'temp/0',
                    value: '19'
                },
                'hum/0': {
                    type: 'Humidity',
                    auxId: 'hum/0',
                    value: '56'
                },
                'light/0': {
                    type: 'Light',
                    auxId: 'light/0',
                    value: true
                },
                'switch/0': {
                    type: 'Switch',
                    auxId: 'switch/0',
                    value: true
                } 
            }
        });
    }, 5000);

    setInterval(function () {
        attrsChangeInd('AA:BB:CC:DD:EE', {
            type: 'Temperature',
            auxId: 'temp/0',
            value: '22'
        });
    }, 7000);

    setInterval(function () {
        toastInd('Test');
    }, 8000);

    setInterval(function () {
        devStatusInd('AA:BB:CC:DD:EE', 'offline');
    }, 15000);

};


/**********************************/
/* welcome function               */
/**********************************/
function showWelcomeMsg() {
var coapPart1 = chalk.blue('     _____ ____   ___    ___          ____ __ __ ____ ___   __ __ ____ ___   ___ '),
    coapPart2 = chalk.blue('    / ___// __ \\ / _ |  / _ \\  ____  / __// // // __// _ \\ / // // __// _ \\ / _ \\'),
    coapPart3 = chalk.blue('   / /__ / /_/ // __ | / ___/ /___/ _\\ \\ / _  // _/ / ___// _  // _/ / , _// // /'),
    coapPart4 = chalk.blue('   \\___/ \\____//_/ |_|/_/          /___//_//_//___//_/   /_//_//___//_/|_|/____/ ');

    console.log('');
    console.log('');
    console.log('Welcome to coap-shepherd webapp... ');
    console.log('');
    console.log(coapPart1);
    console.log(coapPart2);
    console.log(coapPart3);
    console.log(coapPart4);
    console.log(chalk.gray('         A network server and manager for the CoAP machine network'));
    console.log('');
    console.log('   >>> Author:     Peter Yi (peter.eb9@gmail.com)');
    console.log('   >>> Version:    coap-shepherd v0.1.5');
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
