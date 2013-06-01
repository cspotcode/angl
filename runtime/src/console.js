// Provides basic console logging support to Angl code

module.exports = {
    console: {
        log: function(message) {
            console.log(message);
        },
        dir: function(message) {
            console.dir(message);
        }
    }
};