/**
 * Created by Maplor on 16/8/22.
 */
'use strict';

const utils = require('./utils');

function createLine(group, x1, y1, x2, y2, color) {
    var line = group.append('line');

    line.attr('x1', x1);
    line.attr('y1', y1);
    line.attr('x2', x2);
    line.attr('y2', y2);

    if (color) {
        line.attr('stroke', color);
    }
    return line;
}

const defaultConfig = {
    width: 800,
    height: 600,
    linesBlank: 5,
    isPathToLine: false
};

class Connection {
    constructor (selector, config) {
        this.config = utils.merge({}, defaultConfig, config);

        this.svg = d3.select(selector).append('svg')
            .classed('connection', true)
            .style({
                'width': this.config.width + 'px',
                'height': this.config.height + 'px'
            });

        this._fromArray = [];
        this._toArray = [];
        this._centerPosition = 0;

        this._points = [];
    }

    draw (data) {
        if (this.config.isPathToLine) {
            data.forEach((line) => {
                this._fromArray.push({
                    name: line.from,
                    to: line.to,
                    points: line.points,
                    lines: [],
                    path: {}
                })
            });
        } else {
            data.from.forEach((from) => {
                this._fromArray.push({
                    name: from.name,
                    position: from.position,
                    lines: [],
                    path: {}
                });
            });
            data.to.forEach((to) => {
                this._toArray.push({
                    name: to.name,
                    position: to.position,
                    linesIndex: 0
                });
            });
            this._centerPosition = data.center;
        }

        this.render();
    }

    render () {
        var {
            linesBlank,
            isPathToLine
        } = this.config;

        this._fromArray.forEach((fApp, fIndex) => {
            var fromLinesGroup = this.svg.append('g').classed(`from-lines-${fIndex}`, true);

            if (isPathToLine) {
                //直接根据points数组生成lines和path
                fApp.path[fApp.to] = [];
                fApp.points.forEach((point, pointIndex, arr) => {
                    if (pointIndex !== arr.length - 1) {
                        fApp.path[fApp.to].push(pointIndex);
                        fApp.lines.push(createLine(fromLinesGroup, point[0], point[1], arr[pointIndex+1][0], arr[pointIndex+1][1]));
                    }
                });

                return;
            }

            var fX = fApp.position[0];
            var fY = fApp.position[1];
            var bPosition = this._centerPosition + fIndex * linesBlank;
            //从起源出发的第一条线
            fApp.lines.push(createLine(fromLinesGroup, fX, fY, fX, bPosition));

            var leftApp = [];
            var rightApp = [];
            //将原目标点数组，按相对于起点位置分为左右两个数组
            this._toArray.forEach((tApp, tIndex) => {
                if (tApp.name === fApp.name) {
                    return;
                }

                if (tApp.position[0] < fX) {
                    //左边数组，倒序插入
                    leftApp.unshift(tApp);
                } else {
                    //右边数组，正序插入
                    rightApp.push(tApp);
                }
            });

            var leftPoint = [];
            var rightPoint = [];
            //左边
            leftApp.forEach((leftToApp, leftToIndex) => {
                var lTX = leftToApp.position[0] + leftToApp.linesIndex * linesBlank;
                var lTY = leftToApp.position[1];
                leftToApp.linesIndex++;

                if (leftToIndex == 0) {
                    //如果是左侧的第一个路径，路径记录为包含第一条线以及连接自身的两条线
                    fApp.path[leftToApp.name] = [0, fApp.lines.length, fApp.lines.length + 1];

                    //从头开始画
                    fApp.lines.push(createLine(fromLinesGroup, fX, bPosition, lTX, bPosition));
                    //将线末端点记为左边记录点
                    leftPoint.push(lTX, bPosition);
                } else {
                    //如果不是左侧第一个路径，初始化为前一个路径的值再去除最后一个元素
                    fApp.path[leftToApp.name] = fApp.path[leftApp[leftToIndex - 1].name].slice(0, -1);
                    fApp.path[leftToApp.name].push(fApp.lines.length, fApp.lines.length + 1);

                    //存在左边记录点，从记录点开始继续画
                    fApp.lines.push(createLine(fromLinesGroup, leftPoint[0], leftPoint[1], lTX, bPosition));
                    //更新记录点
                    leftPoint[0] = lTX;
                    leftPoint[1] = bPosition;
                }

                //到达目标的线
                fApp.lines.push(createLine(fromLinesGroup, lTX, bPosition, lTX, lTY));
            });
            //右边
            rightApp.forEach((rightToApp, rightToIndex) => {
                var rTX = rightToApp.position[0] + rightToApp.linesIndex * linesBlank;
                var rTY = rightToApp.position[1];
                rightToApp.linesIndex++;

                if (rightToIndex == 0) {
                    //如果是右侧的第一个路径，初始化为值包含第一条线
                    fApp.path[rightToApp.name] = [0, fApp.lines.length, fApp.lines.length + 1];

                    //从头开始画
                    fApp.lines.push(createLine(fromLinesGroup, fX, bPosition, rTX, bPosition));
                    //将线末端点记为右边记录点
                    rightPoint.push(rTX, bPosition);
                } else {
                    //如果不是右侧第一个路径，初始化为前一个路径的值再去除最后一个元素
                    fApp.path[rightToApp.name] = fApp.path[rightApp[rightToIndex - 1].name].slice(0, -1);
                    fApp.path[rightToApp.name].push(fApp.lines.length, fApp.lines.length + 1);

                    //存在右边记录点，从记录点开始继续画
                    fApp.lines.push(createLine(fromLinesGroup, rightPoint[0], rightPoint[1], rTX, bPosition));
                    //更新记录点
                    rightPoint[0] = rTX;
                    rightPoint[1] = bPosition;
                }

                //到达目标的线
                fApp.lines.push(createLine(fromLinesGroup, rTX, bPosition, rTX, rTY));
            });

        });

    }

    highlight (edges) {
        if (!Array.isArray(edges)) {
            return;
        }

        this.resetLine();

        edges.forEach((edge) => {
            var pointPath = [];

            this._fromArray.some((from) => {
                //先找到起点
                if (from.name == edge.from) {
                    //再找到对应的路径
                    var pathArray = from.path[edge.to];
                    if(!pathArray || pathArray.length == 0) {
                        //没有找到对应路径，return true 以停止循环
                        console.error(`没有找到对应路径：${edge.from} -> ${edge.to}`);
                        return true;
                    }
                    //将对应路径的线高亮
                    pathArray.forEach((path, i) => {
                        var line = from.lines[path];
                        line.classed('bright', true);

                        pointPath.push( [ parseInt(line.attr('x1')), parseInt(line.attr('y1'))] );
                        if (i == pathArray.length - 1) {
                            pointPath.push( [parseInt(line.attr('x2')), parseInt(line.attr('y2'))] );
                        }
                    });

                    return true;
                }
            });

            this.createPoint(pointPath);


        });
    }

    resetLine () {
        this._fromArray.forEach((from) => {
            from.lines.forEach((line) => {
                line.classed('bright', false);
            });
        });

        //释放point实例
        this._points.forEach((point) => {
            point.destroy();
        });
        this._points = [];
    }

    createPoint (pointPath) {
        if(pointPath.length == 0) {
            return;
        }
        this._points.push( new Points(this.svg, pointPath) );
    }

    updatePoints () {
        this._points.forEach((point) => {
            point.update();
        });
    }
}

class Points {
    constructor (svg, path) {
        this._pointsGroup = svg.append('g').classed('points', true);
        this._path = path;
        this._points = [];
        this._step = 0;
    }

    update () {
        //每经过一段时间自动添加一个点
        if (this._step % 200 === 0) {
            this._points.push({
                pathIndex: 0,
                distance: 0,
                dom: this._pointsGroup.append('circle').attr('r', 7)
            });
            this._step = 0;
        }
        this._step += 1;

        var pointsNeedsUpdate = false;
        //遍历点列表，移动点位置
        this._points.forEach((point) => {
            var pathIndex = point.pathIndex;
            var distance = point.distance;//本次距离 +1
            var from = this._path[pathIndex];
            var to = this._path[pathIndex + 1];

            var x1 = from[0];
            var y1 = from[1];
            var x2 = to[0];
            var y2 = to[1];

            if (x1 == x2) {
                //水平坐标相等
                if (distance > Math.abs(y2-y1)) {
                    //已到达本段路径的终点，进入下一段路径
                    point.pathIndex += 1;
                    point.distance = 0;
                } else {
                    //移动点
                    point.dom.attr({
                        cx: x1,
                        cy: y1 + ((y2 - y1) > 0 ? 1 : -1) * distance
                    });
                }
            } else if (y1 == y2) {
                //纵向坐标相等
                if (distance > Math.abs(x2-x1)) {
                    //已到达本段路径的终点，进入下一段路径
                    point.pathIndex += 1;
                    point.distance = 0;
                } else {
                    //移动点
                    point.dom.attr({
                        cx: x1 + ((x2 - x1) > 0 ? 1 : -1) * distance,
                        cy: y1
                    });
                }
            } else {
                //一般情况
                let percent = distance / Math.sqrt( (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) );
                if (percent >= 1) {
                    //已到达本段路径的终点，进入下一段路径
                    point.pathIndex += 1;
                    point.distance = 0;
                } else {
                    //移动点
                    point.dom.attr({
                        cx: (x2 - x1) * percent + x1,
                        cy: (y2 - y1) * percent + y1
                    });
                }
            }

            if (point.pathIndex == this._path.length - 1) {
                //到达了最终点，销毁该点
                pointsNeedsUpdate = true;
            } else {
                point.distance += 1;
            }

        });

        if (pointsNeedsUpdate) {
            this._points[0].dom.remove();
            this._points.shift();
        }
    }

    destroy () {
        this._points.forEach((point) => {
            point.dom.remove();
            point.dom = null;
        });
        this._points = [];
        this._pointsGroup.remove();
    }
}

module.exports = Connection;
