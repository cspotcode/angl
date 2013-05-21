// GML's built-in math routines

module.exports = {
    random: function() {
        return Math.random();
    },
    
    random_range: function(other, x1, x2) {
        // TODO what if x1 is greater than x2?
        return x1 + Math.random() * (x2 - x1);
    },
    
    irandom: function(other, x) {
        // TODO what if x is negative?
        // "inclusive when x is an integer"
        if(x|0 === x) x += 1;
        return (Math.random() * x)|0;
    },
    
    irandom_range: function(other, x1, x2) {
        // TODO same caveats as the above two functions
        // round down
        var a = x1|0, b = x2|0;
        // "inclusive"
        if(b === x2) b++;
        return (x1 + Math.random() * (x2 - x1))|0;
    },
    
    random_set_seed: function(other, seed) {
        // TODO once this is implemented, don't forget to change all calls to Math.random to use our replacement random number generator
        throw new Error('This is not supported.');
    },

    random_get_seed: function() {
        throw new Error('This is not supported.');
    },

    randomize: function() {
        throw new Error('This is not supported.');
    },
    
    choose: function(other/*, val1, val2, val3, ...*/) {
        var i = Math.random() * (arguments.length - 1);
        return arguments[i|0 + 1];
    },
    
    abs: function(other, x) {
        return Math.abs(x);
    },
    
    sign: function(other, x) {
        // TODO what if x is not a number?
        x = x * 1;
        return (x === 0)
               ? 0
               : (x < 0)
                 ? -1
                 : 1;
    },
    
    round: function(other, x) {
        return Math.round(x);
    },
    
    floor: function(other, x) {
        return Math.floor(x);
    },
    
    ceil: function(other, x) {
        return Math.ceil(x);
    },
    
    frac: function(other, x) {
        // TODO how does this work with negative numbers?
        throw new Error('This is not supported.');
    },
    
    sqrt: function(other, x) {
        return Math.sqrt(x);
    },
    
    sqr: function(other, x) {
        return x * x;
    },
    
    power: function(other, x, n) {
        return Math.pow(x, n);
    },
    
    exp: function(other, x) {
        return Math.pow(Math.E, x);
    },
    
    ln: function(other, x) {
        return Math.log(x);
    },
    
    log2: function(other, x) {
        return Math.log(x) * Math.LOG2E;
    },
    
    log10: function(other, x) {
        return Math.log(x) * Math.LOG10E;
    },
    
    logn: function(other, n, x) {
        return Math.log(x) / Math.log(n);
    },
    
    sin: function(other, x) {
        return Math.sin(x);
    },
    
    cos: function(other, x) {
        return Math.cos(x);
    },
    
    tan: function(other, x) {
        return Math.tan(x);
    },
    
    arcsin: function(other, x) {
        return Math.asin(x);
    },

    arccos: function(other, x) {
        return Math.acos(x);
    },
    
    arctan: function(other, x) {
        return Math.atan(x);
    },
    
    arctan2: function(other, y, x) {
        // TODO does it return negative arcs?
    },

    degtorad: function(other, x) {
        return x / 180 * Math.PI;
    },

    radtodeg: function(other, x) {
        return x * 180 / Math.PI;
    },

    min: function(other/*, val1, val2, val3, ...*/) {
        var args = Array.prototype.slice.call(arguments);
        return Math.min.apply(Math, args);
    },

    max: function(other/*, val1, val2, val3, ...*/) {
        var args = Array.prototype.slice.call(arguments);
        return Math.max.apply(Math, args);
    },

    mean: function(other/*, val1, val2, val3, ...*/) {
        var i,
            l = arguments.length,
            a = 0;
        for(i = 1; i < l; i++)
            a += arguments[i];
        return a / (l - 1);
    },

    median: function(other/*, val1, val2, val3, ...*/) {
        var args = Array.prototype.slice.call(arguments);
        args.sort();
        return args[((args.length - 1) / 2)|0];
    },

    point_distance: function(other, x1, y2, x2, y2) {
        var x = x2 - x1, y = y2 - y1;
        return Math.sqrt(x*x + y*y);
        // TODO make this more efficient?
    },

    point_direction: function(other, x1, y1, x2, y2) {
        // TODO verify that this is correct
        return this.arctan2(y2 - y1, x2 - x1);
    },

    lengthdir_x: function(other, len, dir) {
        return Math.cos(dir) * len;
    },

    lengthdir_y: function(other, len, dir) {
        return Math.sin(dir) * len;
    },

    is_real: function(other, x) {
        return Object.prototype.toString.call(x) === '[object Number]';
    },

    is_string: function(other, x) {
        return Object.prototype.toString.call(x) === '[object String]';
    },
    
    pi: Math.PI
    
};