package com.nihongomaster.service.practice

import com.nihongomaster.domain.practice.*
import org.springframework.stereotype.Service
import kotlin.math.abs
import kotlin.math.min
import kotlin.random.Random

/**
 * Mock AI Service for generating simulated evaluation results.
 * In production, this would integrate with real speech recognition and analysis APIs.
 *
 * This mock service generates realistic-looking scores and feedback
 * for development and testing purposes.
 */
@Service
class MockAIService {

    // ===========================================
    // SHADOWING EVALUATION (Mock)
    // ===========================================

    /**
     * Generate mock shadowing evaluation based on audio analysis.
     * In production: Would send audio to speech recognition API.
     */
    fun evaluateShadowing(audioUrl: String, referenceText: String): ShadowingEvaluation {
        // Generate realistic random scores (normally distributed around 70-85)
        val baseScore = 70 + Random.nextDouble() * 20  // 70-90 range
        val variance = 10.0

        val pronunciationScore = clampScore(baseScore + randomVariance(variance))
        val speedScore = clampScore(baseScore + randomVariance(variance))
        val intonationScore = clampScore(baseScore + randomVariance(variance))

        // Weighted overall score
        val overallScore = clampScore(
            pronunciationScore * 0.45 +
            speedScore * 0.25 +
            intonationScore * 0.30
        )

        val feedbackText = generateShadowingFeedback(
            pronunciationScore, speedScore, intonationScore, overallScore
        )

        val detailedFeedback = generateDetailedShadowingFeedback(
            pronunciationScore, speedScore, intonationScore, referenceText
        )

        return ShadowingEvaluation(
            pronunciationScore = roundScore(pronunciationScore),
            speedScore = roundScore(speedScore),
            intonationScore = roundScore(intonationScore),
            overallScore = roundScore(overallScore),
            feedbackText = feedbackText,
            detailedFeedback = detailedFeedback
        )
    }

    private fun generateShadowingFeedback(
        pronunciation: Double,
        speed: Double,
        intonation: Double,
        overall: Double
    ): String {
        val grade = getGrade(overall)
        val builder = StringBuilder()

        builder.append(
            when (grade) {
                "A" -> "Excellent work! Your shadowing was very accurate. "
                "B" -> "Great job! Your pronunciation is quite good. "
                "C" -> "Good effort! Keep practicing to improve. "
                "D" -> "You're making progress. Focus on the areas below. "
                else -> "Keep practicing! Here are some tips to help. "
            }
        )

        // Add specific feedback based on lowest score
        val minScore = minOf(pronunciation, speed, intonation)
        when {
            minScore == pronunciation && pronunciation < 75 ->
                builder.append("Pay attention to individual sound pronunciation. ")
            minScore == speed && speed < 75 ->
                builder.append("Try to match the natural speaking pace. ")
            minScore == intonation && intonation < 75 ->
                builder.append("Focus on the pitch and rhythm patterns. ")
        }

        return builder.toString().trim()
    }

    private fun generateDetailedShadowingFeedback(
        pronunciation: Double,
        speed: Double,
        intonation: Double,
        referenceText: String
    ): DetailedShadowingFeedback {
        val strengths = mutableListOf<String>()
        val improvements = mutableListOf<String>()
        val tips = mutableListOf<String>()

        // Add strengths
        if (pronunciation >= 80) strengths.add("Clear pronunciation of most sounds")
        if (speed >= 80) strengths.add("Good speaking pace")
        if (intonation >= 80) strengths.add("Natural intonation pattern")
        if (strengths.isEmpty()) strengths.add("Showing effort and consistency")

        // Add improvements
        if (pronunciation < 80) improvements.add("Practice difficult sounds (e.g., っ, ん, long vowels)")
        if (speed < 80) improvements.add("Work on matching the natural speaking rhythm")
        if (intonation < 80) improvements.add("Pay attention to pitch accent patterns")

        // Add specific tips
        tips.add("Listen to the segment multiple times before recording")
        tips.add("Record yourself and compare with the original")
        if (pronunciation < 75) tips.add("Break down difficult words into syllables")
        if (speed < 75) tips.add("Start slow and gradually increase speed")

        // Mock transcribed text (simulating what AI "heard")
        val mockTranscription = simulateTranscription(referenceText)

        // Generate mock phoneme analysis
        val phonemeAnalysis = generateMockPhonemeAnalysis(referenceText)

        return DetailedShadowingFeedback(
            strengths = strengths,
            improvements = improvements,
            specificTips = tips,
            transcribedText = mockTranscription,
            phonemeAnalysis = phonemeAnalysis
        )
    }

    private fun simulateTranscription(original: String): String {
        // Simulate minor transcription variations (for mock purposes)
        return if (Random.nextDouble() > 0.3) {
            original
        } else {
            // Introduce a minor "error" occasionally
            original.replace("です", "でした").replace("ます", "ました")
        }
    }

    private fun generateMockPhonemeAnalysis(text: String): List<PhonemeScore> {
        // Generate a few mock phoneme scores
        val phonemes = listOf("あ", "い", "う", "え", "お", "か", "さ", "た", "な", "は")
        return phonemes.filter { text.contains(it) }.take(5).map { phoneme ->
            PhonemeScore(
                phoneme = phoneme,
                expected = phoneme,
                actual = phoneme,
                score = roundScore(75 + Random.nextDouble() * 25)
            )
        }
    }

    // ===========================================
    // DICTATION EVALUATION (Mock)
    // ===========================================

    /**
     * Evaluate dictation attempt by comparing user input with correct text.
     * Uses string similarity algorithms for accuracy calculation.
     */
    fun evaluateDictation(userInput: String, correctText: String): DictationEvaluation {
        val normalizedInput = normalizeJapaneseText(userInput)
        val normalizedCorrect = normalizeJapaneseText(correctText)

        // Calculate various accuracy metrics
        val characterAccuracy = calculateCharacterAccuracy(normalizedInput, normalizedCorrect)
        val wordAccuracy = calculateWordAccuracy(normalizedInput, normalizedCorrect)
        val similarityScore = calculateLevenshteinSimilarity(normalizedInput, normalizedCorrect)

        // Weighted overall score
        val overallScore = clampScore(
            characterAccuracy * 0.4 +
            wordAccuracy * 0.3 +
            similarityScore * 0.3
        )

        val mistakes = findMistakes(normalizedInput, normalizedCorrect)

        val feedbackText = generateDictationFeedback(overallScore, mistakes.size)

        val detailedFeedback = generateDetailedDictationFeedback(
            normalizedInput, normalizedCorrect, overallScore, mistakes
        )

        return DictationEvaluation(
            accuracyScore = roundScore(similarityScore),
            characterAccuracy = roundScore(characterAccuracy),
            wordAccuracy = roundScore(wordAccuracy),
            overallScore = roundScore(overallScore),
            feedbackText = feedbackText,
            mistakes = mistakes,
            detailedFeedback = detailedFeedback
        )
    }

    private fun normalizeJapaneseText(text: String): String {
        return text
            .trim()
            .replace("\\s+".toRegex(), "")  // Remove spaces
            .replace("　", "")               // Remove full-width spaces
            .lowercase()                      // Lowercase for comparison
    }

    private fun calculateCharacterAccuracy(input: String, correct: String): Double {
        if (correct.isEmpty()) return if (input.isEmpty()) 100.0 else 0.0

        var matches = 0
        val minLen = min(input.length, correct.length)

        for (i in 0 until minLen) {
            if (input[i] == correct[i]) matches++
        }

        return (matches.toDouble() / correct.length) * 100
    }

    private fun calculateWordAccuracy(input: String, correct: String): Double {
        // For Japanese, we'll use character-based "word" splitting
        // In production, would use proper morphological analysis
        val inputChars = input.toList()
        val correctChars = correct.toList()

        if (correctChars.isEmpty()) return if (inputChars.isEmpty()) 100.0 else 0.0

        val correctSet = correctChars.toSet()
        val inputSet = inputChars.toSet()
        val intersection = correctSet.intersect(inputSet)

        return (intersection.size.toDouble() / correctSet.size) * 100
    }

    private fun calculateLevenshteinSimilarity(s1: String, s2: String): Double {
        if (s1.isEmpty() && s2.isEmpty()) return 100.0
        if (s1.isEmpty() || s2.isEmpty()) return 0.0

        val distance = levenshteinDistance(s1, s2)
        val maxLength = maxOf(s1.length, s2.length)

        return ((maxLength - distance).toDouble() / maxLength) * 100
    }

    private fun levenshteinDistance(s1: String, s2: String): Int {
        val m = s1.length
        val n = s2.length

        val dp = Array(m + 1) { IntArray(n + 1) }

        for (i in 0..m) dp[i][0] = i
        for (j in 0..n) dp[0][j] = j

        for (i in 1..m) {
            for (j in 1..n) {
                val cost = if (s1[i - 1] == s2[j - 1]) 0 else 1
                dp[i][j] = minOf(
                    dp[i - 1][j] + 1,      // deletion
                    dp[i][j - 1] + 1,      // insertion
                    dp[i - 1][j - 1] + cost // substitution
                )
            }
        }

        return dp[m][n]
    }

    private fun findMistakes(input: String, correct: String): List<DictationMistake> {
        val mistakes = mutableListOf<DictationMistake>()
        val maxLen = maxOf(input.length, correct.length)

        for (i in 0 until min(maxLen, 10)) { // Limit to first 10 mistakes
            when {
                i >= input.length -> {
                    // Missing character
                    mistakes.add(
                        DictationMistake(
                            position = i,
                            expected = correct[i].toString(),
                            actual = "",
                            type = MistakeType.MISSING
                        )
                    )
                }
                i >= correct.length -> {
                    // Extra character
                    mistakes.add(
                        DictationMistake(
                            position = i,
                            expected = "",
                            actual = input[i].toString(),
                            type = MistakeType.EXTRA
                        )
                    )
                }
                input[i] != correct[i] -> {
                    // Substitution
                    mistakes.add(
                        DictationMistake(
                            position = i,
                            expected = correct[i].toString(),
                            actual = input[i].toString(),
                            type = MistakeType.SUBSTITUTION
                        )
                    )
                }
            }
        }

        return mistakes
    }

    private fun generateDictationFeedback(score: Double, mistakeCount: Int): String {
        val grade = getGrade(score)

        return when (grade) {
            "A" -> "Perfect! You heard and wrote everything correctly."
            "B" -> "Great work! Just a few minor mistakes."
            "C" -> "Good effort! You got most of it right. Review the highlighted mistakes."
            "D" -> "Keep practicing! Focus on listening to each syllable carefully."
            else -> "Don't give up! Try listening multiple times and writing slowly."
        } + if (mistakeCount > 0) " ($mistakeCount mistake${if (mistakeCount > 1) "s" else ""} found)" else ""
    }

    private fun generateDetailedDictationFeedback(
        input: String,
        correct: String,
        score: Double,
        mistakes: List<DictationMistake>
    ): DetailedDictationFeedback {
        val strengths = mutableListOf<String>()
        val improvements = mutableListOf<String>()
        val tips = mutableListOf<String>()

        // Analyze results
        if (score >= 90) strengths.add("Excellent listening comprehension")
        if (score >= 80) strengths.add("Good character recognition")
        if (mistakes.isEmpty()) strengths.add("Perfect accuracy!")

        if (mistakes.isNotEmpty()) {
            val missingCount = mistakes.count { it.type == MistakeType.MISSING }
            val extraCount = mistakes.count { it.type == MistakeType.EXTRA }
            val substitutionCount = mistakes.count { it.type == MistakeType.SUBSTITUTION }

            if (missingCount > 0) improvements.add("Listen for all syllables - $missingCount characters were missed")
            if (extraCount > 0) improvements.add("Be careful not to add extra characters")
            if (substitutionCount > 0) improvements.add("Pay attention to similar-sounding characters")
        }

        // Tips
        tips.add("Listen to the segment at a slower speed if available")
        tips.add("Break down long sentences into smaller parts")
        if (score < 70) tips.add("Try writing the romaji first, then convert to Japanese")

        // Identify correct and incorrect segments
        val correctSegments = mutableListOf<String>()
        val incorrectSegments = mutableListOf<String>()

        if (input.isNotEmpty() && correct.isNotEmpty()) {
            // Simple segment identification (character-by-character)
            var currentCorrect = StringBuilder()
            var currentIncorrect = StringBuilder()

            for (i in correct.indices) {
                if (i < input.length && input[i] == correct[i]) {
                    if (currentIncorrect.isNotEmpty()) {
                        incorrectSegments.add(currentIncorrect.toString())
                        currentIncorrect = StringBuilder()
                    }
                    currentCorrect.append(correct[i])
                } else {
                    if (currentCorrect.isNotEmpty()) {
                        correctSegments.add(currentCorrect.toString())
                        currentCorrect = StringBuilder()
                    }
                    currentIncorrect.append(if (i < input.length) input[i] else "⬜")
                }
            }

            if (currentCorrect.isNotEmpty()) correctSegments.add(currentCorrect.toString())
            if (currentIncorrect.isNotEmpty()) incorrectSegments.add(currentIncorrect.toString())
        }

        val similarity = calculateLevenshteinSimilarity(input, correct)

        return DetailedDictationFeedback(
            strengths = strengths.ifEmpty { listOf("Good attempt!") },
            improvements = improvements,
            specificTips = tips,
            correctSegments = correctSegments.take(5),
            incorrectSegments = incorrectSegments.take(5),
            similarityPercentage = roundScore(similarity)
        )
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================

    private fun randomVariance(range: Double): Double {
        return (Random.nextDouble() - 0.5) * 2 * range
    }

    private fun clampScore(score: Double): Double {
        return score.coerceIn(0.0, 100.0)
    }

    private fun roundScore(score: Double): Double {
        return (score * 10).toInt() / 10.0  // Round to 1 decimal place
    }

    /**
     * Get letter grade based on score.
     */
    fun getGrade(score: Double): String {
        return when {
            score >= 90 -> "A"
            score >= 80 -> "B"
            score >= 70 -> "C"
            score >= 60 -> "D"
            else -> "F"
        }
    }
}
