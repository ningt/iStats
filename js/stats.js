'use strict';

const os = require('os');
const utils = require('os-utils');
const Ractive = require('ractive');
const ipc = require('electron').ipcRenderer;

var ract, timer;

// initialize
render(getStats());
timer = getTimer();

ipc.on('show', function() {
    render(getStats());

    if (!timer)
        timer = getTimer();
});

ipc.on('after_hide', function() {
    clearInterval(timer);
    timer = null;
});

function getStats() {
    var stats = {
        arch: os.arch(),
        cpu_model: os.cpus()[0].model,
        total_mem: os.totalmem() / Math.pow(1024, 3) + ' GB',
        free_mem:  (os.freemem() / Math.pow(1024, 3)).toFixed(2) + ' GB',
    };

    return stats;
}

function getTimer() {
    return setInterval(function() {
                render(getStats());
                updateCPUUsage();
                updateMemUsage();
            }, 1000);
}

function render(data) {
    if (ract)
        ract.set(data);

    ract = new Ractive({
        el: '#container',
        template: '#template',
        data: data
    });
}

var default_config = liquidFillGaugeDefaultSettings();
default_config.waveHeight = 0.05;
default_config.waveCount = 3;
default_config.waveAnimateTime = 1000;

var blue_config = Object.assign({}, default_config);

var orange_config = Object.assign({}, default_config);
orange_config.circleColor = "#fbc02d";
orange_config.textColor = "#553300";
orange_config.waveTextColor = "#805615";
orange_config.waveColor = "#fbc02d";

var red_config = Object.assign({}, default_config);
red_config.circleColor = "#FF7777";
red_config.textColor = "#FF4444";
red_config.waveTextColor = "#FFAAAA";
red_config.waveColor = "#FFDDDD";

var cpu_gauge, prev_cpu_usage = 0;
var mem_gauge, prev_mem_usage = 0;

function updateCPUUsage() {
    utils.cpuUsage(function(v) {
        cpu_gauge = updateGaugeColor("cpu-usage", cpu_gauge, v, prev_cpu_usage);
        cpu_gauge.update(v * 100);
        prev_cpu_usage = v;
    });
}

function updateMemUsage() {
    var mem_usage = 1.0 - (os.freemem() / os.totalmem());

    mem_gauge = updateGaugeColor("mem-usage", mem_gauge, mem_usage, prev_mem_usage);
    mem_gauge.update(mem_usage * 100);
    prev_mem_usage = mem_usage;
}

function updateGaugeColor(id, gauge, curr, prev) {
    var config, prev_config;

    if (curr < 0.7)
        config = blue_config;
    else if (curr < 0.9)
        config = orange_config;
    else
        config = red_config;

    if (!gauge)
        return loadLiquidFillGauge(id, curr * 100, config);

    if (prev < 0.7)
        prev_config = blue_config;
    else if (prev < 0.9)
        prev_config = orange_config;
    else
        prev_config = red_config;

    if (prev_config !== config) {
        document.getElementById(id).innerHTML = '';
        return loadLiquidFillGauge(id, curr * 100, config);
    }

    return gauge;
}

