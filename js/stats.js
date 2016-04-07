'use strict';

const fs = require('fs');
const os = require('os-usage');
const Ractive = require('ractive');
const Highcharts = require('highcharts');
const ipc = require('electron').ipcRenderer;

require('highcharts/modules/exporting')(Highcharts);

var ract, cpu_chart, cpu_monitor;

var templates = {
    cpu: fs.readFileSync(__dirname + '/templates/cpu.tmpl').toString(),
    mem: fs.readFileSync(__dirname + '/templates/mem.tmpl').toString()
};


function plotCpuChart(data) {
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
            data: data.sys
        }, {
            showInLegend: false,
            data: data.user
        }],
        credits: {
            enabled: false
        }
    };

    if (!cpu_chart) {
        Highcharts.chart('cpu_chart', option, function(chart) {
            console.log('chart created');
        });
    }
    else {
        // cpu_chart.series[0].setData(data.user, false);
        // cpu_chart.series[1].setData(data.sys, false);
    }
}

ipc.on('show', function() {
    if (!cpu_monitor)
        cpu_monitor = new os.CpuMonitor({delay: 1});

    var cpu_data = {
        chart_data: {
            user: [null, null, 1,2,3,4,5,6,7],
            sys: [null, null, 1,2,3,4,5,6,7]
        }
    };

    cpu_monitor.on('cpuUsage', function(data) {
        cpu_data.cpu = data;
        cpu_data.chart_data.user.push(parseFloat(data.user));
        cpu_data.chart_data.sys.push(parseFloat(data.sys));

        render(templates.cpu, cpu_data);

    });

    cpu_monitor.on('topCpuProcs', function(data) {
        cpu_data.procs = data;
        render(templates.cpu, cpu_data);
    });

});

ipc.on('after_hide', function() {
    if (cpu_monitor)
        cpu_monitor.emit('exit');

    cpu_monitor = null;
    cpu_chart = null;
});

function render(template, data) {
    if (ract)
        ract.set(data);

    ract = new Ractive({
        el: '#container',
        template: template,
        data: data
    });
        plotCpuChart(data.chart_data);
}

