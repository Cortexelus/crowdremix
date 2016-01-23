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


.keyboard {
  font-size: 62.5%;
  padding: 15px;
  margin-bottom: 2em;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  zoom: 1; }
  .keyboard:before, .keyboard:after {
    content: "";
    display: table; }
  .keyboard:after {
    clear: both; }
  .keyboard .note,
  .keyboard .message {
    margin-top: 1em;
    width: 175px;
    font-size: 1em;
    color: #555; }
  .keyboard section {
    float: left;
    margin-right: 15px; }
    .keyboard section:last-of-type {
      margin-right: 0; }
  .keyboard .row {
    height: 30px;
    margin-bottom: 2px; }
    .keyboard .row:last-of-type {
      margin-bottom: 0; }
  .keyboard .key,
  .keyboard .key_filler {
    display: inline-block;
    position: relative;
    margin-right: 0px;
    width: 30px;
    height: 30px; }
    .keyboard .key:last-of-type,
    .keyboard .key_filler:last-of-type {
      margin-right: 0; }
  .keyboard .key_filler {
    pointer-events: none; }
  .keyboard .key {
    cursor: pointer;
    border: 1px solid #aaa;
    padding-top: 0.25em;
    vertical-align: top;
    font-size: 1.2em;
    color: #333;
    text-align: center;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    border-radius: 5px;
    -webkit-box-shadow: 1px 1px 1px 0 rgba(0, 0, 0, 0.2);
    -moz-box-shadow: 1px 1px 1px 0 rgba(0, 0, 0, 0.2);
    box-shadow: 1px 1px 1px 0 rgba(0, 0, 0, 0.2);
    background: white;
    background-image: -moz-linear-gradient(-90deg, white 0%, #e3e3e3 100%);
    background-image: -webkit-linear-gradient(-90deg, white 0%, #e3e3e3 100%);
    background-image: -o-linear-gradient(-90deg, white 0%, #e3e3e3 100%);
    background-image: -ms-linear-gradient(-90deg, white 0%, #e3e3e3 100%); }
    .keyboard .key.disabled { 
      border: none;
      background-image: none;
      box-shadow: none;
    }
    .keyboard .key.pressed, .keyboard .key.shift_pressed {
      -webkit-box-shadow: inset 1px 1px 1px 0 rgba(0, 0, 0, 0.2);
      -moz-box-shadow: inset 1px 1px 1px 0 rgba(0, 0, 0, 0.2);
      box-shadow: inset 1px 1px 1px 0 rgba(0, 0, 0, 0.2);
      background: #f3f3f3;
      background-image: -moz-linear-gradient(90deg, #f3f3f3 0%, #dddddd 100%);
      background-image: -webkit-linear-gradient(90deg, #f3f3f3 0%, #dddddd 100%);
      background-image: -o-linear-gradient(90deg, #f3f3f3 0%, #dddddd 100%);
      background-image: -ms-linear-gradient(90deg, #f3f3f3 0%, #dddddd 100%); }
      .keyboard .key.pressed strong, .keyboard .key.shift_pressed strong {
        color: #fff; }
      .keyboard .key.pressed .triangle:first-child.up, .keyboard .key.shift_pressed .triangle:first-child.up {
        border-color: transparent transparent #fff transparent; }
      .keyboard .key.pressed .triangle:first-child.down, .keyboard .key.shift_pressed .triangle:first-child.down {
        border-color: #fff transparent transparent transparent; }
      .keyboard .key.pressed .triangle:first-child.right, .keyboard .key.shift_pressed .triangle:first-child.right {
        border-color: transparent transparent transparent #fff; }
      .keyboard .key.pressed .triangle:first-child.left, .keyboard .key.shift_pressed .triangle:first-child.left {
        border-color: transparent #fff transparent transparent; }
    .keyboard .key.shift_pressed strong {
      color: #333; }
    .keyboard .key.shift_pressed em {
      color: #fff; }
    .keyboard .key.wide_1 {
      width: 11px; }
    .keyboard .key.wide_2 {
      width: 14px; }
    .keyboard .key.wide_3 {
      width: 25px; }
    .keyboard .key.wide_4 {
      width: 50px; }
    .keyboard .key.wide_5 {
      width: 274px; }
    .keyboard .key.wide_6 {
      width: 85px; }
    .keyboard .key.tall {
      height: 85px;
      line-height: 85px; }
    .keyboard .key.single {
      font-size: 1.5em;
      padding-top: 0.35em; }
    .keyboard .key em {
      font-style: normal; }
    .keyboard .key strong {
      font-weight: normal; }
    .keyboard .key .triangle {
      margin: 8px auto; }
      .keyboard .key .triangle.up {
        top: 2px; }
      .keyboard .key .triangle.down {
        top: 5px; }
      .keyboard .key .triangle.left {
        left: -2px; }
      .keyboard .key .triangle.right {
        left: 2px; }
    .keyboard .key br + .triangle {
      margin: 0 auto; }
    .keyboard .key span {
      display: block;
      position: absolute;
      width: 100%;
      padding: 0.2em 0.5em;
      bottom: 0;
      font-size: 0.8em;
      text-align: center; }
      .keyboard .key span.right {
        text-align: right; }
      .keyboard .key span.left {
        text-align: left; }
  .keyboard .triangle {
    position: relative;
    width: 0px;
    height: 0px;
    border-style: solid; }
    .keyboard .triangle.up {
      border-width: 0 8px 10px 8px;
      border-color: transparent transparent #555555 transparent; }
    .keyboard .triangle.down {
      border-width: 10px 8px 0 8px;
      border-color: #555555 transparent transparent transparent; }
    .keyboard .triangle.right {
      border-width: 8px 0 8px 10px;
      border-color: transparent transparent transparent #555555; }
    .keyboard .triangle.left {
      border-width: 8px 8px 10px 0;
      border-color: transparent #555555 transparent transparent; }



      .btn {
        padding: 5px;
      }
      .btn.dropdown-toggle{
        padding-left: 1px;
        padding-right: 1px;
      }
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
                    <div id="key_49" class="key single"><strong>1</strong></div>
                    <div id="key_50" class="key single"><strong>2</strong></div>
                    <div id="key_51" class="key single"><strong>3</strong></div>
                    <div id="key_52" class="key single"><strong>4</strong></div>
                    <div id="key_53" class="key single"><strong>5</strong></div>
                    <div id="key_54" class="key single"><strong>6</strong></div>
                    <div id="key_55" class="key single"><strong>7</strong></div>
                    <div id="key_56" class="key single"><strong>8</strong></div>
                    <div id="key_57" class="key single"><strong>9</strong></div>
                    <div id="key_48" class="key single"><strong>0</strong></div>
                   <!-- <div id="key_189" class="key"><em>_</em><br><strong>-</strong></div>
                    <div id="key_187" class="key"><em>+</em><br><strong>=</strong></div>-->
                    <div id="key_8" class="key wide_2 disabled"><span class="right"><strong></strong></span></div>
                </div>
                <div class="row">
                    <div id="key_9" class="key wide_2 disabled"><span class="left"><strong> </strong></span></div>
                    <div id="key_81" class="key single"><strong>Q</strong></div>
                    <div id="key_87" class="key single"><strong>W</strong></div>
                    <div id="key_69" class="key single"><strong>E</strong></div>
                    <div id="key_82" class="key single"><strong>R</strong></div>
                    <div id="key_84" class="key single"><strong>T</strong></div>
                    <div id="key_89" class="key single"><strong>Y</strong></div>
                    <div id="key_85" class="key single"><strong>U</strong></div>
                    <div id="key_73" class="key single"><strong>I</strong></div>
                    <div id="key_79" class="key single"><strong>O</strong></div>
                    <div id="key_80" class="key single"><strong>P</strong></div>
                    <!-- <div id="key_219" class="key"><em>{</em><br><strong>[</strong></div>
                    <div id="key_221" class="key"><em>}</em><br><strong>]</strong></div>-->
                    <!-- <div id="key_220" class="key"><em>|</em><br><strong>\</strong></div>-->
                </div>
                <div class="row">
                    <div id="key_20" class="key wide_3 disabled"><span class="left"><strong></strong></span></div>
                    <div id="key_65" class="key single"><strong>A</strong></div>
                    <div id="key_83" class="key single"><strong>S</strong></div>
                    <div id="key_68" class="key single"><strong>D</strong></div>
                    <div id="key_70" class="key single"><strong>F</strong></div>
                    <div id="key_71" class="key single"><strong>G</strong></div>
                    <div id="key_72" class="key single"><strong>H</strong></div>
                    <div id="key_74" class="key single"><strong>J</strong></div>
                    <div id="key_75" class="key single"><strong>K</strong></div>
                    <div id="key_76" class="key single"><strong>L</strong></div>
                    <!--<div id="key_186" class="key"><em>:</em><br><strong>;</strong></div>
                    <div id="key_222" class="key"><em>"</em><br><strong>'</strong></div>-->
                    <div id="key_13" class="key wide_3 disabled"><span class="right"><strong></strong></span></div>
                </div>
                <div class="row">
                    <div id="key_16" class="key wide_4 disabled"><span class="left"><strong></strong></span></div>
                    <div id="key_90" class="key single"><strong>Z</strong></div>
                    <div id="key_88" class="key single"><strong>X</strong></div>
                    <div id="key_67" class="key single"><strong>C</strong></div>
                    <div id="key_86" class="key single"><strong>V</strong></div>
                    <div id="key_66" class="key single"><strong>B</strong></div>
                    <div id="key_78" class="key single"><strong>N</strong></div>
                    <div id="key_77" class="key single"><strong>M</strong></div>
                   <!--  <div id="key_188" class="key"><em>&lt;</em><br><strong>,</strong></div>
                    <div id="key_190" class="key"><em>&gt;</em><br><strong>.</strong></div>
                    <div id="key_191" class="key"><em>?</em><br><strong>/</strong></div>-->
                    <div id="key_16" class="key wide_4 disabled"><span class="right"><strong></strong></span></div>
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
        <div class="panel-heading" style="height: 35px; padding:0px">
          <span style="float: left; margin: 8px; margin-left: 10px; font-weight: bold">
            Rhythm                <!-- Single button -->
          </span>
          <span style="float:right; ">
            <button type="button" class="btn btn-warning btn-lg" id="pauseButton" style="height: 35px; weight: 35px; border-radius: 3px">
              <span class="glyphicon glyphicon-pause"></span>
            </button>
          </span>
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
  <button type="button" class="btn btn-default menulabel">stretches</button>
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
    <button type="button" class="btn btn-default menulabel">and so on</button>
  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
    <span class="caret"></span>
    <span class="sr-only">Toggle Dropdown</span>
  </button>
  <ul class="dropdown-menu dropdown-menu-right pull-right" role="menu">
    <li><a id="gb-forever">Forever (loop loops forever)</a></li>
    <li><a id="gb-once">Once (beat plays once, then silence)</a></li>
    <li><a id="gb-and-so-on">And so on (beat plays once, then song continues on)</a></li>
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


<!--
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

        
      </div>-->



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

    <script src="js/supersong.js"></script>
    <script src="js/supersoundengine.js"></script>
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
          }else if(song.forever=="and so on"){
            $("#gb-onceforever .menulabel").html("And so on")
            $("#gb-onceforever button").removeClass("btn-default").removeClass("btn-success").removeClass("btn-warning").addClass("btn-primary")
          }else {
            $("#gb-onceforever .menulabel").html("Once")
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
              song.forever = "once"
          }else if(song.forever=="once"){
              song.forever = "and so on"
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
        $("#gb-and-so-on").click(function(){
          song.forever = "and so on"
          updateLoopOptions(song)
        })
        $("#gb-once").click(function(){
          song.forever = "once"
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
                    //song.addToLoopList(loop,k)
                    loop.draw_key(song, "#key_"+k)
                  }
                }else{
                  song.load_loop(savedLoops[k])
                }
              }else{
                loop = song.save_loop();

                if(loop.play_segment_list.length>0){
                  savedLoops[k] = loop
                  //song.addToLoopList(loop,k)
                  loop.draw_key(song, "#key_"+k)
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

        $("#pauseButton").click(function(){
          song.stop_audio();
        })
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