<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChatbotQueryTest extends TestCase
{
    public function test_chatbot_responds_to_help_query()
    {
        $response = $this->postJson('/chat/send', [
            'message' => 'help',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'response',
            'suggestions',
        ]);

        $data = $response->json();
        $this->assertNotEmpty($data['response']);
        $this->assertContains('Emergency Hotlines', $data['suggestions']);
        $this->assertContains('How do I file a VAWC case?', $data['suggestions']);
    }

    public function test_chatbot_responds_to_help_variations()
    {
        foreach (['Help', 'need help', 'patulong'] as $query) {
            $response = $this->postJson('/chat/send', [
                'message' => $query,
            ]);

            $response->assertStatus(200);
            $data = $response->json();
            $this->assertNotEmpty($data['response']);
            $this->assertContains('Emergency Hotlines', $data['suggestions']);
        }
    }

    public function test_chatbot_still_detects_emergency_distress()
    {
        $response = $this->postJson('/chat/send', [
            'message' => 'help me',
        ]);

        $response->assertStatus(200);
        $data = $response->json();
        $this->assertStringContainsString('EMERGENCY', $data['response']);
    }
}
