'use strict';

const path = require('path')
const menubar = require('menubar');

var opts = {
    dir: __dirname,
    icon: path.join(__dirname, 'images', 'Icon.png'),
    tooltip: 'Quick Stats',
    height: 330
};

var mb = menubar(opts);

mb.on('ready', function ready () {
    console.log('app is ready');

    mb.on('show', function show () {
        mb.window.webContents.send("show");
    });

    mb.on('after-hide', function show () {
        mb.window.webContents.send("after_hide");
    });
});

mb.on('after-create-window', function() {
//    mb.window.openDevTools();
    mb.window.setResizable(false);
});

