<?php
// Get all MP4 files from videos folder
$files = glob("videos/*.mp4");

// Sort alphabetically (optional)
sort($files);

// Return as JSON
echo json_encode($files);
?>
