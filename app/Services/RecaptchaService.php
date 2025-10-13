<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Wraps Google reCAPTCHA verification logic and configuration checks for form submissions.
 * Centralizes score thresholds, error logging, and availability detection.
 */
class RecaptchaService
{
    /**
     * Verify reCAPTCHA v3 token
     *
     * @param string $token
     * @param string $action
     * @param float $minScore
     * @return array
     */
    public function verify(string $token, string $action = 'contact_form', float $minScore = 0.5): array
    {
        $secretKey = config('services.recaptcha.secret_key');

        if (empty($secretKey)) {
            Log::warning('reCAPTCHA secret key not configured');
            return [
                'success' => false,
                'error' => 'reCAPTCHA not configured',
                'score' => 0,
            ];
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
            ]);

            $result = $response->json();

            if (!$response->successful() || !isset($result['success'])) {
                Log::error('reCAPTCHA verification failed', [
                    'status' => $response->status(),
                    'response' => $result,
                ]);

                return [
                    'success' => false,
                    'error' => 'Verification request failed',
                    'score' => 0,
                ];
            }

            $success = $result['success'] ?? false;
            $score = $result['score'] ?? 0;
            $resultAction = $result['action'] ?? '';

            // Log suspicious attempts
            if ($score < 0.3) {
                Log::warning('Suspicious reCAPTCHA attempt detected', [
                    'score' => $score,
                    'action' => $resultAction,
                    'hostname' => $result['hostname'] ?? 'unknown',
                    'challenge_ts' => $result['challenge_ts'] ?? 'unknown',
                ]);
            }

            // Verify action matches
            if ($success && $resultAction !== $action) {
                Log::warning('reCAPTCHA action mismatch', [
                    'expected' => $action,
                    'received' => $resultAction,
                ]);

                return [
                    'success' => false,
                    'error' => 'Action mismatch',
                    'score' => $score,
                ];
            }

            // Check minimum score
            if ($success && $score < $minScore) {
                Log::info('reCAPTCHA score below threshold', [
                    'score' => $score,
                    'min_score' => $minScore,
                ]);

                return [
                    'success' => false,
                    'error' => 'Score too low',
                    'score' => $score,
                ];
            }

            return [
                'success' => $success,
                'score' => $score,
                'action' => $resultAction,
                'hostname' => $result['hostname'] ?? null,
                'challenge_ts' => $result['challenge_ts'] ?? null,
            ];

        } catch (\Exception $e) {
            Log::error('reCAPTCHA verification exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'error' => 'Verification exception: ' . $e->getMessage(),
                'score' => 0,
            ];
        }
    }

    /**
     * Check if reCAPTCHA is enabled
     *
     * @return bool
     */
    public function isEnabled(): bool
    {
        return !empty(config('services.recaptcha.secret_key')) 
            && !empty(config('services.recaptcha.site_key'));
    }

    /**
     * Get site key for frontend
     *
     * @return string|null
     */
    public function getSiteKey(): ?string
    {
        return config('services.recaptcha.site_key');
    }
}

