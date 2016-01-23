<?php 
        $json = stripslashes( $_POST["jsonstring"]);
        //print_r($json);
        $jsond = json_decode($json);

        $song_url = $jsond->song_url;
        $segments_palette = json_encode($jsond->segments_palette);
        $song_artist = $jsond->artist;
        $song_name  = $jsond->title;

        ?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="shortcut icon" href="favicon.png">

    <title>Crowd Remix</title>

    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.css" rel="stylesheet">
    <!-- Bootstrap theme -->
    <link href="css/bootstrap-theme.min.css" rel="stylesheet">

    <!-- Custom styles for this template -->
    <link href="css/theme.css" rel="stylesheet">

    <!-- bootstrap slider -->
    <link href="css/slider.css" rel="stylesheet">

    <style>

    .playhead { width: 100%; height: 100%; position: absolute; top: 0px;  } 
    .amplitude { border: 0px solid #999; }
    .no-amplitude { border: 2px solid #999; }

    .playhead-container { height: 50px; position: relative; cursor:crosshair}

    .palette-mapper { width: 100%; height: 100%; border: 2px solid #999; position: absolute; top: 0px;  } 
    .palette-mapper-container { height: 50px; position: relative; cursor:crosshair; margin-top: -1px;}

    /* .rhythm-display { width: 100%; height: 100%; border: 2px solid #999; position: absolute; top: 0px;  }  */
    .rhythm-display-container {  width: 302px; height: 10px; position: relative;}

    .song-title { color: #999;}

    #RC .slider-selection {
      background: #FF8282;
    }
    #RC .slider-handle {
      background: red;
    }
    #GC .slider-selection {
      background: #428041;
    }
    #GC .slider-handle {
      background: green;
    }
    #BC .slider-selection {
      background: #8283FF;
    }
    #BC .slider-handle {
      border-bottom-color: blue;
    }
    #step_slider, #pulse_slider, #tempo_slider {
      width: 335px;
    }
    .progress{ margin-bottom: 10px; }
    #rhythm-display { cursor: move} 

    .dropdown-menu a { cursor: pointer;}

    .hidethis { display: block;}
    .showthis { display: none ;}

    #playhead-and-palette { display: none;}

    #loop-list { display: none;}

    #song-search-query { width: 400px; }
    #song-search-query { background-color: #555; color:#fff; border: #bbb;}
    #song-search-list { background-color: #444; color:#ccc; border: #bbb;}
    #song-search-list { max-height: 300px; overflow-y: scroll;}
    #song-search-list li,  #song-search-list div { padding: 10px; font-size: 1.3em;}
    #song-search-list li:hover { background-color: #555; cursor:pointer;}

    .btn-label { background-color: #eee;}
    </style>

    <!-- Just for debugging purposes. Don't actually copy this line! -->
    <!--[if lt IE 9]><script src="../../docs-assets/js/ie8-responsive-file-warning.js"></script><![endif]-->

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
    <![endif]-->
  </head>


  <body id="thebody">

    <!-- Fixed navbar -->
    <div class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar">h</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <span class="navbar-brand" href="#">Crowd Remix</a>
        </div>

        <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
         <!-- <ul class="nav navbar-nav">
           <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown <b class="caret"></b></a>
            <ul class="dropdown-menu">
              <li><a href="#">Action</a></li>
              <li><a href="#">Another action</a></li>
              <li><a href="#">Something else here</a></li>
              <li class="divider"></li>
              <li><a href="#">Separated link</a></li>
              <li class="divider"></li>
              <li><a href="#">One more separated link</a></li>
            </ul>
          </li>
         </ul>-->


          <div class="navbar-form navbar-right" role="search">
            <div class="form-group">
              <input type="text" class="form-control" id="song-search-query" autocomplete='off' placeholder="Pick a new song">
            </div>
            <button class="btn btn-default" id="song-search-button" style="display:none">Search</button>
            <div id="song-search-dropdown" class="dropdown">
            <ul class="dropdown-menu" id="song-search-list">
              <li><a href="">Beatles betshfdk jfhkg jdgh kdsfgjhdfsk h</a></li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    



    </div>

    <div class="container theme-showcase">

 

      <!-- Main jumbotron for a primary marketing message or call to action -->
      
      <div class="jumbotron" id="topMessage" >
        <div style="position: relative">
          <div style="position: absolute; top:-50px; right:-50px">
            <a style="cursor:pointer" onclick="$('#topMessage').hide()">[hide]</a>
          </div>
        </div>

        <p><h3>This is a music video remixer. </h3>
          <ol><li>Click + drag a portion of the song, or its 
      <span style="color:#b04444;">s</span><span style="color:#dd4444;">o</span><span style="color:#dd8c44;">u</span><span style="color:#ddb744;">n</span><span style="color:#cccc22;">d</span><span style="color:#ffd744;">&nbsp;</span><span style="color:#44cc44;">p</span><span style="color:#40b0a0;">a</span><span style="color:#44cccc;">l</span><span style="color:#4444cd;">e</span><span style="color:#444480;">t</span><span style="color:#804480;">t</span><span style="color:#996299;">e</span>. New sounds! </li>
            <li> Adjust the <b>rhythm</b>.</li>
            <li> Save good loops by <i>pressing any key.</i></li>
            <li> Return to loops using <i>those keys.</i> Play this like a sampler!</li></ol> </p>
     </div>

     <div class="row">

          <div class="col-md-8" id="leftColumn">

<div style="position: relative">
          <div style="position: absolute; top:0px; right:0px" id="hideshow-rhythm">
            <a style="cursor:pointer" onclick="showLess()" class="hidethis">[show less]</a>
            <a style="cursor:pointer" onclick="showMore()" class="showthis">[show more]</a>

          </div>
        </div>

                    <h1 style="margin-top: 0px" >
                    <span id="artist-name"></span>
                    <span id="song-title" class="song-title"></span></h1>

              <div id="playhead-and-palette">
                     <div id="playhead-container" class=" playhead-container" >   
                    <canvas id="playhead" class="playhead"></canvas>  
                    <canvas id="playhead-highlight" class="playhead"></canvas>  
                  </div>  


                  <div id="palette-mapper-container" class="palette-mapper-container">   
                      <canvas id="palette-mapper" class="palette-mapper"></canvas>  
                      <canvas id="palette-mapper-highlight" class="palette-mapper"></canvas>  
                    </div>  
              </div>

              <div id="loading-audio" style="text-align: center">
                  <div style="color: #ccc; font-size: 2.2em; margin: 38px">loading audio <img src="http://www.vale.com/EN/aboutvale/initiatives/itabiritos/PublishingImages/ProjetoItabiritos/loading.gif"></div>
              </div>



<div class="keyboard">
            <section>
                <div class="row">
                    <div id="key_accent" class="key"><em>~</em><br><strong>`</strong></div>
                    <div id="key_one" class="key"><em>!</em><br><strong>1</strong></div>
                    <div id="key_two" class="key"><em>@</em><br><strong>2</strong></div>
                    <div id="key_three" class="key"><em>#</em><br><strong>3</strong></div>
                    <div id="key_four" class="key"><em>$</em><br><strong>4</strong></div>
                    <div id="key_five" class="key"><em>%</em><br><strong>5</strong></div>
                    <div id="key_six" class="key"><em>^</em><br><strong>6</strong></div>
                    <div id="key_seven" class="key"><em>&</em><br><strong>7</strong></div>
                    <div id="key_eight" class="key"><em>*</em><br><strong>8</strong></div>
                    <div id="key_nine" class="key"><em>(</em><br><strong>9</strong></div>
                    <div id="key_zero" class="key"><em>)</em><br><strong>0</strong></div>
                    <div id="key_hyphen" class="key"><em>_</em><br><strong>-</strong></div>
                    <div id="key_equals" class="key"><em>+</em><br><strong>=</strong></div>
                    <div id="key_backspace" class="key wide_2"><span class="right"><strong>backspace</strong></span></div>
                </div>
                <div class="row">
                    <div id="key_tab" class="key wide_2"><span class="left"><strong>tab</strong></span></div>
                    <div id="key_q" class="key single"><strong>Q</strong></div>
                    <div id="key_w" class="key single"><strong>W</strong></div>
                    <div id="key_e" class="key single"><strong>E</strong></div>
                    <div id="key_r" class="key single"><strong>R</strong></div>
                    <div id="key_t" class="key single"><strong>T</strong></div>
                    <div id="key_y" class="key single"><strong>Y</strong></div>
                    <div id="key_u" class="key single"><strong>U</strong></div>
                    <div id="key_i" class="key single"><strong>I</strong></div>
                    <div id="key_o" class="key single"><strong>O</strong></div>
                    <div id="key_p" class="key single"><strong>P</strong></div>
                    <div id="key_left_bracket" class="key"><em>{</em><br><strong>[</strong></div>
                    <div id="key_right_bracket" class="key"><em>}</em><br><strong>]</strong></div>
                    <div id="key_backslash" class="key"><em>|</em><br><strong>\</strong></div>
                </div>
                <div class="row">
                    <div id="key_caps_lock" class="key wide_3"><span class="left"><strong>caps lock</strong></span></div>
                    <div id="key_a" class="key single"><strong>A</strong></div>
                    <div id="key_s" class="key single"><strong>S</strong></div>
                    <div id="key_d" class="key single"><strong>D</strong></div>
                    <div id="key_f" class="key single"><strong>F</strong></div>
                    <div id="key_g" class="key single"><strong>G</strong></div>
                    <div id="key_h" class="key single"><strong>H</strong></div>
                    <div id="key_j" class="key single"><strong>J</strong></div>
                    <div id="key_k" class="key single"><strong>K</strong></div>
                    <div id="key_l" class="key single"><strong>L</strong></div>
                    <div id="key_semicolon" class="key"><em>:</em><br><strong>;</strong></div>
                    <div id="key_apostrophe" class="key"><em>"</em><br><strong>'</strong></div>
                    <div id="key_enter" class="key wide_3"><span class="right"><strong>enter</strong></span></div>
                </div>
                <div class="row">
                    <div id="key_left_shift" class="key wide_4"><span class="left"><strong>shift</strong></span></div>
                    <div id="key_z" class="key single"><strong>Z</strong></div>
                    <div id="key_x" class="key single"><strong>X</strong></div>
                    <div id="key_c" class="key single"><strong>C</strong></div>
                    <div id="key_v" class="key single"><strong>V</strong></div>
                    <div id="key_b" class="key single"><strong>B</strong></div>
                    <div id="key_n" class="key single"><strong>N</strong></div>
                    <div id="key_m" class="key single"><strong>M</strong></div>
                    <div id="key_comma" class="key"><em>&lt;</em><br><strong>,</strong></div>
                    <div id="key_period" class="key"><em>&gt;</em><br><strong>.</strong></div>
                    <div id="key_forwardslash" class="key"><em>?</em><br><strong>/</strong></div>
                    <div id="key_right_shift" class="key wide_4"><span class="right"><strong>shift</strong></span></div>
                </div>
                <div class="row">
                    <div id="key_left_ctrl" class="key wide_1"><span class="left"><strong>ctrl</strong></span></div>
                    <div id="key_left_alt" class="key wide_1"><span class="left"><strong>alt</strong></span></div>
                    <div id="key_left_cmd" class="key wide_1"><span class="left"><strong>cmd</strong></span></div>
                    <div id="key_space" class="key wide_5"></div>
                    <div id="key_right_cmd" class="key wide_1"><span class="right"><strong>cmd</strong></span></div>
                    <div id="key_right_alt" class="key wide_1"><span class="right"><strong>alt</strong></span></div>
                    <div id="key_right_ctrl" class="key wide_1"><span class="right"><strong>ctrl</strong></span></div>
                </div>
                <p class="message">
                    &nbsp;
                </p>
            </section>
          </div>







      <div class=" " style="padding-top: 15px">
        

                    <video src="sounds/glitches-RGB-360p.mp4" id="video" width="100%" preload='auto'/>     

                  <script>
                    video = document.getElementById("video");

                    video.addEventListener("canplaythrough", function () {
                        console.log("canplaythrough");
                    }, false);
                  </script>
     </div>



          </div>



    <div class="col-md-4 hidethis" style="padding-right: 0px; padding-left: 0px; width: 375px">


        <div style="clear: both">
          <p>
            <b>Tempo</b> <span style="float: right;" id="ui-tempo"></span> <input type="text" class="span2" value="" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="50" data-slider-id="BC" id="tempo_slider" data-slider-tooltip="hide" data-slider-handle="triangle" >
          </p>
        </div>


      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title">
            Glitchbeat                <!-- Single button -->
          
          </h3>
        </div>
        <div class="panel-body" >
          <!-- <div id="rhythm-mapper-container" class="rhythm-mapper-contahiner">   
            <<canvas id="rhythm-mapper" class="rhythm-mapjper"></canvas>  
            <canvas id="rhythm-mapper-highlight" class="rhythjm-mapper"></canvas>  
          </div> -->



          <p>
            <b></b>  <span style="float: right" id="ui-steps"></span> <input type="text" class="span2" value="" data-slider-min="1" data-slider-max="16" data-slider-step="1" data-slider-value="8" data-slider-id="RC" id="step_slider" data-slider-tooltip="hide" data-slider-handle="square" >
          </p>
          <p>
            <b></b>  <span style="float: right" id="ui-pulses"></span> <input type="text" class="span2" value="" data-slider-min="1" data-slider-max="16" data-slider-step="1" data-slider-value="3" data-slider-id="GC" id="pulse_slider" data-slider-tooltip="hide" data-slider-handle="round" >
          </p>

            



          <div style="margin-top: 10px">
              <div style="float: left; width: 30px; margin-top: -3px">
                  <button type="button" class="btn btn-default btn-med" id="refreshLoopButton" style="padding: 2px 4px 0px 4px">
                    <span class="glyphicon glyphicon-refresh"></span>
                  </button>
              </div>
              <div style="float: left; width: 307px">
                <div style="height: 0px; margin-bottom: 0px"></div>
                <div class="progress" id="rhythm-display" >
                  
                </div>
              </div>
            </div>



<!-- Single button -->
<div class="btn-group" id="gb-orderchaos">
  <button type="button" class="btn btn-default menulabel">Order</button>
  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
    <span class="caret"></span>
    <span class="sr-only">Toggle Dropdown</span>
  </button>
  <ul class="dropdown-menu dropdown-menu-right pull-right" role="menu">
    <li><a id="gb-chaos">Chaos (randomized segments)</a></li>
    <li><a id="gb-order">Order (segments don't change)</a></li>
  </ul>
</div>


<div class="btn-group" id="gb-gapsflows">
  <button type="button" class="btn btn-default menulabel">Stretches</button>
  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
    <span class="caret"></span>
    <span class="sr-only">Toggle Dropdown</span>
  </button>
  <ul class="dropdown-menu dropdown-menu-right pull-right" role="menu">
    <li><a id="gb-gaps">Gaps (silence is added between segments)</a></li>
    <li><a id="gb-flows">Flows (instead of silence, the song continues on)</a></li>
    <li class="disabled"><a id="gb-stretches">Stretches (segment is time-stretched to fit)</a></li>
  </ul>
</div>

<div class="btn-group" id="gb-onceforever">
    <button type="button" class="btn btn-default menulabel">Once...</button>
  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
    <span class="caret"></span>
    <span class="sr-only">Toggle Dropdown</span>
  </button>
  <ul class="dropdown-menu dropdown-menu-right pull-right" role="menu">
    <li><a id="gb-forever">Forever (loop loops forever)</a></li>
    <li><a id="gb-once-silence">Once! (beat plays once, then silence)</a></li>
    <li><a id="gb-once-continue">Once... (beat plays once, then song continues on)</a></li>
  </ul>
</div>




  <div style="margin-top: 5px">

          <span class="btn-group" style="float: right">
            <!-- <button type="button" class="btn btn-warning" id="saveLoop">
              Save Loop
            </button> -->

            <button type="button" class="btn btn-success" id="saveToWav">
              Export WAV
            </button>
          </span>
        </div>
</div>
          <!-- 
          <div id="draggable5" class="draggable ui-widget-content">
            <p>X</p>
          </div>
          -->

        </div>


<div class="panel panel-default" id="loop-list">
        <div class="panel-heading">
          <h3 class="panel-title">
            Loops
          </h3>
        </div>
        <div class="panel-body" >
          <div id="loop-container" >   


          </div>



        </div>

        
      </div>



    </div> <!-- /container -->
</div>
</div>
      
     <!-- <ul class="nav nav-tabs" style="margin-bottom: 10px">
        <li class="active">
          <a href="#song1" data-target="#song1, #home_help" data-toggle="tab"><span id="song-title"></span></a>
        </li>
        <li>
          <a href="#song2" data-target="#song2, #profile_help" data-toggle="tab"></a>
        </li>
      </ul>-->


  

    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>

    <script src="http://code.jquery.com/ui/1.10.4/jquery-ui.js"></script>
    <script src='https://cdn.firebase.com/v0/firebase.js'></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/holder.js"></script>

    <script src="js/draw-song_newaudio.js"></script>
    <script src="js/soundengine_new.js"></script>
    <script src="js/bjorklund.js"></script>

    <script src="js/bootstrap-slider.js"></script>

    <script>  
      var song = null;
      var savedLoops = {}
      $(function init(){
        showLessInit();

   

        song_file = "<?=$song_url?>";
        data = <?=$segments_palette?>;

        song_name = "<?=$song_name?>"
        song_artist = "<?=$song_artist?>"



        $("#artist-name").html(song_artist)
        $("#song-title").html(song_name)

    //  console.log("Segments",data["segments"])
         song = new Song(0,[song_file],song_name,song_artist,data.segments,{"hues":data.palette_hues,"segment_ids":data.segment_ids});
     // console.log("song",song)
          //song.randomize_parameters()
          //song.load_loop(new Loop(song, 50,8,5,[],[],[]))

          //console.log("song", Song)

          song.have_video = false
          $("#video").hide()
          //$("#video").attr("src",song_video)
       

        /*
        $( "#draggable5" ).draggable({ grid: [ 10,10 ],
        containment: "parent",
        drag: function(){
          return true

        } });*/


        /** Loop options **/


        function updateLoopOptions(song){
          if(song.chaos=="chaos"){
            $("#gb-orderchaos .menulabel").html("Chaos")
            $("#gb-orderchaos button").removeClass("btn-default").removeClass("btn-primary").addClass("btn-danger")
          }else{
            $("#gb-orderchaos .menulabel").html("Order")
            $("#gb-orderchaos button").removeClass("btn-default").removeClass("btn-danger").addClass("btn-primary")
          }
          if(song.flows=="flows"){
            $("#gb-gapsflows .menulabel").html("Flows")
            $("#gb-gapsflows button").removeClass("btn-default").removeClass("btn-warning").addClass("btn-primary")
          }else{
            $("#gb-gapsflows .menulabel").html("Gaps")
            $("#gb-gapsflows button").removeClass("btn-default").removeClass("btn-primary").addClass("btn-warning")
          }
          if(song.forever=="forever"){
            $("#gb-onceforever .menulabel").html("Forever")
            $("#gb-onceforever button").removeClass("btn-default").removeClass("btn-primary").removeClass("btn-warning").addClass("btn-success")
          }else if(song.forever=="once-continue"){
            $("#gb-onceforever .menulabel").html("Once...")
            $("#gb-onceforever button").removeClass("btn-default").removeClass("btn-success").removeClass("btn-warning").addClass("btn-primary")
          }else {
            $("#gb-onceforever .menulabel").html("Once!")
            $("#gb-onceforever button").removeClass("btn-default").removeClass("btn-success").removeClass("btn-primary").addClass("btn-warning")
          }
        }


        $("#gb-orderchaos .menulabel").click(function(){
          if(song.chaos=="chaos"){
              song.chaos = "order"
          }else{
              song.chaos = "chaos"
          }
          updateLoopOptions(song)
        })
        $("#gb-gapsflows .menulabel").click(function(){
          if(song.flows=="gaps"){
              song.flows = "flows"
          }else{
              song.flows = "gaps"
          }
          updateLoopOptions(song)
        })
        $("#gb-onceforever .menulabel").click(function(){
          if(song.forever=="forever"){
              song.forever = "once-silence"
          }else if(song.forever=="once-silence"){
              song.forever = "once-continue"
          }else{
              song.forever = "forever"
          }
          updateLoopOptions(song)
        })

        $("#gb-chaos").click(function(){
          song.chaos = "chaos"
          updateLoopOptions(song)
        })
        $("#gb-order").click(function(){
          song.chaos = "order"
          updateLoopOptions(song)
        })
        $("#gb-flows").click(function(){
          song.flows = "flows"
          updateLoopOptions(song)
        })
        $("#gb-gaps").click(function(){
          song.flows = "gaps"
          updateLoopOptions(song)
        })
        $("#gb-forever").click(function(){
          song.forever = "forever"
          updateLoopOptions(song)
        })
        $("#gb-once-continue").click(function(){
          song.forever = "once-continue"
          updateLoopOptions(song)
        })
        $("#gb-once-silence").click(function(){
          song.forever = "once-silence"
          updateLoopOptions(song)
        })
        updateLoopOptions(song)

        /*** SEARCH FOR NEW SONG ***/
        /** borrowing Paul Lemere's code from Infinite Juke Box **/
                
        $("#song-search-button").click(function(){
            searchForTrack("#song-search-query","#song-search-list")
        });


        $("#song-search-query").keyup(function(e) {
           if (e.keyCode == 13) {
            searchForTrack("#song-search-query","#song-search-list");
            }
        });

        $("#song-search-query").focusout(function(e){
          console.log("focusout")
          setTimeout(function(){ console.log("close"); $("#song-search-dropdown").removeClass("open"); },1)
        })

        var selectedSongs = [];

        function searchForTrack(searchBarId, listId) {
            console.log("search for a track");
            var q = $(searchBarId).val();
            console.log(q);

            if (q.length > 0) {
                var url = 'http://labs.echonest.com/Uploader/search'
                $.getJSON(url, { q:q, results:50}, function(data) {
                    console.log(data);
                    for (var i = 0; i < data.length; i++) {
                        data[i].id = data[i].trid;
                    }

                    listTracks(listId, data);
                });
            }
        }

        function listTracks(listId, tracks) {
            $('#song-search-dropdown').addClass('open');
            $(listId).empty();
            if(tracks.length == 0){
              $(listId).append("<div>Nothing found</div>")
            }else{
              for (var i = 0; i < tracks.length; i++) {
                  var s = tracks[i];
                  var item = listSong(s);
                  if (item) {
                      $(listId).append(item);
                  }
              }
            }
        }

          /*
        function showSelection() {
            $("#selected-list").empty();
            for (var i = 0; i < selectedSongs.length; i++) {
                var r = selectedSongs[i];
                var title = getTitle(r.title, r.artist, null);
                var li = $("<li>");
                li.text(title);
                $("#selected-list").append(li);
            }
            if (selectedSongs.length == 2) {
                $("#go").show();
            }
        }*/

        function listSong(r) {
            var title = getTitle(r.title, r.artist, null);
            var item = null;
            if (title) {
                var item = $('<li>').append(title);

                item.attr('class', 'song-link');
                item.mousedown(function() {
                        console.log(r);
                        console.log("redirecting")
                        if ('id' in r) {
                            document.location = "go.html?trid=" + r.id;
                        } else {
                            document.location = "go.html?trid=" + r.trid;
                        }
                    });
            } 
            return item;
        }

        function getTitle(title, artist, url) {
            if (title == undefined || title.length == 0 || title === '(unknown title)' || title == 'undefined') {
              title = null;
            } else {
              if (artist !== '(unknown artist)') {
                title = title + ' by ' + artist;
              } 
            }
            return title;
        }



        // keyboard commands
        $( "#thebody" ).keydown(function( event ) {
          if($("#song-search-query").is(":focus")){
              return;
          }else{
            /*if ( event.which == 13 ) {
             event.preventDefault();
            }*/
            var k = event.keyCode;
            if(k>=65 && k<=90){
              console.log(k)
              if(k in savedLoops){
                if(event.shiftKey){
                  loop = song.save_loop(); // save new loop
                 // loop.rhythm_container = new RhythmDisplay("rhythm-display-"+k);
                 // savedLoops[k].rhythm_container.draw(loop.steps, loop.play_segment_list) // update old display
                  if(loop.play_segment_list.length>0){
                    savedLoops[k] = loop // overwrite old loop with new 
                    song.addToLoopList(loop,k)
                  }
                }else{
                  song.load_loop(savedLoops[k])
                }
              }else{
                loop = song.save_loop();

                if(loop.play_segment_list.length>0){
                  savedLoops[k] = loop
                  song.addToLoopList(loop,k)
                }
              }
            }
          }
        });

        // save to wav
        $("#saveToWav").click(function(event){
          loop = song.save_loop();
          song.export_wav(loop);
        });

        $("#refreshLoopButton").click(function(event){
          song.refresh_loop();
        });

        $("#rhythm-display").sortable({scroll: false,tolerance: "pointer",update:
          function(event,ui){
            sortedIDs = $( "#rhythm-display" ).sortable( "toArray" );
            console.log(song.play_segment_list)
            new_play_segment_list = sortedIDs.map(function(s){ return {
                segment_id : parseInt(s.substring(s.indexOf("_")+1,s.indexOf("-"))),
                step_length : parseInt(s.substring(s.indexOf("-")+1))}})
            console.log(new_play_segment_list)
            
            song.play_segment_list = new_play_segment_list;
            //song.update_rhythm(true)
          }})

        /*
      $html5Video = $("#video")
      var videoDuration = $html5Video.attr('duration');

      var updateProgressBar = function(){
         // if ($html5Video.attr('readyState')) {
              var buffered = $html5Video.attr("buffered").end(0);
              var percent = 100 * buffered / videoDuration;

              //Your code here
              console.log("video loaded: "+percent)
              //If finished buffering buffering quit calling it
              if (buffered >= videoDuration) {
                      clearInterval(this.watchBuffer);
              }
          //}else{

             // console.log("video not ready")
         // }
      };
      var watchBuffer = setInterval(updateProgressBar, 500);
      */

      });


      function showLess(){
        $('.hidethis').hide()
        $('.showthis').show()
        /*//*/ $('#topMessage').hide()
        $('#leftColumn').addClass("col-md-12")
        $('#leftColumn').removeClass("col-md-8")
      }
      function showMore(){
        $('#showLessInit').show()
        $('.hidethis').show()
        $('.showthis').hide()
        $('#leftColumn').addClass("col-md-8")
        $('#leftColumn').removeClass("col-md-12")
      }
      function showLessInit(){

        $('.hidethis').hide()
        $('#showLessInit').hide()
        $('#leftColumn').addClass("col-md-8")
        $('#leftColumn').removeClass("col-md-12")
      }

      /* TODO: concurrency with firebase */

      var myDataRef = new Firebase('https://crowdremix.firebaseio-demo.com/sessions/23');
      myDataRef.on('child_added', function(snapshot) {
        var message = snapshot.val();
        console.log(message.name, message.text);
      });
      



    </script>
  </body>
</html>