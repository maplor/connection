
var Connection = require('./connection');

var c = new Connection('#connection', {});

c.draw({
    from: [
        {
            name: '111',
            position: [200, 200]
        },
        {
            name: '222',
            position: [400, 200]
        },
        {
            name: '333',
            position: [600, 200]
        }
    ],
    to: [
        {
            name: 'aaa',
            position: [100, 400]
        },
        {
            name: 'bbb',
            position: [300, 400]
        },
        {
            name: 'ccc',
            position: [500, 400]
        },
    ],
    center: 300
});