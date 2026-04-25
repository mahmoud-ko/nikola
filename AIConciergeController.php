<?php
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Response.php';

class AIConciergeController {
    private PDO $db;
    private array $hotels = [];
    private string $groqApiKey;

    public function __construct() {
        $this->groqApiKey = getenv('GROQ_API_KEY') ?: '';

        if (empty($this->groqApiKey)) {
            foreach ([__DIR__ . '/.env', __DIR__ . '/../.env', __DIR__ . '/../../.env'] as $path) {
                if (file_exists($path)) {
                    foreach (file($path) as $line) {
                        $line = trim($line);
                        if (str_starts_with($line, 'GROQ_API_KEY=')) {
                            $this->groqApiKey = trim(substr($line, 13), " \t\"'");
                            break 2;
                        }
                    }
                }
            }
        }

        $this->db = Database::getInstance()->getConnection();
        $this->createTables();
        $this->loadHotels();
    }

    private function createTables(): void {
        $this->db->exec("CREATE TABLE IF NOT EXISTS ai_conversations (
            conversation_id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(100),
            user_message TEXT,
            ai_response TEXT,
            extracted_city VARCHAR(100),
            extracted_budget INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }

    private function loadHotels(): void {
        try {
            $stmt = $this->db->query("SELECT name, city, price, stars, rating, description FROM hotels WHERE status='active'");
            $this->hotels = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            $this->hotels = [];
        }

        if (empty($this->hotels)) {
            $this->hotels = [
                ['name' => 'Le Grand Hôtel',        'city' => 'Paris',     'price' => 450,  'stars' => 5, 'rating' => 4.9,  'description' => 'Belle Époque grandeur'],
                ['name' => 'Hôtel de Crillon',       'city' => 'Paris',     'price' => 980,  'stars' => 5, 'rating' => 4.95, 'description' => 'Palatial 18th-century landmark'],
                ['name' => 'Burj Al Arab',           'city' => 'Dubai',     'price' => 1800, 'stars' => 5, 'rating' => 4.85, 'description' => 'Iconic sail-shaped hotel'],
                ['name' => 'Atlantis The Palm',      'city' => 'Dubai',     'price' => 620,  'stars' => 5, 'rating' => 4.7,  'description' => 'Waterpark and restaurants'],
                ['name' => 'The Peninsula',          'city' => 'Tokyo',     'price' => 720,  'stars' => 5, 'rating' => 4.9,  'description' => 'Eastern refinement'],
                ['name' => 'Sofitel Algiers',        'city' => 'Algiers',   'price' => 220,  'stars' => 5, 'rating' => 4.72, 'description' => 'French elegance in Algiers'],
                ['name' => 'El Djazair Hotel',       'city' => 'Algiers',   'price' => 180,  'stars' => 5, 'rating' => 4.65, 'description' => 'Colonial-era landmark'],
                ['name' => 'Four Seasons Bosphorus', 'city' => 'Istanbul',  'price' => 680,  'stars' => 5, 'rating' => 4.91, 'description' => 'Ottoman palace on the Bosphorus'],
                ['name' => 'La Mamounia',            'city' => 'Marrakech', 'price' => 750,  'stars' => 5, 'rating' => 4.94, 'description' => 'Moorish splendour'],
                ['name' => 'Hotel Arts Barcelona',   'city' => 'Barcelona', 'price' => 480,  'stars' => 5, 'rating' => 4.75, 'description' => 'Beachfront masterpiece'],
            ];
        }
    }

    private function parseMessage(string $message): array {
        $text = mb_strtolower($message);
        $city = null; $budget = null;
        $cities = ['paris', 'dubai', 'tokyo', 'algiers', 'marrakech', 'istanbul', 'barcelona'];
        foreach ($cities as $c) {
            if (strpos($text, $c) !== false) { $city = $c; break; }
        }
        if (preg_match('/(\d+)\s*(?:\$|dollars?|usd|dz|dzd)/i', $text, $m)) $budget = (int)$m[1];
        elseif (preg_match('/budget.*?(\d+)/i', $text, $m)) $budget = (int)$m[1];
        elseif (preg_match('/(\d{2,5})/i', $text, $m)) $budget = (int)$m[1];
        return ['city' => $city, 'budget' => $budget];
    }

    private function findMatchingHotels(array $parsed): array {
        $matches = array_filter($this->hotels, function($h) use ($parsed) {
            if ($parsed['city'] && strtolower($h['city']) !== $parsed['city']) return false;
            if ($parsed['budget'] && $h['price'] > $parsed['budget']) return false;
            return true;
        });
        usort($matches, fn($a, $b) => $b['rating'] <=> $a['rating']);
        return array_values(array_slice($matches, 0, 5));
    }

    private function callGroqAPI(string $message, array $history, array $matches): ?string {
        if (empty($this->groqApiKey)) return null;

        $hotelsList = implode("\n", array_map(fn($h) =>
            "- {$h['name']} ({$h['city']}): \${$h['price']}/night, {$h['stars']}★, rated {$h['rating']}/5 — {$h['description']}",
            $this->hotels
        ));

        $systemPrompt = "You are AURUM's AI concierge — an elegant luxury hotel assistant.

Available hotels:
{$hotelsList}

Your behavior:
- Have a REAL conversation. Read the full chat history and respond naturally.
- If the guest has not mentioned a city yet, ask which city they prefer.
- If the guest has not mentioned a budget yet, ask their approximate budget per night.
- Once you know both city and budget, recommend 1-2 specific hotels from the list above ONLY.
- NEVER recommend hotels not in the list above.
- NEVER repeat the same message twice. Each reply must address what the guest just said.
- Detect language: if the guest writes in Arabic reply in Arabic, otherwise reply in English.
- Be warm, cultured, concise (3-5 sentences max).
- End with a natural follow-up question or invitation to book.";

        // Build messages array with history
        $messages = [['role' => 'system', 'content' => $systemPrompt]];
        foreach ($history as $h) {
            if (isset($h['role'], $h['content'])) {
                $messages[] = ['role' => $h['role'], 'content' => $h['content']];
            }
        }
        $messages[] = ['role' => 'user', 'content' => $message];

        $payload = [
            'model'       => 'llama3-8b-8192',
            'messages'    => $messages,
            'temperature' => 0.75,
            'max_tokens'  => 400
        ];

        $ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->groqApiKey
            ],
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_CONNECTTIMEOUT => 5,
        ]);
        $response  = curl_exec($ch);
        $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError || $httpCode !== 200) return null;
        $data = json_decode($response, true);
        return $data['choices'][0]['message']['content'] ?? null;
    }

    private function generateLocalResponse(array $parsed, array $matches): string {
        $isArabic = (bool) preg_match('/[\x{0600}-\x{06FF}]/u', $_SERVER['HTTP_X_USER_MESSAGE'] ?? '');

        if (!$parsed['city'] && !$parsed['budget']) {
            return $isArabic
                ? "أهلاً بك في AURUM! 🌟 أي وجهة تحلم بها؟ لدينا فنادق فاخرة في باريس، دبي، طوكيو، الجزائر، مراكش، إسطنبول، وبرشلونة. وما هي ميزانيتك التقريبية لليلة؟"
                : "Welcome to AURUM! ✨ Which destination are you dreaming of — Paris, Dubai, Tokyo, Algiers, Marrakech, Istanbul, or Barcelona? What's your approximate nightly budget?";
        }
        if (!$parsed['city']) {
            return $isArabic
                ? "بميزانية \${$parsed['budget']} في الليلة، يمكنك الاستمتاع بفنادق فاخرة. أي مدينة تفضل؟"
                : "With \${$parsed['budget']}/night, you can enjoy luxury options. Which city would you like?";
        }
        if (!$parsed['budget']) {
            return $isArabic
                ? ucfirst($parsed['city']) . " وجهة رائعة! ما هي ميزانيتك التقريبية لليلة؟"
                : ucfirst($parsed['city']) . " is a wonderful choice! What's your approximate nightly budget?";
        }
        if (empty($matches)) {
            return $isArabic
                ? "لم أجد فنادق في " . ucfirst($parsed['city']) . " ضمن \${$parsed['budget']}. هل تريد تعديل ميزانيتك؟"
                : "No hotels in " . ucfirst($parsed['city']) . " within \${$parsed['budget']}/night. Would you like to adjust your budget?";
        }
        $top = $matches[0];
        $reply = "I recommend **{$top['name']}** in " . ucfirst($top['city']) . " — {$top['description']}, from \${$top['price']}/night ({$top['stars']}★).";
        if (count($matches) > 1) $reply .= " Another great option is **{$matches[1]['name']}** from \${$matches[1]['price']}/night. Shall I check availability?";
        return $reply;
    }

    public function chat(): void {
        $input   = json_decode(file_get_contents('php://input'), true);
        $message = trim($input['message'] ?? '');
        $history = $input['history'] ?? [];
        if (!$message) Response::error('Message required');

        $_SERVER['HTTP_X_USER_MESSAGE'] = $message;

        $parsed  = $this->parseMessage($message);
        $matches = $this->findMatchingHotels($parsed);
        $aiText  = $this->callGroqAPI($message, $history, $matches);
        if (!$aiText) $aiText = $this->generateLocalResponse($parsed, $matches);

        $stmt = $this->db->prepare("INSERT INTO ai_conversations (session_id, user_message, ai_response, extracted_city, extracted_budget) VALUES (?,?,?,?,?)");
        $stmt->execute([$input['session_id'] ?? uniqid(), $message, $aiText, $parsed['city'], $parsed['budget']]);

        Response::success(['response' => $aiText, 'suggestions' => $matches], 'AI response');
    }

    public function trainFromConversations(): array {
        $stmt = $this->db->query("SELECT extracted_city, extracted_budget, COUNT(*) as count FROM ai_conversations WHERE extracted_city IS NOT NULL GROUP BY extracted_city, extracted_budget ORDER BY count DESC LIMIT 20");
        $insights  = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $cityStats = [];
        foreach ($insights as $i) {
            $cityStats[$i['extracted_city']] = ($cityStats[$i['extracted_city']] ?? 0) + $i['count'];
        }
        return [
            'top_destinations'    => $cityStats,
            'total_conversations' => (int)$this->db->query("SELECT COUNT(*) FROM ai_conversations")->fetchColumn(),
        ];
    }
}
?>
