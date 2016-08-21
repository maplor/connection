'use strict';
/**
 * Created by MaplorNew on 2016/8/21.
 */

(function () {
    // from 和 to 点必须按照位置从左到右的顺序排序，否则会出错
    const from = [
        {
            position: [100, 100],
            lines: []
        },
        {
            position: [200, 100],
            lines: []
        },
        {
            position: [300, 100],
            lines: []
        }
    ];

    const to = [
        {
            position: [150, 400],
            linesIndex: 0
        },
        {
            position: [250, 400],
            linesIndex: 0
        }
    ];

    var centerPosition = 200;

    var data = [
        [[0, 0], [100, 100]],
        [[100, 100], [200, 100]],
        [[200, 100], [100, 200]]
    ];

    const width = 1200;
    const height = 600;
    const linesBlank = 5;

    var svg = d3.select('#connection').append('svg');
    svg.style('width', width + 'px');
    svg.style('height', height + 'px');
    var linesGroup = svg.append('g');

    // var line = d3.line();
    // var path = svg.append('g').selectAll('path').data(data).enter().append("path");
    //
    // path.attr('d', line);
    
    from.forEach(function (fApp, fIndex) {
        var fX = fApp.position[0];
        var fY = fApp.position[1];
        var bPosition = centerPosition + fIndex * linesBlank;
        //从起源出发的第一条线
        fApp.lines.push( createLine( fX, fY, fX, bPosition ) );

        var leftApp = [];
        var rightApp = [];
        //将原目标点数组，按相对于起点位置分为左右两个数组
        to.forEach(function (tApp, tIndex) {
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
        //缓冲区的线
        //左边
        leftApp.forEach(function (leftToApp) {
            var lTX = leftToApp.position[0] + leftToApp.linesIndex * linesBlank;
            var lTY = leftToApp.position[1];
            leftToApp.linesIndex++;
            if (leftPoint.length > 0) {
                //记录了左边点，从左边点开始继续画
                fApp.lines.push( createLine( leftPoint[0], leftPoint[1], lTX, bPosition ) );
                //更新左边点
                leftPoint[0] = lTX;
                leftPoint[1] = bPosition;
            } else {
                //没有记录左边点，从头开始画
                fApp.lines.push( createLine( fX, bPosition, lTX, bPosition ) );
                //将线末端点记录进左边点
                leftPoint.push(lTX, bPosition);
            }

            //到达目标的线
            fApp.lines.push( createLine( lTX, bPosition, lTX, lTY ) );
        });
        //右边
        rightApp.forEach(function (rightToApp) {
            var rTX = rightToApp.position[0] + rightToApp.linesIndex * linesBlank;
            var rTY = rightToApp.position[1];
            rightToApp.linesIndex++;
            if (rightPoint.length > 0) {
                //记录了左边点，从左边点开始继续画
                fApp.lines.push( createLine( rightPoint[0], rightPoint[1], rTX, bPosition ) );
                //更新左边点
                rightPoint[0] = rTX;
                rightPoint[1] = bPosition;
            } else {
                //没有记录左边点，从头开始画
                fApp.lines.push( createLine( fX, bPosition, rTX, bPosition ) );
                //将线末端点记录进左边点
                rightPoint.push(rTX, bPosition);
            }

            //到达目标的线
            fApp.lines.push( createLine( rTX, bPosition, rTX, rTY ) );
        });

    });
    
    function createLine(x1, y1, x2, y2, color) {
        var line = linesGroup.append('line');

        line.attr('x1', x1);
        line.attr('y1', y1);
        line.attr('x2', x2);
        line.attr('y2', y2);
        
        if (color) {
            line.attr('stroke', color);
        }
        return line;
    }
})();


