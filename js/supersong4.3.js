var max_euclidean_steps = 16;

function Song(id, mp3, song_title, artist, segments, palette){
    this.song_id = id
    this.mp3 = mp3
    this.song_title = song_title
    this.artist = artist
    this.segments = segments
    this.palette = palette
    this.palette_segments = palette.segment_ids
    this.palette_hues = palette.hues
    this.tempo = 50;

    this.number_of_palette_selections = 1

    this.latency = 0; // hasn't yet been implemented (but probably would be useful for syncing up color effects to sound)
    this.sound_loaded = false; // flag, turns true when mp3 is loaded

    // actually part of loop, should be its own object:
    this.fat_segments = true
    this.auto_shuffle = true
    this.play_segment_list = []
    this.steps = 8
    this.pulses = 5
    this.chaos = "order"
    this.flows = "flows"
    this.forever = "forever"
    this.layer = "on earth"

    this.num_channels = 2
   	this.sample_rate = 44100
   	this.have_video = false // true if we're remixing a video
   	this.parameters_changed = false // flag used in quantization. 
   	this.no_actions_yet = true // set to false after the user does any sound activity
   	this.loudness_info = false
    var _song = this

    this.palette_selections = [[]]
    this.playhead_selections = [[]]


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

				if(segment.hasOwnProperty("loudness_max")){
					// change height according to loudness
					new_height = height * (segment.loudness_max+60)/60
					edge = (height-new_height)/2;
					//console.log(segment.loudness_max, new_height, height, edge)
					context.rect(x, edge, 1, height-(edge*2));
					this.loudness_info = true
				}else{
					context.rect(x, 0, 1, height);
				}


			

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
				segment = this.segments[s]
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

				if(segment.hasOwnProperty("loudness_max")){
					// change height according to loudness
					new_height = height * (segment.loudness_max+60)/60
					edge = (height-new_height)/2;
					//console.log(segment.loudness_max, new_height, height, edge)
					context.rect(x, edge, 1, height-(edge*2));
					context.fillStyle = alphaColor(color, 0.3); // straight color
					this.loudness_info = true
				}else{
					context.rect(x, 0, 1, height);
					context.fillStyle = alphaColor(color, 0.1); // straight color
				}
				


				context.fill();
				
				
				old_x = x;
			}

			if(this.loudness_info){

				$(".playhead").addClass(".amplitude")
				$(".playhead").removeClass(".no-amplitude")
			}else{
				$(".playhead").removeClass(".amplitude")
				$(".playhead").addClass(".no-amplitude")

			}
		}

		/*

		$("#"+playhead_highlight_id).on("mousemove",function(e){
			//console.log(e)
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
	       
	        segment_id = Math.round(_song.segments.length * (x/w));
	        //console.log(segment_id)

			_song.highlight_all([segment_id], null)
		});
*/


		$("#"+playhead_highlight_id).on("mousemove",function(e){
			ph = _song.playhead
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
	   		var segment_id = Math.round(_song.segments.length * (x/w));

			if(segment_id <= 0) segment_id = 0;
			if(segment_id >= _song.segments.length) segment_id = _song.segments.length - 1;


	        if(ph.dragging){
	        	if(ph.drag_start < segment_id){
					_song.highlight_all(range(ph.drag_start,segment_id), null)
				}else{
					_song.highlight_all(range(segment_id,ph.drag_start), null)
				}
	        }else{
	        	//_song.highlight_all(_song.playhead_selections[0].concat([segment_id]),null)

	        	if(_song.playhead_selections.length==0){
	        		_song.playhead_selections.push([]);
	        	}
	        	_song.highlight_all(flatten(_song.playhead_selections).concat([segment_id]),null)
	        }





	       
	        //console.log(segment_id)
		});

		$("#"+playhead_highlight_id).on("mousedown", function(e){
			ph = _song.playhead
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
			ph.dragging = true
			ph.drag_start = Math.round(_song.segments.length * (x/w));

			if(ph.drag_start <= 0) ph.drag_start = 0;
			if(ph.drag_start >= _song.segments.length) ph.drag_start = _song.segments.length - 1;


			if(e.shiftKey){

				_song.removeZeroSizeSelections()
				ph.current_selection = _song.playhead_selections.length;
				_song.playhead_selections.push([])
			}else{
				ph.current_selection = 0
				_song.playhead_selections = []
				_song.playhead_selections.push([ph.drag_start])

				// reset palette too
				_song.palette_mapper.current_selection = 0
				_song.palette_selections = [[]]
			}	

			_song.highlight_all([ph.drag_start],null);

		})

		$("#"+playhead_highlight_id).on("mouseup", function(e){
			
			ph = _song.playhead
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
			if(ph.dragging){
				ph.dragging = false;
				ph.drag_stop = Math.round(_song.segments.length * (x/w));

				if(ph.drag_stop <= 0) ph.drag_stop = 0;
				if(ph.drag_stop >= _song.segments.length) ph.drag_stop = _song.segments.length - 1;


				if(ph.drag_stop < ph.drag_start){
					_song.playhead_selections[ph.current_selection] = range(ph.drag_stop,ph.drag_start,1)
				}else if(ph.drag_stop > ph.drag_start){
					_song.playhead_selections[ph.current_selection] = range(ph.drag_start,ph.drag_stop,1)	
				}else{
					_song.playhead_selections[ph.current_selection] = [ph.drag_stop]
				}
				_song.highlight_all(flatten(_song.playhead_selections),null);
				_song.update_rhythm(false)
				_song.play_list(_song.play_segment_list);
			}else{

			}
		})


		$("#"+playhead_highlight_id).on("mouseout", function(e){
			
			ph = _song.playhead
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
			if(ph.dragging){
				ph.dragging = false;
				_song.playhead_selections[ph.current_selection] = []
				_song.removeZeroSizeSelections()
				_song.highlight_all(flatten(_song.playhead_selections),null);
				_song.update_rhythm(false)
				_song.play_list(_song.play_segment_list);
			}else{

			}
		})




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
			
			if(palette_index <= 0) palette_index = 0;
			if(palette_index >= _song.palette_segments.length) palette_index = _song.palette_segments.length - 1;


	        if(pm.dragging){
	        	if(pm.drag_start < palette_index){
					_song.highlight_all(null, range(pm.drag_start,palette_index))
				}else{
					_song.highlight_all(null, range(palette_index,pm.drag_start))
				}
	        }else{
	        	if(_song.palette_selections.length==0){
	        		_song.palette_selections.push([]);
	        	}
	        	_song.highlight_all(null, flatten(_song.palette_selections).concat([palette_index]))
	        }

	        //console.log(_song.palette_selections);
		});


		$("#"+palette_mapper_highlight_id).on("mousedown", function(e){
			pm = _song.palette_mapper
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
			pm.dragging = true
			pm.drag_start = Math.round(_song.palette_segments.length * (x/w));

			if(pm.drag_start <= 0) pm.drag_start = 0;
			if(pm.drag_start >= _song.palette_segments.length) pm.drag_start = _song.palette_segments.length - 1;
			pm.drag_stop = pm.drag_start

			if(e.shiftKey){
				_song.removeZeroSizeSelections()
				pm.current_selection = _song.palette_selections.length;
				_song.palette_selections.push([])
			}else{
				pm.current_selection = 0
				_song.palette_selections = []
				_song.palette_selections.push([pm.drag_start])

				_song.playhead.current_selection = 0
				_song.playhead_selections = [[]]
			}	
			
			_song.highlight_all(null, [pm.drag_start]);

	        //console.log(_song.palette_selections);

		})

		$("#"+palette_mapper_highlight_id).on("mouseup", function(e){
			
			pm = _song.palette_mapper
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
			if(pm.dragging){
				pm.dragging = false;
				pm.drag_stop = Math.round(_song.palette_segments.length * (x/w));

				if(pm.drag_stop <= 0) pm.drag_stop = 0;
				if(pm.drag_stop >= _song.palette_segments.length) pm.drag_stop = _song.palette_segments.length - 1;

				//console.log(pm.drag_start, pm.drag_stop)
				if(pm.drag_stop < pm.drag_start){
					_song.palette_selections[pm.current_selection] = range(pm.drag_stop,pm.drag_start,1)
				}else if(pm.drag_stop > pm.drag_start){
					_song.palette_selections[pm.current_selection] = range(pm.drag_start,pm.drag_stop,1)	
				}else{
					_song.palette_selections[pm.current_selection] = [pm.drag_stop]
				}
				_song.highlight_all(null, flatten(_song.palette_selections));
				_song.update_rhythm(false)
				_song.play_list(_song.play_segment_list);
			}


	        //console.log(_song.palette_selections);

		})


		$("#"+palette_mapper_highlight_id).on("mouseout", function(e){
				
			pm = _song.palette_mapper
			var w = $(this).width()
	        var x = (e.pageX - $(this).offset().left); //offset -> method allows you to retrieve the current position of an element 'relative' to the document
			if(pm.dragging){
				pm.dragging = false;
				_song.palette_selections[pm.current_selection] = []

				_song.removeZeroSizeSelections()
				
				_song.highlight_all(null, flatten(_song.palette_selections));
				_song.update_rhythm(false)
				_song.play_list(_song.play_segment_list);
			}


	        //console.log(_song.palette_selections);

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

	/* Adds the loop to the list of loops in the interface */
	this.addToLoopList = function(loop,k){
		c = String.fromCharCode(k)
		if($('#rhythm-display-'+k).length == 0){
			$("#loop-container").append("<div style='cursor:pointer;clear:both' id='loop-list-element-"+k+"''><div style='width: 25px;float:left;font-style: italic'>"+c+"</div><div style='width: 100%'><div class='progress' id='rhythm-display-"+k+"'></div></div></div>")
        }

        loop.rhythm_container = new RhythmDisplay("rhythm-display-"+k);
        loop.rhythm_container.draw(loop.steps, loop.play_segment_list)
        $("#rhythm-display-"+k).click(function(){
        	song.load_loop(savedLoops[k])
        });
       $("#loop-list").show()

	}
	
	function RhythmDisplay(rhythm_display_id){
		this.rhythm_display_id = rhythm_display_id
		this.draw = function(steps,play_segment_list){
			rd = $("#"+rhythm_display_id);
			beat_bars = ""
			//console.log(play_segment_list);
			for(var s=0;s<play_segment_list.length;s++){
				step_length = play_segment_list[s].step_length;
				percent_length = step_length / steps * 100
				pixel_length = $("#rhythm-display").width() * percent_length / 100
				segment_id = play_segment_list[s].segment_id;
				hue = _song.palette_hues[_song.palette_segments.indexOf(segment_id)]

				c1 = rgbCode(hslToRgb(hue, 0.8, 0.5))
				c2 = rgbCode(hslToRgb(hue, 1.0, 0.3))
				//console.log(hue, play_segment_list, play_segment_list[s], play_segment_list[s].segment_id, _song.palette_segments.indexOf(play_segment_list[s].segment_id))
				beat_bars +='<div class="progress-bar" id="segment_'+segment_id+'-'+step_length+'" style="width: '+pixel_length+'px; background-image: linear-gradient(to right bottom, '+c1+' 0,'+c2+' 100%);"></div>';
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

	 // zero-size selection bug fix
	this.removeZeroSizeSelections = function (){

		this.playhead_selections = _song.playhead_selections.filter(function(e){return e.length>0;})
		this.palette_selections = _song.palette_selections.filter(function(e){return e.length>0;})
	}
	// highlight segments in both the palette_mapper and the playhead
	// set one of these arguments as a list of ints, and the other as null, and it will figure out what to highlight
	this.highlight_all = function (segment_ids, palette_indices){
		//console.log("highlight_all", segment_ids, palette_indices)
		if(palette_indices == null){
			palette_indices = [];
		}
		
		if(segment_ids == null){
			segment_ids = [];
		}

		
			segment_ids = segment_ids.concat(flatten(_song.playhead_selections))
			
		

			palette_indices = palette_indices.concat(flatten(_song.palette_selections))
		

		// highlight the same segments in the other palette/playehad
		/*
		for(var s=0;s<segment_ids.length;s++){
			palette_indices.push(_song.palette_segments.indexOf(segment_ids[s]))
		}

		for(var p=0;p<palette_indices.length;p++){
			segment_ids.push(_song.palette_segments[palette_indices[p]])
		}*/

		segment_ids = unique(segment_ids)
		palette_indices = unique(palette_indices)

		_song.playhead.highlight(segment_ids)
		_song.palette_mapper.highlight(palette_indices)

		//console.log("hightlight", palette_indices)
	}

	// call this function whenever the parameters change
	this.update_rhythm = function(keep_old_segments){
		pattern = bjorklund(this.steps, this.pulses)
		old_segment_list = this.play_segment_list;
		os = 0; // counter for old_segment_list
		play_segment_list = []
		for(var p=0;p<pattern.length;p++){
        	if(this.fat_segments && pattern[p]==0){
           		play_segment_list[play_segment_list.length-1]["step_length"]++
           		if(this.palette_selections.length>1){
           			//play_segment_list[play_segment_list.length-1]["segment_id"] = this.from_palette(1)
           		}
        	}else{
        		if(!this.fat_segments && (this.palette_selections.length+this.playhead_selections.length) > 1) {
        			if(keep_old_segments && os<old_segment_list.length){
        				new_segment_id = old_segment_list[os].segment_id
        				os++
        			}else{
        				new_segment_id = this.from_palette(pattern[p]) // two or more selections? pick according to euclidean
        			}
        		}else{
        			if(keep_old_segments && os<old_segment_list.length){
        				new_segment_id = old_segment_list[os].segment_id
        				os++
        			}else{
        				new_segment_id = this.from_palette("all"); // else pick from the whole selection
        			}
        		}
        		seg = {"segment_id": new_segment_id, "step_length": 1}
        		
        		play_segment_list.push(seg)
        	}
		}
		this.play_segment_list = play_segment_list
		this.rhythm_display.draw(this.steps, play_segment_list)


         
	}

	// grabs a segment from all your selections
	this.from_palette = function(selection_id){
		//console.log("from_palette",selection_id)
		if(selection_id=="all"){
			pal = flatten(this.palette_selections)
			play = flatten(this.playhead_selections)
			//console.log("pal",pal,this.palette_selections, "play",play, this.playhead_selections)
			if(play.length>0 && pal.length==0){
				// if only playhead selections, pick from playhead
				ps = this.playhead_selections[Math.floor(Math.random()*this.playhead_selections.length)];
				segment_id = ps[Math.floor(Math.random()*ps.length)]
				//console.log(" pick from palyhead",ps,segment_id)
			}else if(pal.length>0 && play.length==0){
				// if only palette selections, pick from palette
				ps = this.palette_selections[Math.floor(Math.random()*this.palette_selections.length)];
				palette_index = ps[Math.floor(Math.random()*ps.length)]
				segment_id = this.palette_segments[palette_index]
				//console.log(" pick from palette",ps,palette_index,segment_id)
			}else{
				// if both selections, pick from a random selection
				total_selections = this.palette_selections.length + this.playhead_selections.length;
				if(Math.random() * total_selections <= this.palette_selections.length){ // randomly pick from palette or playhead
					// pick from palette
					ps = this.palette_selections[Math.floor(Math.random()*this.palette_selections.length)];
					palette_index = ps[Math.floor(Math.random()*ps.length)]
					segment_id = this.palette_segments[palette_index]
					//console.log("random pick from palette",ps,palette_index,segment_id)
				}else{
					// pick from playhead
					ps = this.playhead_selections[Math.floor(Math.random()*this.playhead_selections.length)];

					segment_id = ps[Math.floor(Math.random()*ps.length)]
					//console.log("random pick from play head",ps,segment_id)
				}
			}
		}else{
			// the lower selection_ids (starting from 0) come from palette.. the upper selection_ids come from playhead
			if(selection_id >= this.palette_selections.length + this.playhead_selections.length ){
				// selection_id is too high, so grab any segment
				return from_palette("all")
			}else if(selection_id >= this.palette_selections.length){
				play = this.playhead_selections[selection_id - this.palette_selections.length] // segment comes from playhead selection
				segment_id = play[Math.floor(Math.random()*play.length)]
			}else{
				ps = this.palette_selections[selection_id] // segment comes from palette selection
				palette_index = ps[Math.floor(Math.random()*ps.length)]
				segment_id = this.palette_segments[palette_index]
			}
		}
		//console.log("fromplaette_segment_id",segment_id)
		return segment_id

	}


    this.rhythmChange = function() {
      _song.steps = step_slider.getValue()
      _song.pulses = pulse_slider.getValue()
      if(_song.pulses> _song.steps){
          _song.pulses = _song.steps;
          $('#pulse_slider').slider({max: _song.steps})
      }

      
      var value = $('#pulse_slider').data('slider').getValue();
      if(!(_song.steps == 1 && _song.pulses == 1)) $('#pulse_slider').data('slider').max = _song.steps;
      $('#pulse_slider').slider('setValue', value);
      $('#GC').attr("style","width: "+(100 * (_song.steps-1)/max_euclidean_steps)+"%");
	  
    };

    this.tempoChange = function(){
        _song.tempo = log_tempo(tempo_slider.getValue())
        $("#ui-tempo").html(_song.tempo + " bpm")
    }



    var step_slider = $('#step_slider').slider()
            .on('slide', function(){_song.rhythmChange(); _song.update_rhythm(true)})
            .on('click', function(){  _song.replay_loop() })
            .data('slider');
    var pulse_slider = $('#pulse_slider').slider()
            .on('slide', function(){_song.rhythmChange(); _song.update_rhythm(true)})
            .on('click', function(){  _song.replay_loop() })
            .data('slider');
    var tempo_slider = $('#tempo_slider').slider()
            .on('slide', function(){_song.tempoChange(); _song.update_rhythm(true)})
            .data('slider');

    $('#RC').mouseup(function(){ _song.replay_loop() })
    $('#GC').mouseup(function(){ _song.replay_loop() })
    $('#BC').mouseup(function(){ _song.replay_loop() })


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
    	/*
    	num_segments = _song.palette_segments.length
    	selection_size = 25
    	selection_start = Math.floor(Math.random()* (num_segments - selection_size));
    	*/
    	//_song.palette_selections[0] = range(selection_start,selection_start+selection_size,1)
    	//console.log("huh",_song.palette_selections[0] , num_segments, selection_start,_song.palette_selections[0].length)
		//_song.highlight_all(null, _song.palette_selections[0])
		_song.update_rhythm(false)
		_song.play_list(_song.play_segment_list);
    }

    this.refresh_loop = function(){
		this.update_rhythm(false);
		_song.play_list(_song.play_segment_list);
    }

    this.replay_loop = function(){
    	_song.play_list(_song.play_segment_list)
    }

    this.load_loop = function(loop){
    	console.log("load loop", loop.layer,  loop)
    	$('#tempo_slider').slider('setValue',ilog_tempo(loop.tempo));
    	this.tempoChange()

    	$('#step_slider').slider('setValue',loop.steps);
    	this.rhythmChange()
    	$('#pulse_slider').slider('setValue',loop.pulses);
		this.rhythmChange()

		_song.chaos = loop.chaos;
		_song.flows = loop.flows;
		_song.forever = loop.forever;
		_song.layer = loop.layer;
		if(!song.layer) song.layer = "on earth"
	 	updateLoopOptions(_song);

    	_song.palette_selections = loop.palette_selections
    	_song.playhead_selections = loop.playhead_selections
    	_song.highlight_all(null,null)
		//_song.update_rhythm(false)
		
		_song.play_segment_list = loop.play_segment_list

		this.rhythm_display.draw(loop.steps, loop.play_segment_list)
		_song.play_list(loop.play_segment_list)
		

    }

    this.save_loop = function(){

    	loop = new Loop(song = this, 
    		tempo = log_tempo(tempo_slider.getValue()), 
    		steps = step_slider.getValue(), 
    		pulses = pulse_slider.getValue(), 
    		playhead_selections = _song.playhead_selections,
    		palette_selections = _song.palette_selections,
    		play_segment_list = _song.play_segment_list,
    		chaos = _song.chaos,
    		flows = _song.flows,
    		forever = _song.forever,
    		layer = _song.layer);

    	console.log("saved loop", loop)
    	return loop 

    }

    this.addVideo = function(video_url){
    	$("#video-container").html('<div style="padding-top: 15px">\
        	<video src="'+video_url+'" id="video" width="100%" preload="auto"/> \
    		</div>');
    	$("#video-container").show();
    	console.log("added video" + video_url);
    	this.have_video = true;

    }

	this.pauseVideo = function(){
		$("#video")[0].pause();
	}

    /**  SOUND!! **/
    
	var sound = new load_sound(mp3, function(){
		console.log("Finished loading MP3");
		_song.sound_loaded = true
		$("#loading-audio").hide();
		$("#playhead-and-palette").show();
		console.log("savedLoops", savedLoops)
		if(Object.keys(savedLoops).length>0){
			$(".keyboard").show();
		}

	})
	sound.init();
	this.sound = sound
	this.play = function(w,s,d, segment_id, callback, gain, layer){
		//console.log("this.play",layer);
		this.sound.play(w,s,d, segment_id, callback,gain, layer)
	};

	// function gets called at beginning of every audio segment
	this.reactToSegment = function(segment_id){
		hue = _song.palette_hues[_song.palette_segments.indexOf(segment_id)];
		start_time = _song.segments[segment_id].start;

		// makes the "Crowd Remix" logo thing glow
		$(".navbar-brand").css("color",rgbCode(hslToRgb(hue, 0.8, 0.5)))

		color = hslToRgb(hue, 1.0, 0.5)
		midiColor(Math.floor(color[0]/2), Math.floor(color[1]/2), Math.floor(color[2]/2))

		if(_song.have_video){
			$("#video").css("-webkit-filter", "sepia(100%) hue-rotate("+(hue*360-60)+"deg) saturate(10)")
			$('#video')[0].currentTime = start_time;
			$('#video')[0].play();
			$("#video")[0].volume = 0;
			//console.log(hue, start_time);
		}

		if(_song.parameters_changed){
			//_song.parameters_changed = false
			//this.play_list(_song.play_segment_list)
		}
	}

	// next segment plays whenever previous segment ends
	this.play_flows = function(s){
		if(this.chaos == "chaos"){	
			segment_id = this.from_palette("all")
			// update visual segments
		}else{ // normal
			segment_id = this.play_segment_list[s].segment_id
		}
		//console.log("this",this)

		//console.log("s",s,"segment_id",segment_id,"chaos",this.chaos,"forever", this.forever)
		segment = this.segments[segment_id]
		step_duration =  60 / this.tempo / this.steps * this.play_segment_list[s].step_length;
		// create event to trigger when sample starts

		this.play(0, 0, 0.0001, segment_id, this.reactToSegment, 0, this.layer)

		this.play(0, segment.start, step_duration, segment_id, function(old_segment_id){
			
			s = s + 1
			//console.log("--","s",s,"play_segment_list",song.play_segment_list,song.play_segment_list.length,"forever",this.forever)
			if(s == _song.play_segment_list.length){
				if(_song.forever == "forever"){
					_song.play_flows(0);
				}else if(_song.forever =="once"){
					// nothing, that's it. we're done.
				}else if(_song.forever == "and so on"){
					// play the rest of the song
					final_segment = _song.segments[_song.segments.length-1]
					final_time = final_segment.start + final_segment.duration
					begins = segment.start+step_duration
					duration = final_time - begins
					_song.play(0, begins, duration, 0, null, 1);
				}
			}else{
				_song.play_flows(s);
			}
		}, 1, layer)
	}

	// called when settings change, or when sampler key is pressed
	this.play_list = function(play_segment_list){
		if(this.no_actions_yet){ // the first time the user does anything, show rhythm controls
			showMore();
			console.log("floop")
			this.no_actions_yet = false;
		}
		//console.log("play_list", this.sound_loaded)
		if(this.sound_loaded){
			/*this.stop_audio()
			var then = 0
			
			if(this.flows == "flows"){
				//this.play_flows(0)  
				// this way sounds shitty
			}else{

			}
			
			step_size =  60 / this.tempo / this.steps;
			var seg = 0;
			for(var step=0;step<this.steps;step++){

				segment_id = play_segment_list[seg].segment_id
				segment = this.segments[segment_id]

				if(play_segment_list[seg].step_length == 1)

				step_duration = step_size * play_segment_list[seg].step_length;		

				// create event to trigger when sample starts
				this.play(Math.max(0,then - this.latency), 0, 0.0001,segment_id,this.reactToSegment,0)

				this.play(then, segment.start, step_duration, segment_id, null, 1 )
				
				then += step_duration		
			}*/

			///*
			// old way: sounds good, but needs to be more flexible
			if(this.layer == "in space"){
				// stop nothing
			}else if(this.layer == "on earth"){
				this.stop_audio("on earth");
			}else if(this.layer == "on neptune"){
				this.stop_audio("on neptune");
			}else{
				this.stop_audio();
			}
			then = 0
			//console.log("play_segment_list", play_segment_list)
			if(this.forever == "forever"){
				num_loops = globalForeverLoops || 32; // not **really** forever, but we should fix that
			}else{
				num_loops = 1;
			}

			for(var loops=0;loops<num_loops;loops++){
				for(var s=0;s<play_segment_list.length;s++){
					if(this.chaos == "chaos"){
						segment_id = this.from_palette("all")
					}else{
						segment_id = play_segment_list[s].segment_id
					}
					segment = this.segments[segment_id]

					step_duration =  60 / this.tempo / this.steps * play_segment_list[s].step_length;

					// create event to trigger when sample starts
					this.play(then-this.latency, 0, 0.0001,segment_id,this.reactToSegment,0, this.layer)
					if(this.flows == "flows"){//step_duration <= segment.duration){
						this.play(then, segment.start, step_duration, segment_id, null, 1, this.layer)
					}else{ // this is for if you want to just play video segments one at a time, without keeping playing. Its kinda ugly
						this.play(then, segment.start, segment.duration, segment_id, null, 1, this.layer)
					}

					//console.log("this.play", segment.start, step_duration)
					then += step_duration
				}
				
			}
			if(this.forever == "and so on"){
				this.play(then, segment.start + segment.duration, 999999, 0, null, 1, this.layer)
			}
		}
	}

	this.stop_audio = function(layer){
		console.log("stop audio", layer);
		try{
			if(layer==undefined){
				this.sound.stopAll(0)
			}else{
				this.sound.stopLayer(0,layer)
			}
		}catch(e){
			console.log("error stopping audio", e)
		}
	}

	// take a loop, export as WAV file
    this.export_wav = function(loop){
    	console.log("exporting wav", loop)
    	loop.get_samples(function(buffer){
    		var interleaved = interleave(buffer.getChannelData(0), buffer.getChannelData(1))
    		var dataview = encodeWAV(interleaved);
			var audioBlob = new Blob([dataview], { type: 'audio/wav' });
			forceDownload(audioBlob, "cr_" + _song.song_title+".wav");
    	})
    }

	this.init();

}



function json_neon_loops(savedLoops){
	neon_loops = []
	for (var key in savedLoops){
		neon_loops.push(savedLoops[key].neon_loop());
	}
	return JSON.stringify({"tempo": song.tempo, "loops": neon_loops})
}

function Loop (song, tempo, steps, pulses, playhead_selections, palette_selections, play_segment_list, chaos, flows ,forever, layer){
	this.song = song
	this.tempo = tempo
	this.steps = steps
	this.pulses = pulses
	this.playhead_selections = playhead_selections
	this.palette_selections = palette_selections
	this.play_segment_list = play_segment_list
	this.chaos = chaos
	this.flows = flows
	this.forever = forever
	this.layer = layer

	this.json_loop = function(){
		var tmp_song = this.song;
		this.song = null;
		var jsonstring = JSON.stringify(this);
		this.song = tmp_song;
		return jsonstring;
	}

	this.neon_loop = function(){
    	var segments = [];
    	for(var i=0;i<this.play_segment_list.length;i++){
    		var s = this.play_segment_list[i]
    		var segment = {
    			"start": this.song.segments[s.segment_id].start,
    			"duration": 60 / this.tempo / this.steps * s.step_length,
    		};
    		segments.push(segment);
    	}

    	return segments
    }

    this.draw_key = function(song, key_id){

		gradient = []
		p = 0 // position in percent
		for(var s=0;s<this.play_segment_list.length;s++){
			step_length = this.play_segment_list[s].step_length;
			percent_length = step_length / this.steps * 100
			segment_id = this.play_segment_list[s].segment_id;
			hue = song.palette_hues[song.palette_segments.indexOf(segment_id)]

			c1 = rgbCode(hslToRgb(hue, 1.0, 0.7))
			c2 = rgbCode(hslToRgb(hue, 1.0, 0.85))
			//console.log(hue, play_segment_list, play_segment_list[s], play_segment_list[s].segment_id, _song.palette_segments.indexOf(play_segment_list[s].segment_id))
			gradient.push(c1+' '+p+'%');
			gradient.push(c2+' '+(p+percent_length)+'%');
			p+=percent_length;
		}

		gradient = gradient.join(',');

		//console.log("key_id",key_id)
		//console.log("$",$(key_id))
		//console.log("gradient","background-image","linear-gradient(to right, "+gradient+")")
		$(key_id).css("background-image","linear-gradient(to right, "+gradient+")")

		if(this.layer == "on earth") bordertype = "2px dotted";
		else if(this.layer == "on neptune") bordertype = "2px dashed";
		else bordertype = "2px outset"
		$(key_id).css("border",bordertype)

	}

	this.get_samples = function(callback){
		//console.log("play_segment_list", this.play_segment_list)
		var then = 0;
		var extra_seconds = 0;
		if(this.chaos == "chaos"){
			num_loops = 8; // do a few copies of the loop on export
		}else{
			num_loops = 1;
		}
		if(this.forever == "and so on"){
			extra_seconds = 5;
		}

		var total_duration = 60 / this.tempo

		var offline = new webkitOfflineAudioContext(song.sound.source.buffer.numberOfChannels,
			(total_duration*num_loops + extra_seconds)*song.sound.source.buffer.sampleRate,
			song.sound.source.buffer.sampleRate)
		
		console.log(num_loops);
		for(var loops=0;loops<num_loops;loops++){
			for(var s=0;s<this.play_segment_list.length;s++){
				if(this.chaos == "chaos"){
					segment_id = song.from_palette("all");
				}else{
					segment_id = this.play_segment_list[s].segment_id
				}
				segment = song.segments[segment_id]

				step_duration =  60 / this.tempo / this.steps * this.play_segment_list[s].step_length;
				loop_buffer = offline.createBufferSource();
				loop_buffer.buffer = song.sound.source.buffer;
				loop_buffer.connect(offline.destination);

				if(this.flows == "flows"){
					loop_buffer.start(then, segment.start, step_duration );
				}else{
					loop_buffer.start(then, segment.start, segment.duration )
				}
				
				//console.log(then, segment, segment_id ,step_duration, loop_buffer)
				then += step_duration

			}

		}
		if(this.forever == "and so on"){
			loop_buffer.start(then, segment.start + segment.duration, extra_seconds) // add 4 seconds of the original song at the end
		}

		offline.startRendering();
		offline.oncomplete = function( ev ){
		  console.log("complete", ev);
		  callback(ev.renderedBuffer);
		}
		console.log("rendering..")
	
	}
}


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


$(".navbar-brand").click(function(){$(".hidethis").css("display","none")})













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



function log_tempo(zero_to_hundred){
	return Math.round(10 * Math.pow(2,1 + (zero_to_hundred/100 * 4)))
}
function ilog_tempo(bpm){
	return ((Math.log(bpm/10)/Math.log(2) - 1)/4*100)
}


