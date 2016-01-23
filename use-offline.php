<?php 


$json = "json/hardcore.json";
$mp3 = "mp3/hardcore.mp3";
$name = "hardcore";


$file = tempnam("tmp", "zip"); 
    
$zip = new ZipArchive(); 

// Zip will open and overwrite the file, rather than try to read it. 
$zip->open($file, ZipArchive::OVERWRITE); 


$zip->addFile('glitches.html', "crowdremix/$name.html");

$zip->addFile("$json", "crowdremix/$name.json");
$zip->addFile("$mp3", "crowdremix/$name.mp3");



$zip->addFile('js/draw-song_newaudio.js', 'crowdremix/js/draw-song_newaudio.js');
$zip->addFile('js/soundengine_new.js', 'crowdremix/js/soundengine_new.js');
$zip->addFile('js/bjorklund.js', 'crowdremix/js/bjorklund.js');
$zip->addFile('js/holder.js', 'crowdremix/js/holder.js');
$zip->addFile('js/bootstrap.min.js', 'crowdremix/js/bootstrap.min.js');
$zip->addFile('js/bootstrap-slider.js', 'crowdremix/js/bootstrap-slider.js');



$zip->addFile('css/bootstrap.css', 'crowdremix/css/bootstrap.css');
$zip->addFile('css/theme.css', 'crowdremix/css/theme.css');
$zip->addFile('css/slider.css', 'crowdremix/css/slider.css');
$zip->addFile('css/bootstrap-theme.min.css', 'crowdremix/css/bootstrap-theme.min.css');





$zip->close(); 




$name = "CrowdRemix --";
// Stream the file to the client 
header("Content-Type: application/zip"); 
header("Content-Length: " . filesize($file)); 
header("Content-Disposition: attachment; filename=\"$name.zip\""); 
readfile($file); 

unlink($file); 
?>