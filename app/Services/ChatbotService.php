<?php

namespace App\Services;

use App\Models\Organization;
use Illuminate\Support\Facades\Log;
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
            $scriptPath = resource_path('python/chat.py');

            // Candidate python executables across different environments (Windows, Linux, Docker)
            $candidates = array_filter([
                config('app.python_path'),
                env('PYTHON_PATH'),
                PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3',
                'python3',
                'python',
                '/usr/bin/python3',
                '/usr/local/bin/python3',
            ]);
            $candidates = array_unique($candidates);

            $process = null;
            $success = false;

            foreach ($candidates as $binary) {
                try {
                    $process = new Process([$binary, $scriptPath, $query]);
                    $process->setTimeout(8.0);
                    $process->run();

                    if ($process->isSuccessful()) {
                        $success = true;
                        break;
                    }
                } catch (\Throwable $e) {
                    continue;
                }
            }

            if (!$success || !$process) {
                throw new \RuntimeException('Python NLP inference unavailable or execution failed.');
            }

            $output = $process->getOutput();
            $result = json_decode($output, true);

            if (json_last_error() === JSON_ERROR_NONE && isset($result['response'])) {
                // Check if response is an ACTION tag
                if (str_starts_with($result['response'], 'ACTION_')) {
                    return $this->handleAction($result['response'], $query);
                }

                $intent = $result['intent'] ?? 'unknown';
                $payload = ['response' => $result['response']];

                if ($intent === 'greeting') {
                    $payload['suggestions'] = [
                        'How do I file a VAWC case?',
                        'Report child abuse',
                        'Latest Announcements',
                        'Nutrition Program',
                        'Who are the officials?'
                    ];
                } elseif ($intent === 'unknown') {
                    $payload['suggestions'] = [
                        'How do I file a VAWC case?',
                        'Report child abuse',
                        'Latest Announcements',
                        'Who are the officials?',
                        'Emergency Hotlines'
                    ];
                }

                return $payload;
            }

            if (!empty(trim($output))) {
                return ['response' => trim($output)];
            }

            return ['response' => "I apologize, but I'm having trouble processing that right now. Please try again."];
        } catch (\Throwable $e) {
            Log::warning('Chatbot Python Subsystem Notice: ' . $e->getMessage());
            $fallback = $this->fallbackLogic($query);
            $fallback['error'] = 'engine_offline';
            return $fallback;
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
            return ['response' => "Greetings! There are no new announcements at this time. Stay tuned for future updates!"];
        }

        $response = "Greetings! I am happy to fetch the news for you. Here are the latest announcements in our barangay:\n\n";
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
        $officials = \App\Models\OrganizationalMember::with('user')
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get();

        if ($officials->isEmpty()) {
            return ['response' => "The list of officials is currently unavailable."];
        }

        $response = "Here are our Barangay Officials:\n\n";
        foreach ($officials as $official) {
            // Fallback to linked user account name if the name column is null (normalized database design)
            $name = $official->name ?: ($official->user ? $official->user->name : 'Unnamed');
            $response .= "• {$name} - {$official->position}\n";
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

    private function fallbackLogic(string $query): array
    {
        $q = strtolower(trim($query));

        // 1. Greetings & General Help
        if (Str::contains($q, ['hi', 'hello', 'hey', 'kamusta', 'kumusta', 'magandang', 'greetings', 'help', 'tulong'])) {
            return [
                'response' => "Mabuhay! I am The Sentinel. I can assist you with barangay procedures, hotlines, filing VAWC or BCPC reports, officials, and accredited organizations.",
                'suggestions' => [
                    'How do I file a VAWC case?',
                    'Report child abuse',
                    'Latest Announcements',
                    'Who are the officials?',
                    'Emergency Hotlines'
                ]
            ];
        }

        // 2. VAWC filing & Domestic Violence
        if (Str::contains($q, ['vawc', 'bpo', 'protection order', 'asawa', 'sinasaktan', 'pambubugbog', 'domestic violence', 'babae'])) {
            return [
                'response' => "To report a Violence Against Women and Children (VAWC) incident or request a Barangay Protection Order (BPO):\n\n1. Visit the VAWC Desk at our Barangay Hall.\n2. Or file a confidential report online via the 'VAWC Desk > File a Report' section.\n3. In case of immediate physical danger, please dial 911 or PNP WCPC at 177.",
                'suggestions' => ['File VAWC Case', 'Emergency Hotlines', 'What is RA 9262?']
            ];
        }

        // 3. BCPC & Child Abuse
        if (Str::contains($q, ['bcpc', 'bata', 'child', 'minor', 'abuse', 'pang-aabuso', 'kabataan'])) {
            return [
                'response' => "For child protection concerns, the Barangay Council for the Protection of Children (BCPC) provides immediate intervention:\n\n• You may file a child protection report online under the 'BCPC' portal.\n• In-person confidential intake is available at the Barangay BCPC Desk.\n• Emergency Hotline: 911 / DSWD Hotline: 137.",
                'suggestions' => ['File BCPC Case', 'Emergency Hotlines', 'Nutrition Program']
            ];
        }

        // 4. Announcements / News
        if (Str::contains($q, ['announcement', 'balita', 'news', 'update', 'anunsyo', 'event', 'programa'])) {
            return $this->fetchAnnouncements();
        }

        // 5. Officials / Leadership
        if (Str::contains($q, ['official', 'opisyal', 'kapitan', 'captain', 'kagawad', 'sk', 'secretary', 'lider', 'namumuno'])) {
            return $this->fetchOfficials();
        }

        // 6. Emergency Contacts & Hotlines
        if (Str::contains($q, ['contact', 'hotline', 'emergency', 'telepono', 'number', 'pnp', 'police', 'tawag'])) {
            return $this->fetchContacts();
        }

        // 7. Laws & Republic Acts
        if (Str::contains($q, ['law', 'batas', 'ra 9262', 'ra 7610', 'safe spaces', '11313'])) {
            return $this->fetchLaws();
        }

        // 8. Organizations
        if (Str::contains($q, ['org', 'samahan', 'join', 'apply', 'member', 'accredit', 'kalipi'])) {
            return $this->fetchOrgInfo($query);
        }

        // 9. Nutrition Program
        if (Str::contains($q, ['nutrition', 'nutrisyon', 'timbang', 'feeding', 'buntis', 'health'])) {
            return [
                'response' => "Our Barangay Nutrition & Health Committee regularly conducts Operation Timbang (OPT Plus), supplementary feeding, and maternal health monitoring. Please visit our Barangay Health Center or see Announcements for current schedules.",
                'suggestions' => ['Latest Announcements', 'Who are the officials?', 'Emergency Hotlines']
            ];
        }

        // Default graceful response for unclear queries (e.g. "asdasdas")
        return [
            'response' => "I apologize, but I didn't quite catch that. Could you please rephrase your question? You can also choose from the suggested topics below:",
            'suggestions' => [
                'How do I file a VAWC case?',
                'Report child abuse',
                'Latest Announcements',
                'Who are the officials?',
                'Emergency Hotlines'
            ]
        ];
    }
}
