function Song(id, mp3, song_title, artist, segments, palette){
    this.song_id = id
    this.mp3 = mp3
    this.song_title = song_title
    this.artist = artist
    this.segments = segments
    this.palette = palette
    this.palette_segments = palette.segment_ids
    this.palette_hues = palette.hues
    this.tempo = 100;
    this.fat_segments = true
    this.auto_shuffle = false
    this.play_segment_list = []
    this.number_of_palette_selections = 1
    this.steps = 4
    this.pulses = 4

    var _song = this

    this.palette_selections = [[],[]]

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

	function Playhead(playhead_id, playhead_highlight_id, segments, palette){
		this.playhead_id = playhead_id
		this.playhead_highlight_id = playhead_highlight_id
		this.segments = segments
		this.palette_segments = palette.segment_ids
		this.palette_hues = palette.hues

		this.highlight = function(highlightSegmentIDs){
			highlightSegmentIDs = unique(highlightSegmentIDs)
			var canvas = document.getElementById(this.playhead_highlight_id);
			var context = canvas.getContext('2d');
			var totalSegments = Object.keys(this.segments).length;
			var old_width = canvas.width;
			var segmentWidth = 1;
			canvas.width = totalSegments * segmentWidth;
			var width = canvas.width ;
			var height = canvas.height;
			context.clearRect(0, 0, width, height);

			var x = 0;
			var y = canvas.height/2;
			var old_x = -1;
			context.beginPath();

			context.moveTo(0, height);
			
			for (h=0; h<highlightSegmentIDs.length; h+=1){ 
				s = highlightSegmentIDs[h]
				// if(s % 4  != 0) continue;
				segment = this.segments[s]
				hue = this.palette_hues[this.palette_segments.indexOf(s)]
				//console.log(hue)
				color = hslToRgb(hue, 1, 0.5)
				color = rgbCode(color)
				//console.log(color)

				//console.log(segment)
				x = segmentWidth * s;
				if(old_x == x) continue; // don't draw two data points on the same x

				context.beginPath();
				context.rect(x, 0, 1, height);
				
				context.fillStyle = color; // straight color
				context.lineWidth = 1;
				context.strokeStyle = color;
				context.stroke();
					
				
				context.fill();
				
				
				old_x = x;
			}
		};

		// highlightSegmentIDs : list of ordered segment_ids
		this.draw = function (){
			var canvas = document.getElementById(this.playhead_id);
			var context = canvas.getContext('2d');
			
			var totalSegments = Object.keys(this.segments).length;
			var old_width = canvas.width;
			var segmentWidth = 1;
			canvas.width = totalSegments * segmentWidth;
			var width = canvas.width ;
			var height = canvas.height;
			
			context.clearRect(0, 0, width, height);
			var x = 0;
			var y = canvas.height/2;
			var old_x = -1;
			context.beginPath();

			context.moveTo(0, height);
			
			for (s=0; s<totalSegments; s+=1){ 

				// if(s % 4  != 0) continue;
				//hue = this.palette.indexOf(s) / totalSegments
				hue = this.palette_hues[this.palette_segments.indexOf(s)]
				//console.log(hue)
				color = hslToRgb(hue, 1, 0.5)
				color = rgbCode(color)
				//console.log(color)

				//console.log(segment)
				x = segmentWidth * s;
				if(old_x == x) continue; // don't draw two data points on the same x

				context.beginPath();
				context.rect(x, 0, 1, height);
				
				context.fillStyle = alphaColor(color, 0.1); // straight color

				context.fill();
				
				
				old_x = x;
			}
		}

		$("#"+playhead_highlight_id).on("mousemove",function(e){
			//console.log(e)
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
	       
	        segment_id = Math.round(_song.segments.length * (x/w));
	        //console.log(segment_id)

			_song.highlight_all([segment_id], null)
		});

		this.draw()
	}

	function PaletteMapper(palette_mapper_id, palette_mapper_highlight_id, segments, palette){
		this.palette_mapper_id = palette_mapper_id
		this.palette_mapper_highlight_id = palette_mapper_highlight_id
		this.segments = segments
		this.palette_segments = palette["segment_ids"]
		this.palette_hues = palette["hues"]

		this.draw = function (){
			var canvas = document.getElementById(this.palette_mapper_id);
			var context = canvas.getContext('2d');
			
			var totalSegments = Object.keys(this.palette_segments).length;
			var old_width = canvas.width;
			var segmentWidth = 1;
			canvas.width = totalSegments * segmentWidth;
			var width = canvas.width ;
			var height = canvas.height;
			
			context.clearRect(0, 0, width, height);
			var x = 0;
			var y = canvas.height/2;
			var old_x = -1;
			context.beginPath();

			context.moveTo(0, height);
			
			for (p=0; p<totalSegments; p+=1){ 

				// if(s % 4  != 0) continue;
				//hue = p / totalSegments
				hue = this.palette_hues[p]
				//console.log(hue)
				color = hslToRgb(hue, 1, 0.5)
				color = rgbCode(color)
				//console.log(color)

				//console.log(segment)
				x = segmentWidth * p;
				if(old_x == x) continue; // don't draw two data points on the same x

				context.beginPath();
				context.rect(x, 0, 1, height);
				
				context.fillStyle = alphaColor(color, 0.2); // straight color

				context.fill();
				
				
				old_x = x;
			}
		}



		this.highlight = function(highlightPaletteIndices){
			highlightPaletteIndices = unique(highlightPaletteIndices)
			//console.log(highlightPaletteIndices);
			var canvas = document.getElementById(this.palette_mapper_highlight_id);
			var context = canvas.getContext('2d');
			var totalSegments = Object.keys(this.palette_segments).length;
			var old_width = canvas.width;
			var segmentWidth = 1;
			canvas.width = totalSegments * segmentWidth;
			var width = canvas.width ;
			var height = canvas.height;
			context.clearRect(0, 0, width, height);

			var x = 0;
			var y = canvas.height/2;
			var old_x = -1;
			context.beginPath();

			context.moveTo(0, height);
			
			for (h=0; h<highlightPaletteIndices.length; h+=1){ 
				p = highlightPaletteIndices[h]
				hue = this.palette_hues[p]
				//console.log(hue)
				color = hslToRgb(hue, 1, 0.5)
				color = rgbCode(color)
				//console.log(color)

				//console.log(segment)
				x = segmentWidth * p;
				if(old_x == x) continue; // don't draw two data points on the same x

				context.beginPath();
				context.rect(x, 0, 1, height);
				
				context.fillStyle = color; // straight color
				context.lineWidth = 1;
				context.strokeStyle = color;
				context.stroke();
					
				
				context.fill();
				
				
				old_x = x;
			}
		};



		$("#"+palette_mapper_highlight_id).on("mousemove",function(e){
			//console.log(e)
			pm = _song.palette_mapper
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
	   		var palette_index = Math.round(_song.palette_segments.length * (x/w));

	        if(pm.dragging){
	        	if(pm.drag_start < palette_index){
					_song.highlight_all(null, range(pm.drag_start,palette_index))
				}else{
					_song.highlight_all(null, range(palette_index,pm.drag_start))
				}
	        }else{
	        	_song.highlight_all(null, _song.palette_selections[0].concat([palette_index]))
	        }

	       
	        //console.log(segment_id)
		});

		$("#"+palette_mapper_highlight_id).on("mousedown", function(e){
			pm = _song.palette_mapper
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
			pm.dragging = true
			pm.drag_start = Math.round(_song.palette_segments.length * (x/w));
			_song.highlight_all(null, [pm.drag_start]);
			_song.palette_selections[0] = [];

		})

		$("#"+palette_mapper_highlight_id).on("mouseup", function(e){
			
			pm = _song.palette_mapper
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
			if(pm.dragging){
				pm.dragging = false;
				pm.drag_stop = Math.round(_song.palette_segments.length * (x/w));
				if(pm.drag_stop < pm.drag_start){
					_song.palette_selections[0] = range(pm.drag_stop,pm.drag_start,1)
				}else{
					_song.palette_selections[0] = range(pm.drag_start,pm.drag_stop,1)	
				}
				_song.highlight_all(null, _song.palette_selections[0])
				_song.update_rhythm()
			}
		})

		$("#"+palette_mapper_highlight_id).on("mouseout", function(e){
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
			pm = _song.palette_mapper
			if(pm.dragging){
				pm.dragging = false
				pm.drag_stop = Math.round(_song.palette_segments.length * (x/w));
				if(pm.drag_stop < pm.drag_start){
					_song.palette_selections[0] = range(pm.drag_stop,pm.drag_start,1)
				}else{
					_song.palette_selections[0] = range(pm.drag_start,pm.drag_stop,1)
				}
				_song.highlight_all(null, _song.palette_selections[0])
				_song.update_rhythm()
			}
		})


		this.draw()
	}

	/*
	// Failed interface
	function RhythmMapper(rhythm_mapper_id, rhythm_mapper_highlight_id, min_steps, max_steps, min_pulses, max_pulses){
		this.rhythm_mapper_id = rhythm_mapper_id
		this.rhythm_mapper_highlight_id = rhythm_mapper_highlight_id
		this.min_steps = min_steps
		this.max_steps = max_steps
		this.min_pulses = min_pulses
		this.max_pulses = max_pulses

		this.draw = function(){
			var canvas = document.getElementById(this.rhythm_mapper_id);
			var context = canvas.getContext('2d');
			
			var blocks_x = this.max_steps - this.min_steps + 1;
			var blocks_y = this.max_pulses - this.min_pulses + 1;

			var min_pixels_x = blocks_x * this.max_steps*2;
			var min_pixels_y = blocks_y * 10;
			
			canvas.width = min_pixels_x
			canvas.height = min_pixels_y	
			//var old_width = canvas.width;
			//var old_height = canvas.height;


			var width = canvas.width;
			var height = canvas.height;

			var block_w = width / blocks_x;
			var block_h = height / blocks_y; 

			var steps, pulses, pattern;

			context.clearRect(0, 0, width, height);
			
			var bx, by, x, y 
			for(bx=0; bx<blocks_x; bx++){
				steps = bx + min_steps
				step_width = block_w / steps 
				b_left = bx * block_w
				b_right = (bx+1) * block_w

				for(by=0; by<blocks_y; by++){	
					pulses = by + min_pulses

					if (pulses > steps) break

					b_top = by * block_h
					b_bottom = (by+1) * block_h

					//console.log(b_left, b_top, b_right, b_bottom)
					c = by * 10
					context.fillStyle = "rgb(" + c + ","+ c +","+ c +")"
					context.rect(b_left, b_top, b_right, b_bottom)
					context.fill();
						context.stroke();

					console.log("steps:" + steps, "pulses: " + pulses)
					pattern = bjorklund(steps, pulses)
					console.log(pattern)
					//if(pattern.length == 0) continue
					continue
					
					for(s=0; s<steps; s++){
						context.strokeStyle = "#999"
						if(pattern[s]){
							context.fillStyle = "white"
						}else{
							context.fillStyle = "black"
						}
						context.rect(s * step_width, b_top, (s+1) * step_width, b_bottom)
						context.fill();
						context.stroke();
					}
					
				}
			}
		}

		this.draw()

	}*/


	function RhythmDisplay(rhythm_display_id){
		this.rhythm_display_id = rhythm_display_id
		this.draw = function(steps,play_segment_list){
			rd = $("#"+rhythm_display_id);
			beat_bars = ""
			//console.log(play_segment_list);
			for(var s=0;s<play_segment_list.length;s++){
				step_length = play_segment_list[s].step_length;
				percent_length = step_length / steps * 100

				hue = _song.palette_hues[_song.palette_segments.indexOf(play_segment_list[s].segment_id)]

				c1 = rgbCode(hslToRgb(hue, 0.8, 0.5))
				c2 = rgbCode(hslToRgb(hue, 1.0, 0.3))
				//console.log(hue, play_segment_list, play_segment_list[s], play_segment_list[s].segment_id, _song.palette_segments.indexOf(play_segment_list[s].segment_id))
				beat_bars +='<div class="progress-bar" style="width: '+percent_length+'%; background-image: linear-gradient(to right bottom, '+c1+' 0,'+c2+' 100%);"></div>';
			}
			rd.empty()
			rd.html(beat_bars)
		}
		/*this.draw = function(steps, play_segment_list){
			var canvas = document.getElementById(this.rhythm_display_id);
			var context = canvas.getContext('2d');

			var width = canvas.width ;
			var height = canvas.height;
			context.clearRect(0, 0, width, height);

			step_width = width / steps;
			console.log(play_segment_list)
			total_steps = 0;
			for(s=0;s<play_segment_list.length;s++){
				ps = play_segment_list[s];
				segment_id = ps.segment_id
				step_length = ps.step_length

				c = 200
				context.fillStyle = "rgb(" + c + ","+ c +","+ c +")"
				context.rect(total_steps*step_width, 0, (total_steps+step_length)*step_width, height)
				context.fill();
				context.stroke();

				total_steps += step_length
			}
		};
		*/
		this.draw(0,[])

	}
	// highlight segments in both the palette_mapper and the playhead
	// set one of these arguments as a list of ints, and the other as null, and it will figure out what to highlight
	this.highlight_all = function (segment_ids, palette_indices){
		if(palette_indices == null){

			palette_indices = [];
		
			for(var s=0;s<segment_ids.length;s++){
				palette_indices.push(_song.palette_segments.indexOf(segment_ids[s]))
			}

		}
		if(_song.palette_selections[0].length > 0){
			palette_indices = unique(palette_indices.concat(_song.palette_selections[0]))
		}

		if(segment_ids == null){
			segment_ids = [];

			
			for(var p=0;p<palette_indices.length;p++){
				segment_ids.push(_song.palette_segments[palette_indices[p]])
			}

		}
		_song.playhead.highlight(segment_ids)
		_song.palette_mapper.highlight(palette_indices)
	}

	// call this function whenever the parameters change
	this.update_rhythm = function(){
		pattern = bjorklund(this.steps, this.pulses)
		play_segment_list = []
		for(var p=0;p<pattern.length;p++){
        	if(this.fat_segments && pattern[p]==0){
           		play_segment_list[play_segment_list.length-1]["step_length"]++
        	}else{
        		if(this.number_of_palette_selections==1){
        			new_segment_id = this.from_palette(0) // one selection? pick from that one
        		}else{
        			new_segment_id = this.from_palette(pattern[p]) // two selections? pick according to euclidean
        		}
        		seg = {"segment_id": new_segment_id, "step_length": 1}
        		
        		play_segment_list.push(seg)
        	}
		}
		this.play_segment_list = play_segment_list
		this.rhythm_display.draw(this.steps, play_segment_list)

		this.play_list(play_segment_list)
         
	}

	this.from_palette = function(selection_id){
		ps = this.palette_selections[selection_id]
		palette_index = ps[Math.floor(Math.random()*ps.length)]
		segment_id = this.palette_segments[palette_index]
		return segment_id

	}


    this.rhythmChange = function() {
      song.steps = step_slider.getValue()
      song.pulses = pulse_slider.getValue()
      if(song.pulses> song.steps){
          song.pulses = song.steps;
          $('#pulse_slider').slider({max: song.steps})
      }

      
	      var value = $('#pulse_slider').data('slider').getValue();
	      if(!(song.steps == 1 && song.pulses == 1)) $('#pulse_slider').data('slider').max = song.steps;
	      $('#pulse_slider').slider('setValue', value);
	      $('#GC').attr("style","width: "+(100 * (song.steps-1)/16)+"%");
	  
      song.update_rhythm()
    };

    this.tempoChange = function(){
        _song.tempo = log_tempo(tempo_slider.getValue())
        $("#ui-tempo").html(song.tempo + " bpm")
        _song.update_rhythm()
    }

    function log_tempo(zero_to_hundred){
    	return Math.round(10 * Math.pow(2,1 + (zero_to_hundred/100 * 4)))
    }

    var step_slider = $('#step_slider').slider()
            .on('slide', function(){_song.rhythmChange()})
            .data('slider');
    var pulse_slider = $('#pulse_slider').slider()
            .on('slide', function(){_song.rhythmChange()})
            .data('slider');
    var tempo_slider = $('#tempo_slider').slider()
            .on('slide', function(){_song.tempoChange()})
            .data('slider');


    this.init = function(){
	    this.playhead = new Playhead("playhead", "playhead-highlight", segments, palette)
	   	this.palette_mapper = new PaletteMapper("palette-mapper", "palette-mapper-highlight", segments, palette)
	   	//this.rhythm_mapper = new RhythmMapper("rhythm-mapper", "rhythm-mapper-highlight", 4, 16, 1, 16)
	   	this.rhythm_display = new RhythmDisplay("rhythm-display")

	    $("#artist-name").html(artist)
	    $("#song-title").html(song_title)
	}

    this.randomize_parameters = function(){
    	console.log("random!!")
    	$('#tempo_slider').slider('setValue',Math.random()*100);
    	this.tempoChange()

    	step_max = $('#step_slider').data('slider').max
    	step_min = $('#step_slider').data('slider').min
    	$('#step_slider').slider('setValue',Math.floor(Math.random()*(step_max-step_min))+step_min);

    	pulse_max = $('#pulse_slider').data('slider').max
    	pulse_min = $('#pulse_slider').data('slider').min
    	$('#pulse_slider').slider('setValue',Math.floor(Math.random()*(pulse_max-pulse_min))+pulse_min);
    	this.rhythmChange()

    	num_segments = _song.palette_segments.length
    	selection_size = 25
    	selection_start = Math.floor(Math.random()* (num_segments - selection_size));

    	_song.palette_selections[0] = range(selection_start,selection_start+selection_size,1)
    	console.log("huh",_song.palette_selections[0] , num_segments, selection_start,_song.palette_selections[0].length)
		_song.highlight_all(null, _song.palette_selections[0])
		_song.update_rhythm()
    }

    this.load_parameters = function(params){
    	console.log("load params", params)
    	$('#tempo_slider').slider('setValue',params.tempo);
    	this.tempoChange()

    	$('#step_slider').slider('setValue',params.steps);
    	this.rhythmChange()
    	$('#pulse_slider').slider('setValue',params.pulses);
		this.rhythmChange()

    	_song.palette_selections[0] = params.selections
    	_song.highlight_all(null, params.selections)
		//_song.update_rhythm()

		_song.play_segment_list = params.play_segment_list

		this.rhythm_display.draw(params.steps, params.play_segment_list)
		this.play_list(params.play_segment_list)


    }

    this.save_parameters = function(){
    	params = {
    		tempo: tempo_slider.getValue(), 
    		steps: step_slider.getValue(), 
    		pulses: pulse_slider.getValue(), 
    		selections: _song.palette_selections[0],
    		play_segment_list: _song.play_segment_list	
    	}
    	console.log("saved params", params)
    	return params

    }

    /**  SOUND!! **/
    this.sound_loaded = false;
	var sound = new load_sound(mp3, function(){
		console.log("Finished loading MP3");
		_song.sound_loaded = true

	})
	sound.init();
	this.sound = sound
	this.play = function(w,s,d){
		this.sound.play(w,s,d)
	};

	this.play_list = function(play_segment_list){
		console.log(this.sound_loaded)
		if(this.sound_loaded){
			try{
				this.sound.stopAll(0)
			}catch(e){
				console.log("error stopping audio", e)
			}
			then = 0
			//console.log("play_segment_list", play_segment_list)
			for(var loops=0;loops<100;loops++){
				for(var s=0;s<play_segment_list.length;s++){
					segment_id = play_segment_list[s].segment_id
					segment = this.segments[segment_id]

					step_duration =  60 / this.tempo / this.steps * play_segment_list[s].step_length;
					if(step_duration <= segment.duration){
						this.play(then, segment.start, step_duration )
					}else{
						this.play(then, segment.start, segment.duration )
					}

					//console.log("this.play", segment.start, step_duration)
					then += step_duration
				}
				
			}
		}
	}



	this.init();

}







