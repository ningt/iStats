'use strict';

const fs = require('fs');
const os = require('os-usage');
const Ractive = require('ractive');
const Highcharts = require('highcharts');
const ipc = require('electron').ipcRenderer;

require('highcharts/modules/exporting')(Highcharts);

var ract, cpu_chart, cpu_monitor, mem_monitor;

var templates = {
    cpu: fs.readFileSync(__dirname + '/templates/cpu.tmpl').toString(),
    mem: fs.readFileSync(__dirname + '/templates/mem.tmpl').toString()
};

function plotChart(id, data) {
    var option = {
        chart: {
            type: 'area'
        },
        title: {
            text: ''
        },
        exporting: { enabled: false },
        xAxis: {
            labels: {
                formatter: function () {
                    return this.value;
                }
            }
        },
        yAxis: {
            title: {
                text: ''
            },
            labels: {
                formatter: function () {
                    return this.value;
                }
            }
        },
        tooltip: {
            enabled: false
        },
        plotOptions: {
            series: {
                animation: false
            },
            area: {
                pointStart: 0,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        series: [{
            showInLegend: false,
            data: data[0]
        }, {
            showInLegend: false,
            data: data[1]
        }],
        credits: {
            enabled: false
        }
    };

    Highcharts.chart(id, option, function(chart) {
    });
}

function showCpuStats() {
    var cpu_data = {
        chart_data: [[], []]
    };

    if (!cpu_monitor)
        cpu_monitor = new os.CpuMonitor({delay: 1});

    cpu_monitor.on('cpuUsage', function(data) {
        cpu_data.cpu = data;
        cpu_data.chart_data[0].push(parseFloat(data.user));
        cpu_data.chart_data[1].push(parseFloat(data.sys));

        render('cpu_chart', templates.cpu, cpu_data);
    });

    cpu_monitor.on('topCpuProcs', function(data) {
        cpu_data.procs = data;
        render('cpu_chart', templates.cpu, cpu_data);
    });
}

function showMemStats() {
    var mem_data = {
        chart_data: [[], []]
    };

    if (!mem_monitor)
        mem_monitor = new os.MemMonitor({delay: 1});

    mem_monitor.on('memUsage', function(data) {
        mem_data.mem = data;
        mem_data.chart_data[0].push(parseFloat(data.wired_kb / 1024));
        mem_data.chart_data[1].push(parseFloat(data.used_kb / 1024));

        render('mem_chart', templates.mem, mem_data);
    });

    mem_monitor.on('topMemProcs', function(data) {
        mem_data.procs = data;
        render('mem_chart', templates.mem, mem_data);
    });

}

var currentDisplay = 'cpu';
showCpuStats();

ipc.on('show', function() {
    if (currentDisplay === 'cpu')
        showCpuStats();
    else if (currentDisplay === 'mem')
        showMemStats();
});

ipc.on('after_hide', function() {
    if (cpu_monitor)
        cpu_monitor.emit('exit');

    if (mem_monitor)
        mem_monitor.emit('exit');

    cpu_monitor = null;
    mem_monitor = null;
    cpu_chart = null;
});

function switchDisplay(display) {
    currentDisplay = display;

    if (currentDisplay === 'cpu') {
        showCpuStats();
        mem_monitor.emit('exit');
        mem_monitor = null;
    }
    else if (currentDisplay === 'mem') {
        showMemStats();
        cpu_monitor.emit('exit');
        cpu_monitor = null;
    }
}

function quit() {
    ipc.send('quit');
}

function render(id, template, data) {
    if (ract)
        ract.set(data);

    ract = new Ractive({
        el: '#container',
        template: template,
        data: data
    });

    plotChart(id, data.chart_data);
}

