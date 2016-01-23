
// returns list of unique values, sorted
function unique(list){
	var unique_list = [];
	$.each(list, function(i, el){
	    if($.inArray(el, unique_list) === -1) unique_list.push(el);
	});
	unique_list.sort()
	return unique_list;
}
// like python's range
function range(start, stop, step){
    if (typeof stop=='undefined'){
        // one param defined
        stop = start;
        start = 0;
    };
    if (typeof step=='undefined'){
        step = 1;
    };
    if ((step>0 && start>=stop) || (step<0 && start<=stop)){
        return [];
    };
    var result = [];
    for (var i=start; step>0 ? i<stop : i>stop; i+=step){
        result.push(i);
    };
    return result;
};

/*** sound math **//
function log_tempo(zero_to_hundred){
    return Math.round(10 * Math.pow(2,1 + (zero_to_hundred/100 * 4)))
}
function ilog_tempo(bpm){
    return ((Math.log(bpm/10)/Math.log(2) - 1)/4*100)
}

/** SOUND exporting code **/



// borrowed from recorder.js
function encodeWAV(samples){
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);
  var sampleRate = 44100;

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 32 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 2, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}
function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
function floatTo16BitPCM(output, offset, input){
  for (var i = 0; i < input.length; i++, offset+=2){
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function interleave(inputL, inputR){
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length){
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function forceDownload(blob, filename){
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = window.document.createElement('a');
    link.href = url;
    link.download = filename || 'output.wav';
    var click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
  }


function flatten(arr){
    return arr.reduce(function(a,b){
        return a.concat(b);
    },[]);
};






/** legacy code. needs cleaning up, BADLY **/

/** BEGIN color methods**/
function alphaColor(hex, alpha){
    var red = hex.substr(1, 2), green = hex.substr(3, 2), blue = hex.substr(5, 2);
    color = "rgba(" + parseInt(red, 16) + "," + parseInt(green, 16) + "," + parseInt(blue, 16) + "," + alpha + ")";
    return color;
}
function increase_brightness(rgbcode, percent) {
    var r = parseInt(rgbcode.slice(1, 3), 16),
        g = parseInt(rgbcode.slice(3, 5), 16),
        b = parseInt(rgbcode.slice(5, 7), 16),
        HSL = rgbToHsl(r, g, b),
        newBrightness = HSL[2] + HSL[2] * (percent / 100), 
        RGB;

    RGB = hslToRgb(HSL[0], HSL[1], newBrightness);
    rbgCode = hexString(RGB)

    return rgbcode;
}
function rgbCode(RGB){
	return '#'
        + convertToTwoDigitHexCodeFromDecimal(RGB[0])
        + convertToTwoDigitHexCodeFromDecimal(RGB[1])
        + convertToTwoDigitHexCodeFromDecimal(RGB[2]);
}
function rgbToString(list){
	return ("rgb("+Math.floor(list[0])+","+Math.floor(list[1])+","+Math.floor(list[2])+")")
}
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
}
function convertToTwoDigitHexCodeFromDecimal(decimal){
    var code = Math.round(decimal).toString(16);

    (code.length > 1) || (code = '0' + code);
    return code;
}
/** END color functions **/
