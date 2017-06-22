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
