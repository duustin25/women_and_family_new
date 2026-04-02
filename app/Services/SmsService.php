<?php

namespace App\Services;

use App\Models\SmsLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class SmsService
{
    protected $baseUrl = 'http://192.168.8.1';
    protected $isMock;

    public function __construct()
    {
        // Default to mock mode if we are not in a production-like environment 
        // or if explicitly set in .env
        $this->isMock = config('services.sms.mock', true);
    }

    /**
     * Send an SMS via the Huawei HiLink API.
     *
     * @param string $phone
     * @param string $message
     * @return SmsLog
     */
    public function send($phone, $message)
    {
        $log = SmsLog::create([
            'recipient' => $phone,
            'message' => $message,
            'status' => 'pending',
        ]);

        if ($this->isMock) {
            Log::info("SMS Mock Sent to {$phone}: {$message}");
            $log->update([
                'status' => 'success',
                'gateway_response' => 'MOCK_SUCCESS: Dongle simulation active.',
            ]);
            return $log;
        }

        try {
            // STEP 1: Get Session and Token Info (Required for Huawei HiLink Security)
            $response = Http::get("{$this->baseUrl}/api/webserver/SesTokInfo");
            
            if (!$response->successful()) {
                throw new Exception("Could not connect to Huawei Dongle. Is it plugged in?");
            }

            $xml = simplexml_load_string($response->body());
            $session = (string)$xml->SesInfo;
            $token = (string)$xml->TokInfo;

            // STEP 2: Prepare the SMS XML Payload
            // Note: Huawei HiLink uses a specific XML format for sending SMS
            $smsXml = "<?xml version='1.0' encoding='UTF-8'?>
            <request>
                <Index>-1</Index>
                <Phones>
                    <Phone>{$phone}</Phone>
                </Phones>
                <Content>{$message}</Content>
                <Length>" . strlen($message) . "</Length>
                <Reserved>1</Reserved>
                <Date>" . date('Y-m-d H:i:s') . "</Date>
            </request>";

            // STEP 3: Send the SMS
            $sendResponse = Http::withHeaders([
                '__RequestVerificationToken' => $token,
                'Cookie' => $session,
                'Content-Type' => 'application/x-www-form-urlencoded; charset=UTF-8',
            ])->post("{$this->baseUrl}/api/sms/send-sms", $smsXml);

            if ($sendResponse->successful() && str_contains($sendResponse->body(), 'OK')) {
                $log->update([
                    'status' => 'success',
                    'gateway_response' => $sendResponse->body(),
                ]);
            } else {
                throw new Exception("HUAWEI_ERROR: " . $sendResponse->body());
            }

        } catch (Exception $e) {
            Log::error("SMS Gateway Error: " . $e->getMessage());
            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'gateway_response' => isset($sendResponse) ? $sendResponse->body() : null,
            ]);
        }

        return $log;
    }
}
