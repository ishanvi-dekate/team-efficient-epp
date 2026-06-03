import Foundation

struct GeminiMessage: Codable {
    var role: String
    var content: String
}

struct GeminiRequest: Codable {
    var model: String
    var messages: [GeminiMessage]
    var max_tokens: Int
}

struct GeminiResponse: Codable {
    struct Choice: Codable {
        struct Message: Codable { var content: String }
        var message: Message
    }
    var choices: [Choice]
}

final class GeminiService {
    static let shared = GeminiService()

    // Set your Gemini API key here or load from Info.plist key "GEMINI_API_KEY"
    var apiKey: String {
        Bundle.main.object(forInfoDictionaryKey: "GEMINI_API_KEY") as? String ?? ""
    }

    private let endpoint = URL(string: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions")!
    private init() {}

    func chat(systemPrompt: String, history: [ChatMessage], userMessage: String) async throws -> String {
        var messages: [GeminiMessage] = [GeminiMessage(role: "system", content: systemPrompt)]
        for msg in history.suffix(10) {
            messages.append(GeminiMessage(role: msg.role.rawValue, content: msg.text))
        }
        messages.append(GeminiMessage(role: "user", content: userMessage))

        let body = GeminiRequest(model: "gemini-2.0-flash", messages: messages, max_tokens: 2000)

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONEncoder().encode(body)

        for attempt in 0..<3 {
            do {
                let (data, response) = try await URLSession.shared.data(for: request)
                guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
                    if attempt < 2 {
                        try await Task.sleep(nanoseconds: UInt64(pow(2.0, Double(attempt))) * 1_000_000_000)
                        continue
                    }
                    throw GeminiError.rateLimited
                }
                let decoded = try JSONDecoder().decode(GeminiResponse.self, from: data)
                return decoded.choices.first?.message.content ?? ""
            } catch let error as GeminiError {
                throw error
            } catch {
                if attempt == 2 { throw error }
                try await Task.sleep(nanoseconds: UInt64(pow(2.0, Double(attempt))) * 1_000_000_000)
            }
        }
        throw GeminiError.rateLimited
    }

    enum GeminiError: LocalizedError {
        case rateLimited
        var errorDescription: String? { "AI is currently busy. Please try again in a moment." }
    }
}
