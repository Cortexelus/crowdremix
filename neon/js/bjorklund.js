/*
 
An implementation of the Bjorklund algorithm in JavaScript
 
Inspired by the paper 'The Euclidean Algorithm Generates Traditional Musical Rhythms' 
by Godfried Toussaint

This is a port of the original algorithm by E. Bjorklund which I
found in the paper 'The Theory of Rep-Rate Pattern Generation in the SNS Timing Systems' by
E. Bjorklund.
 
Jack Rutherford
 
*/

Array.prototype.rotate = (function() {
    // save references to array functions to make lookup faster
    var push = Array.prototype.push,
        splice = Array.prototype.splice;

    return function(count) {
        var len = this.length >>> 0, // convert to uint
            count = count >> 0; // convert to int

        // convert count to value in range [0, len[
        count = ((count % len) + len) % len;

        // use splice.call() instead of this.splice() to make function generic
        push.apply(this, splice.call(this, 0, count));
        return this;
    };
})();
 
function bjorklund(steps, pulses) {
	
	steps = Math.round(steps);
	pulses = Math.round(pulses);	
 
	if(pulses > steps || pulses == 0 || steps == 0) {
		return new Array();
	}
 
	pattern = [];
	   counts = [];
	   remainders = [];
	   divisor = steps - pulses;
	remainders.push(pulses);
	level = 0;
 
	while(true) {
		counts.push(Math.floor(divisor / remainders[level]));
		remainders.push(divisor % remainders[level]);
		divisor = remainders[level]; 
	       level += 1;
		if (remainders[level] <= 1) {
			break;
		}
	}
	
	counts.push(divisor);
 
	var r = 0;
	var build = function(level) {
		r++;
		if (level > -1) {
			for (var i=0; i < counts[level]; i++) {
				build(level-1); 
			}	
			if (remainders[level] != 0) {
	        	build(level-2);
			}
		} else if (level == -1) {
	           pattern.push(0);	
		} else if (level == -2) {
           pattern.push(1);        
		} 
	};
 
	build(level);
	pattern = pattern.reverse();
	first_one = pattern.indexOf(1);
	if(first_one!=0){
		pattern.rotate(first_one)
	}
	return pattern
}