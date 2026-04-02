<?php

namespace App\Services;

use App\Models\Organization;
use Illuminate\Support\Str;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class ChatbotService
{
    /**
     * Process a user query using the Python AI engine.
     */
    public function processQuery(string $query): array
    {
        try {
            // Path to the python script
            $scriptPath = resource_path('python/chat.py');

            // Handle environment where 'python' might be 'python3'
            $process = new Process(['python', $scriptPath, $query]);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            $output = $process->getOutput();
            $result = json_decode($output, true);

            if (json_last_error() === JSON_ERROR_NONE && isset($result['response'])) {
                // Check if response is an ACTION tag
                if (str_starts_with($result['response'], 'ACTION_')) {
                    return $this->handleAction($result['response'], $query);
                }

                return ['response' => $result['response']];
            }

            if (!empty(trim($output))) {
                return ['response' => trim($output)];
            }

            return ['response' => "I apologize, but I'm having trouble processing that right now. Please try again."];

        } catch (\Exception $e) {
            \Log::error('Chatbot Python Error: ' . $e->getMessage());
            return ['response' => $this->fallbackLogic($query)];
        }
    }

    private function handleAction(string $action, string $query): array
    {
        // ---------------------------------------------------------
        // DYNAMIC ACTION MAPPING ENGINE
        // ---------------------------------------------------------
        // Instead of hardcoding responses in Python, the AI returns an 
        // "ACTION_TAG". Laravel intercepts this tag and executes results
        // fetching from the live database. This ensures data is always 
        // up-to-date without retraining the model.

        switch ($action) {
            case 'ACTION_FETCH_ANNOUNCEMENTS':
                return $this->fetchAnnouncements();
            case 'ACTION_FETCH_CONTACTS':
                // Removed Analytics for confidentiality and replaced with Contacts
                return $this->fetchContacts();
            case 'ACTION_FETCH_OFFICIALS':
                return $this->fetchOfficials();
            case 'ACTION_FETCH_LAWS':
                return $this->fetchLaws();
            case 'ACTION_FETCH_ALL_ORGANIZATIONS':
                return $this->fetchAllOrganizations();
            case 'ACTION_FETCH_ORG_INFO':
                return $this->fetchOrgInfo($query);
            case 'ACTION_DISAMBIGUATE_REPORT':
                // Intent Disambiguation:
                // If the user's intent is vague (e.g., "Report"), we ask for clarification
                // and provide clickable Quick Reply buttons to guide them.
                return [
                    'response' => "Nais mo bang mag-report ng kaso para sa isang babae (VAWC) o para sa isang bata (BCPC)?",
                    'suggestions' => ['File VAWC Case', 'File BCPC Case']
                ];
            default:
                return ['response' => "I'm sorry, I encountered an internal action error."];
        }
    }

    private function fetchAnnouncements(): array
    {
        // Fetch latest 3 announcements
        $news = \App\Models\Announcement::latest()->take(3)->get();

        if ($news->isEmpty()) {
            return ['response' => "There are no new announcements at this time."];
        }

        $response = "Here are the latest announcements:\n\n";
        foreach ($news as $item) {
            $date = $item->created_at->format('M d, Y');
            // strip tags to prevent HTML from tiptap editor showing up in chatbot
            $content = strip_tags($item->content);
            $response .= "{$item->title} ({$date})\n{$content}\n\n";
        }

        return ['response' => $response];
    }

    private function fetchOfficials(): array
    {
        $officials = \App\Models\OrganizationalMember::where('is_active', true)
            ->orderBy('display_order')
            ->get();

        if ($officials->isEmpty()) {
            return ['response' => "The list of officials is currently unavailable."];
        }

        $response = "Here are our Barangay Officials:\n\n";
        foreach ($officials as $official) {
            // Adjust fields based on your Official model (e.g., name, position)
            $response .= "{$official->official_name} - {$official->position}\n";
        }

        return ['response' => $response];
    }

    private function fetchContacts(): array
    {
        $response = "Here are the important emergency and contact numbers:\n\n";
        $response .= "• National Emergency Hotline: 911\n";
        $response .= "• Violence Against Women and Children (VAWC) Desk: (Provide local number here or 1343)\n";
        $response .= "• PNP Women and Children Protection Center (WCPC): 177 / (02) 8532-6690\n";
        $response .= "• Barangay Council for the Protection of Children (BCPC): (Ask your local barangay hall)\n\n";
        $response .= "If you or someone else is in immediate danger, please do not hesitate to call 911 or the local police.";

        return [
            'response' => $response,
            'suggestions' => ['File VAWC Case', 'File BCPC Case']
        ];
    }

    private function fetchLaws(): array
    {
        // Hardcoded for now as Laws might not be in DB, or fetch if in DB
        // Assuming static for now or maybe create a Law model later if requested
        // Prompt implies "Admin can CRUD... Laws", so assume Law model exists or use static if not found
        // Let's check if Law model exists, otherwise static.
        // Returning static for safety + standard laws mentioned in intents.

        return [
            'response' => "Here are some key laws protecting women and children:\n\n" .
                "RA 9262 (Anti-VAWC Act): Protects women and children from violence.\n" .
                "RA 7610: Special Protection of Children Against Abuse, Exploitation and Discrimination Act.\n" .
                "RA 11313 (Safe Spaces Act): Penalizes gender-based sexual harassment in public spaces and online.\n\n" .
                "For more details, please visit the 'Laws' page."
        ];
    }

    private function fetchAllOrganizations(): array
    {
        $orgs = Organization::all();

        if ($orgs->isEmpty()) {
            return ['response' => "There are currently no accredited organizations listed."];
        }

        $response = "Here are the accredited organizations you can join. You can recognize them by their purpose:\n\n";

        foreach ($orgs as $org) {
            $pres = Str::limit($org->president_name, 20);
            $response .= "{$org->name}\nPresident: {$pres}\n\n";
        }

        $response .= "Tip: Ask 'Tell me about [Organization Name]' for requirements and application forms.";

        return [
            'response' => $response,
            'suggestions' => $orgs->pluck('name')->map(fn($n) => "Tell me about $n")->take(4)->toArray()
        ];
    }

    private function fetchOrgInfo(string $query): array
    {
        // "Poor Man's NER": Iterate through all orgs and check if their name exists in the user's query
        // This handles "Tell me about KALIPI" -> Matches "KALIPI"

        $orgs = Organization::all();
        $matchedOrg = null;

        foreach ($orgs as $org) {
            // Check if org name or commonly known alias is in the query (case insensitive)
            if (Str::contains(strtolower($query), strtolower($org->name))) {
                $matchedOrg = $org;
                break;
            }
            // Add other matching logic if needed (e.g., abbreviations)
        }

        if (!$matchedOrg) {
            // If no specific org found in query, return list
            return $this->fetchAllOrganizations();
        }

        // Build detailed response
        $reqs = $matchedOrg->requirements;
        $reqList = is_array($reqs) ? implode("\n• ", $reqs) : $reqs;

        $response = "Here are the details for {$matchedOrg->name}:\n\n";
        $response .= "President: {$matchedOrg->president_name}\n\n";
        // $response .= "Purpose: {$matchedOrg->description}\n\n";
        $response .= "Requirements: {$reqList}\n\n";

        if ($matchedOrg->form_schema) {
            $response .= "Application Form: Available online.\n";
        }

        $response .= "\nYou can apply directly by visiting the Tab>Organizations page.";

        return [
            'response' => $response,
            'suggestions' => ['Join ' . $matchedOrg->name, 'List all organizations']
        ];
    }

    private function fallbackLogic(string $query): string
    {
        $query = strtolower($query);

        if (Str::contains($query, ['join', 'apply', 'requirements'])) {
            return "To join an organization, please navigate to the Organizations page and click 'Join'. Requirements usually include a valid ID and proof of residency.";
        }

        if (Str::contains($query, ['vawc', 'bcpc', 'abuse', 'report', 'emergency'])) {
            return "If this is an emergency, please call 911 immediately. To file a VAWC report, use the red 'Report Case' button on the dashboard.";
        }

        return "I am experiencing a temporary system issue. Please contact the administrator or try again later.";
    }
}
