<?php

/*
client_max_body_size = 32M;

# This sets the maximum amount of memory in bytes that a script is allowed to allocate
memory_limit = 32M
 
# The maximum size of an uploaded file.
upload_max_filesize = 32M
 
# Sets max size of post data allowed. This setting also affects file upload. To upload large files, this value must be larger than upload_max_filesize
post_max_size = 32M
*/

try{
	require("../../../sql.php");
}catch(Exception $e){
	die("bad mysql");
}


if($_GET['listallrooms']){
	$r = mysql_query("SELECT * from crowdremix_rooms  ");
	while($a = mysql_fetch_array($r)){
		$room = $a['goinstant_roomname'];
		echo "<br>";
		echo "<a href=\"http://cortexel.us/crowdremix/crowdremix4.2.html?x=$room\">$room</a>";
	}
	exit();
	
}

if(isset($_POST['decree'])) {

	if($_POST["decree"] == "should we analyze?" && $_POST["song_url"] && $_POST["soundpalette_algorithm_version"]){
		// test if we should analyze

		$mp3 = mysql_escape_string($_POST["song_url"]);
		$version = mysql_escape_string($_POST["soundpalette_algorithm_version"]);

		$r = mysql_query("SELECT * from crowdremix_songs where mp3 = '$mp3' ");
		if(mysql_num_rows($r) > 0){
			// we've analyzed this song before
			$songs = mysql_fetch_array($r);
			$song_id = $songs["song_id"];
			$title = $songs["title"];
			$artist = $songs["artist"];

			$r = mysql_query("SELECT * from crowdremix_palettes where song_id = '$song_id' and soundpalette_algorithm_version = '$version' ");
			if(mysql_num_rows($r) > 0){
				// analysis is cached, we don't need to analyze again
				$palettes = mysql_fetch_array($r);
				$json_filename = $palettes["json_filename"];
				$songdata = array("json_filename"=>$json_filename, "artist"=>$artist, "title"=>$title, 
				"song_url"=> $mp3 );
				// so create new room 
				$shortname = shortname($artist, $title);

				$roomname = createRoom($shortname,$songdata, $song_id);

				die(json_encode(array("msg"=>"no","roomname"=>$roomname)));
			}else{
				// we updated the analysis algorithm since last analysis, so analyze again
				die(json_encode(array("msg"=>"yes", "why"=>"old analysis, do it again with updated analysis")));
			}

		}else{
			// first time analyzing this song
			die(json_encode(array("msg"=>"yes", "why"=>"never seen this song before", "mp3"=>$mp3, "version"=>$version)));
		}
	}else if($_POST["decree"]=="prepare the arrangements"){

		$songdata = $_POST['songdata'];

		if($songdata["song_url"] && $_POST["segments_palette"] && $songdata["artist"] && $songdata["title"] && $songdata["soundpalette_algorithm_version"] ){

			// store record in database
			$artist = mysql_escape_string($songdata["artist"]);
			$title = mysql_escape_string($songdata["title"]);
			$mp3 = mysql_escape_string($songdata["song_url"]);
			$version = mysql_escape_string($songdata["soundpalette_algorithm_version"]);


			mysql_query("INSERT INTO crowdremix_palettes() values()") or die("failed to insert crowdremix_palette");
			$palette_id = mysql_insert_id();

			$shortname = shortname($artist, $title);
			$json_filename = mysql_escape_string($shortname . "." . $palette_id . "." . $version . ".json");

			// save mp3?
			// upload...
			// $new_url = ...

			// save json in file directory
			$json_str = stripslashes($_POST["segments_palette"]);
			
			file_put_contents("json/" . $json_filename, $json_str); //or die("failed to make json file");

			$r = mysql_query("SELECT song_id from crowdremix_songs where mp3 = '$mp3' ");
			if(mysql_num_rows($r) > 0){
				// we've analyzed this song before
				$a = mysql_fetch_array($r);
				$song_id = mysql_escape_string($a["song_id"]);
				mysql_query("UPDATE crowdremix_songs set default_palette_id='$palette_id' where song_id = '$song_id' ") or die("failed to update crowdremix_song");
				
			}else{
				mysql_query("INSERT INTO crowdremix_songs(title, artist, mp3, default_palette_id) values('$title','$artist','$mp3','$palette_id')") or die("failed to insert crowdremix_song");
				$song_id = mysql_insert_id();
			}

			mysql_query("UPDATE crowdremix_palettes set song_id = '$song_id', 
				json_filename = '$json_filename',
				soundpalette_algorithm_version = '$version'
				WHERE palette_id = '$palette_id'") or die("failed to update crowdremix_palette");

			// add to json filename to songdata
			$songdata["json_filename"] = $json_filename;
			$roomname = createRoom($shortname, $songdata, $song_id);
			if($roomname){
				die(json_encode(array("roomname"=>$roomname)));
			}else{
				die(json_encode(array("msg"=>"failed to create room")));
			}
		}else{
			echo "bad arrangements: ";
			die($song_data);
		}


	}else if($_POST["decree"]=="save the banks"){
		if($_POST['roomname'] && $_POST["banks"]){
			$roomname = $_POST['roomname'];
			$json_banks = json_encode($_POST["banks"]);
			// potentially awful security hole
			
			$bankfile = "banks/bank-" . $roomname . ".json";

			$f = file_put_contents($bankfile,  $json_banks);
			if($f){
				die(json_encode(array("msg"=>"successfully created json file" . $bankfile)));
			}else{
				die(json_encode(array("msg"=>"failed to create json file")));
			}
		}else{
			die(json_encode(array("msg"=>"no roomname/banks")));
		}



	}else if($_POST["decree"]=="give me room info"){
		$roomname = $_POST['roomname'];

		if($roomname){

			$r = mysql_query("SELECT * from crowdremix_rooms where goinstant_roomname ='$roomname' ");
			if(mysql_num_rows($r) > 0){
				// we've analyzed this song before
				$a = mysql_fetch_array($r);
				$song_id = mysql_escape_string($a["initial_song_id"]);
				$room_id = mysql_escape_string($a["room_id"]);
				
				$r = mysql_query("SELECT * from crowdremix_songs where song_id ='$song_id' ");
				if(mysql_num_rows($r) > 0){
					$a = mysql_fetch_array($r);
					$title = mysql_escape_string($a["title"]);
					$artist = mysql_escape_string($a["artist"]);
					$mp3 = mysql_escape_string($a["mp3"]);
					$palette_id = mysql_escape_string($a["default_palette_id"]);

					$r = mysql_query("SELECT * from crowdremix_palettes where palette_id = '$palette_id' ");
					if(mysql_num_rows($r) > 0){
						$a = mysql_fetch_array($r);
						$json_filename = $a["json_filename"];
						$songdata = array("artist"=>$artist, "title"=>$title, 
						"song_url"=> $mp3 );

						die(json_encode(array("json_filename"=>$json_filename, "songdata"=>$songdata)));
					}else{
						// we updated the analysis algorithm since last analysis, so analyze again
						die(json_encode(array("msg"=>"yes", "why"=>"old analysis, do it again with updated analysis")));
					}


				}

				die(json_encode(array("roomname"=>$roomname)));
			}else{
				die(json_encode(array("msg"=>"No room with that name $roomname")));	
			}
		}else{
			die(json_encode(array("msg"=>"failed to create room")));
		}
	}else{
		die("bad decree: " . $json_str);
	}
} else {
	die("no decree");

	//createRoom("blerh",array("nothing"=>"something"));
}


function createRoom($shortname, $songdata, $song_id){
	mysql_query("INSERT INTO crowdremix_rooms() values()") or die("failed to insert crowdremix_rooms");
	$room_id = mysql_insert_id();

	$roomname = mysql_escape_string($room_id . "." . $shortname);
	$song_id = mysql_escape_string($song_id);

	$token = getAuthToken();
	//echo $token;
	$go_id = 0; // createGoinstantRoom($roomname, $token, $songdata);


	mysql_query("UPDATE crowdremix_rooms set goinstant_roomid = '$go_id', 
		goinstant_roomname = '$roomname',
		initial_song_id = '$song_id'
		WHERE room_id ='$room_id' ") or die("failed to update crowdremix_rooms");


	return $roomname;

}

function createGoinstantRoom($roomname, $token, $songdata){
	$service_url = 'https://api.goinstant.net/v1/apps/4731/rooms/';
	$curl = curl_init($service_url);
	$data = array(
	    "name" => $roomname
	    );
	$json = json_encode($data);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($curl, CURLOPT_POST, true);
	curl_setopt($curl, CURLOPT_HTTPHEADER, array(
		'Authorization: Bearer ' . $token,
		'Content-type: application/json'));
	curl_setopt($curl, CURLOPT_POSTFIELDS, $json);
	$response = json_decode(curl_exec($curl));
	curl_close($curl);
	$go_id = $response->id;


	$service_url = "https://api.goinstant.net/v1/keys/4731/$go_id/songdata";
	$curl = curl_init($service_url);
	$data = array(
	    "value" => $songdata
	    );
	$json = json_encode($data);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
	curl_setopt($curl, CURLOPT_HTTPHEADER, array(
		'Authorization: Bearer ' . $token,
		'Content-type: application/json'));
	curl_setopt($curl, CURLOPT_POSTFIELDS, $json);
	$response = json_decode(curl_exec($curl));
	//var_dump($response);
	//echo $service_url;
	curl_close($curl);


	$service_url = "https://api.goinstant.net/v1/keys/4731/$go_id/savedloops";
	$curl = curl_init($service_url);
	$data = array(
	    "value" => array()
	    );
	$json = json_encode($data);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "PUT");
	curl_setopt($curl, CURLOPT_HTTPHEADER, array(
		'Authorization: Bearer ' . $token,
		'Content-type: application/json'));
	curl_setopt($curl, CURLOPT_POSTFIELDS, $json);
	$response = json_decode(curl_exec($curl));
	//var_dump($response);
	//echo $service_url;
	curl_close($curl);
	//die("");
	
	return $go_id;


}

function shortname($artist, $title){
	return substr(preg_replace('/[^a-z]/i', '', strtolower($artist)),0,8) . "_" .
		 substr(preg_replace('/[^a-z]/i', '', strtolower($title)),0,8);
}

function getAuthToken(){
	// OAUTH
	$client_id = "xEQ-Br_fydxN60arTTmeFdzrkrQqzwBkt2Jok5MpUaw";
	$client_secret = "tYj20vFMrqzxx0FIE7pxJWr9_4buejGCPK-5vIuZVRM";

	$service_url = 'https://api.goinstant.net/v1/oauth/access_token/';
	$curl = curl_init($service_url);
	$data = array(
	    "client_id" => $client_id,
	    "client_secret" => $client_secret,
	    );
	$json = json_encode($data);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($curl, CURLOPT_POST, true);
	curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-type: application/json'));
	curl_setopt($curl, CURLOPT_POSTFIELDS, $json);
	$response = json_decode(curl_exec($curl));
	curl_close($curl);
	return $response->token;
}


?>