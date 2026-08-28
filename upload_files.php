<?php
$baseDir = __DIR__ . '/backend/storage/app/public';
$url = 'https://sanotaf-edu.up.railway.app/api/upload-bulk';

$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($baseDir, RecursiveDirectoryIterator::SKIP_DOTS)
);

$chunkSize = 1024 * 1024 * 2; // 2MB chunks

$count = 0;
foreach ($files as $file) {
    if (!$file->isFile()) continue;
    
    $filePath = $file->getPathname();
    $relativePath = str_replace('\\', '/', substr($filePath, strlen($baseDir) + 1));
    
    echo "Uploading: $relativePath\n";
    
    $fp = fopen($filePath, 'rb');
    $offset = 0;
    while (!feof($fp)) {
        $chunk = fread($fp, $chunkSize);
        if ($chunk === false || strlen($chunk) === 0) break;
        
        $data = [
            'path' => $relativePath,
            'offset' => $offset,
            'chunk' => base64_encode($chunk)
        ];
        
        $options = [
            'http' => [
                'header'  => "Content-type: application/json\r\nAccept: application/json\r\nX-Secret: supersecret_upload_key_2026\r\n",
                'method'  => 'POST',
                'content' => json_encode($data),
                'timeout' => 60
            ]
        ];
        
        $context  = stream_context_create($options);
        $retries = 3;
        $success = false;
        
        while ($retries > 0 && !$success) {
            $result = @file_get_contents($url, false, $context);
            if ($result !== false) {
                $success = true;
            } else {
                echo "  Retry for offset $offset\n";
                sleep(1);
                $retries--;
            }
        }
        
        if (!$success) {
            echo "Fatal error on chunk for $relativePath\n";
            break;
        }
        
        $offset += strlen($chunk);
    }
    fclose($fp);
    $count++;
}
echo "Done uploading $count files!\n";
?>
