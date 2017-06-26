//////////////////////////////////////////////////////////////////////
// Helpers
//////////////////////////////////////////////////////////////////////

if (!Array.prototype.last){
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
};

Array.prototype.pushToMaxOrShift = function(element, maxLength) {
    this.push(element);
    if (this.length > parseInt(maxLength)) {
        this.shift();
    }
};

function getHoursAndSeconds(milliseconds) {
    // get a string of a integer of milliseconds in the Format "hh:mm"
    
    var eins = new Date(milliseconds);
    
    var zwei = eins.toTimeString().substr(0, 5);
    return zwei;
};
