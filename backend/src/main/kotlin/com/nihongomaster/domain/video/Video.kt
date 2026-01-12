package com.nihongomaster.domain.video

import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.index.TextIndexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * Video entity representing a learning video in the library.
 * Videos are sourced from YouTube and contain Japanese subtitle segments.
 */
@Document(collection = "videos")
@CompoundIndex(name = "category_level_idx", def = "{'category': 1, 'level': 1}")
@CompoundIndex(name = "status_created_idx", def = "{'status': 1, 'createdAt': -1}")
data class Video(
    @Id
    val id: String? = null,

    @TextIndexed(weight = 3F)
    val title: String,

    @TextIndexed(weight = 2F)
    val titleJapanese: String? = null,

    @TextIndexed
    val description: String? = null,

    @Indexed(unique = true)
    val youtubeId: String,

    val thumbnailUrl: String,

    val duration: Int,  // Duration in seconds (1-5 minutes = 60-300)

    @Indexed
    val category: VideoCategory,

    @Indexed
    val level: JLPTLevel,

    val tags: List<String> = emptyList(),

    val subtitles: List<SubtitleSegment> = emptyList(),

    val uploadedBy: String,  // User ID of uploader (admin)

    val isOfficial: Boolean = false,  // Admin-curated content

    val status: VideoStatus = VideoStatus.PUBLISHED,

    val stats: VideoStats = VideoStats(),

    @CreatedDate
    val createdAt: Instant? = null,

    @LastModifiedDate
    val updatedAt: Instant? = null
) {
    /**
     * Get total number of subtitle segments.
     */
    fun getSegmentCount(): Int = subtitles.size

    /**
     * Get a specific subtitle segment by index.
     */
    fun getSegment(index: Int): SubtitleSegment? = subtitles.getOrNull(index)

    /**
     * Check if video duration is within valid range (1-5 minutes).
     */
    fun isValidDuration(): Boolean = duration in 60..300
}

/**
 * Subtitle segment representing a single sentence/phrase in the video.
 * Used for both shadowing and dictation practice.
 */
data class SubtitleSegment(
    val index: Int,                      // 0-based segment index
    val japaneseText: String,            // Original Japanese text
    val romaji: String? = null,          // Romanized pronunciation (optional)
    val meaning: String,                 // Vietnamese/English translation
    val startTime: Double,               // Start time in seconds (e.g., 0.5)
    val endTime: Double,                 // End time in seconds (e.g., 3.2)
    val vocabulary: List<VocabularyReference> = emptyList()  // Key vocabulary words with details
) {
    /**
     * Get duration of this segment in seconds.
     */
    fun getDuration(): Double = endTime - startTime

    /**
     * Get character count of Japanese text.
     */
    fun getCharacterCount(): Int = japaneseText.length
}

/**
 * Vocabulary reference within a subtitle segment.
 * Contains word details for learning purposes.
 */
data class VocabularyReference(
    val word: String,                    // Japanese word (e.g., "おはよう")
    val reading: String,                 // Hiragana/katakana reading (e.g., "おはよう")
    val meaning: String,                 // English/Vietnamese meaning
    val partOfSpeech: String? = null     // Part of speech (e.g., "Expression", "Verb", "Noun")
)

/**
 * Video statistics for tracking engagement.
 */
data class VideoStats(
    val viewCount: Long = 0,
    val practiceCount: Long = 0,
    val shadowingCount: Long = 0,
    val dictationCount: Long = 0,
    val averageScore: Double = 0.0,
    val totalRatings: Int = 0,
    val averageRating: Double = 0.0
)

/**
 * Video categories for content organization.
 */
enum class VideoCategory {
    DAILY_LIFE,     // Everyday conversations
    BUSINESS,       // Business Japanese
    ANIME,          // Anime and manga
    NEWS,           // News and current events
    TRAVEL,         // Travel and tourism
    CULTURE,        // Japanese culture
    EDUCATION,      // Educational content
    MUSIC,          // Songs and music
    INTERVIEW,      // Interviews
    OTHER           // Miscellaneous
}

/**
 * JLPT levels for difficulty classification.
 */
enum class JLPTLevel {
    N5,  // Beginner (easiest)
    N4,  // Elementary
    N3,  // Intermediate
    N2,  // Upper-intermediate
    N1   // Advanced (most difficult)
}

/**
 * Video publication status.
 */
enum class VideoStatus {
    DRAFT,      // Not yet published
    PUBLISHED,  // Active and visible
    ARCHIVED,   // Hidden but not deleted
    DELETED     // Soft deleted
}
