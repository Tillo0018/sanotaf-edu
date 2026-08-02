<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

class GeminiService
{
    protected string $apiKey;
    protected string $model;
    protected string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key') ?? env('GEMINI_API_KEY', '');
        $this->model = config('services.gemini.model') ?? 'gemini-flash-latest';
        $this->baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    }

    /**
     * Generate content with rate-limiting, response caching, and exponential backoff retry.
     * Uses PHP native streams (no curl needed) for maximum OpenServer compatibility.
     */
    public function generateContent(array $contents, bool $useCache = true, int $ttlSeconds = 3600): array
    {
        set_time_limit(60);

        if (empty($this->apiKey)) {
            Log::error("GeminiService: GEMINI_API_KEY is missing.");
            return ['success' => false, 'text' => null, 'error' => 'API key missing'];
        }

        // Cache key based on model + contents hash
        $cacheKey = 'gemini_resp_' . md5($this->model . ':' . json_encode($contents));
        if ($useCache && Cache::has($cacheKey)) {
            Log::info("GeminiService: Returning cached response.");
            return ['success' => true, 'text' => Cache::get($cacheKey), 'cached' => true, 'error' => null];
        }

        // Rate Limiter: max 15 requests/min (Gemini Free Tier)
        $executed = RateLimiter::attempt('gemini-api-request', 15, fn() => true, 60);
        if (!$executed) {
            Log::warning("GeminiService: Rate limit hit (15 RPM). Returning fallback.");
            return ['success' => false, 'text' => null, 'error' => 'Rate limit hit'];
        }

        $url = "{$this->baseUrl}/{$this->model}:generateContent?key={$this->apiKey}";
        $maxRetries = 2;

        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $result = $this->callWithStream($url, $contents);

                if ($result['status'] === 200) {
                    $data = json_decode($result['body'], true);
                    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
                    if ($text && $useCache) {
                        Cache::put($cacheKey, $text, $ttlSeconds);
                    }
                    return ['success' => true, 'text' => $text, 'error' => null];
                }

                if ($result['status'] === 429) {
                    $responseData = json_decode($result['body'], true);
                    $delay = $this->extractRetryDelay($responseData, $attempt);
                    Log::warning("GeminiService: 429 (Attempt {$attempt}/{$maxRetries}). Waiting {$delay}s...");
                    if ($attempt < $maxRetries) {
                        sleep($delay);
                        continue;
                    }
                }

                Log::error("GeminiService Error (Attempt {$attempt}): HTTP {$result['status']} - " . substr($result['body'], 0, 300));

            } catch (\Exception $e) {
                Log::error("GeminiService Exception (Attempt {$attempt}): " . $e->getMessage());
                if ($attempt < $maxRetries) {
                    sleep(2);
                    continue;
                }
            }
        }

        return ['success' => false, 'text' => null, 'error' => 'Service error after retries.'];
    }

    /**
     * POST using PHP native file_get_contents / stream_context (no curl extension required).
     */
    protected function callWithStream(string $url, array $contents): array
    {
        $payload = json_encode(['contents' => $contents]);

        $context = stream_context_create([
            'http' => [
                'method'        => 'POST',
                'header'        => "Content-Type: application/json\r\nAccept: application/json\r\n",
                'content'       => $payload,
                'timeout'       => 10,
                'ignore_errors' => true,
            ],
            'ssl' => [
                'verify_peer'      => false,
                'verify_peer_name' => false,
            ],
        ]);

        $body = @file_get_contents($url, false, $context);

        $status = 0;
        if (isset($http_response_header) && is_array($http_response_header)) {
            foreach ($http_response_header as $header) {
                if (preg_match('#HTTP/\S+\s+(\d+)#', $header, $m)) {
                    $status = (int) $m[1];
                    break;
                }
            }
        }

        if ($body === false) {
            throw new \Exception("file_get_contents failed — allow_url_fopen may be disabled or network unreachable.");
        }

        return ['status' => $status, 'body' => $body];
    }

    /**
     * Extract retry delay from Google's 429 response body, or use exponential backoff.
     */
    protected function extractRetryDelay(?array $responseJson, int $attempt): int
    {
        if ($responseJson && isset($responseJson['error']['details'])) {
            foreach ($responseJson['error']['details'] as $detail) {
                if (isset($detail['@type']) && str_contains($detail['@type'], 'RetryInfo') && isset($detail['retryDelay'])) {
                    $sec = (int) ceil((float) preg_replace('/[^0-9.]/', '', $detail['retryDelay']));
                    if ($sec > 0 && $sec <= 30) return $sec;
                }
            }
        }
        return (int) (pow(2, $attempt) * 2); // 4s, 8s
    }
}
