/**
 * Created by MaplorNew on 2016/8/28.
 */

function merge (target) {
    var result = target || {};

    for (let i = 0; i < arguments.length; i++) {
        let obj = arguments[i];

        if (!obj) {
            continue;
        }

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                //不对数组进行深合并
                if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                    result[key] = merge(result[key], obj[key]);
                } else {
                    result[key] = obj[key];
                }
            }
        }
    }

    return result;
}

module.exports = {
    merge: merge
};