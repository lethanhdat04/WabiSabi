package com.nihongomaster.domain.vocabulary

import com.nihongomaster.domain.video.JLPTLevel
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.Id
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.mongodb.core.index.CompoundIndex
import org.springframework.data.mongodb.core.index.Indexed
import org.springframework.data.mongodb.core.index.TextIndexed
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

/**
 * VocabularyDeck entity representing a collection of vocabulary items
 * organized into sections for learning.
 */
@Document(collection = "vocabulary_decks")
@CompoundIndex(name = "creator_status_idx", def = "{'createdBy': 1, 'status': 1}")
@CompoundIndex(name = "public_level_idx", def = "{'isPublic': 1, 'level': 1}")
@CompoundIndex(name = "topic_level_idx", def = "{'topic': 1, 'level': 1}")
data class VocabularyDeck(
    @Id
    val id: String? = null,

    @TextIndexed(weight = 3F)
    val title: String,

    @TextIndexed
    val description: String? = null,

    val coverImageUrl: String? = null,

    val languageDirection: LanguageDirection = LanguageDirection.JP_EN,

    @Indexed
    val level: JLPTLevel,

    @Indexed
    val topic: DeckTopic,

    val tags: List<String> = emptyList(),

    @Indexed
    val isPublic: Boolean = false,

    val isOfficial: Boolean = false,

    @Indexed
    val createdBy: String,  // User ID

    val sections: List<VocabularySection> = emptyList(),

    val stats: DeckStats = DeckStats(),

    @Indexed
    val status: DeckStatus = DeckStatus.ACTIVE,

    @CreatedDate
    val createdAt: Instant? = null,

    @LastModifiedDate
    val updatedAt: Instant? = null
) {
    /**
     * Get total vocabulary count across all sections.
     */
    fun getTotalVocabularyCount(): Int = sections.sumOf { it.items.size }

    /**
     * Get total section count.
     */
    fun getSectionCount(): Int = sections.size

    /**
     * Get a specific section by index.
     */
    fun getSection(index: Int): VocabularySection? = sections.getOrNull(index)

    /**
     * Get a specific vocabulary item by section and item index.
     */
    fun getVocabularyItem(sectionIndex: Int, itemIndex: Int): VocabularyItem? {
        return sections.getOrNull(sectionIndex)?.items?.getOrNull(itemIndex)
    }

    /**
     * Get all vocabulary items as a flat list.
     */
    fun getAllVocabularyItems(): List<VocabularyItem> = sections.flatMap { it.items }

    /**
     * Check if deck belongs to a specific user.
     */
    fun belongsTo(userId: String): Boolean = createdBy == userId

    /**
     * Check if deck is accessible by a specific user.
     */
    fun isAccessibleBy(userId: String): Boolean = isPublic || createdBy == userId
}

/**
 * Section containing a group of vocabulary items (10-20 items recommended).
 */
data class VocabularySection(
    val index: Int,                          // 0-based section index
    val title: String,                       // e.g., "Unit 1", "Food & Drinks"
    val description: String? = null,
    val items: List<VocabularyItem> = emptyList()
) {
    fun getItemCount(): Int = items.size
}

/**
 * Individual vocabulary item within a section.
 */
data class VocabularyItem(
    val index: Int,                          // Index within section
    val japaneseWord: String,                // Kanji or kana form
    val reading: String,                     // Hiragana/romaji reading
    val meaning: String,                     // Translation (EN/VI)
    val partOfSpeech: PartOfSpeech? = null,  // Noun, verb, etc.
    val exampleSentence: String? = null,     // Japanese example
    val exampleMeaning: String? = null,      // Translation of example
    val imageUrl: String? = null,            // Visual aid
    val audioUrl: String? = null,            // Pronunciation audio
    val notes: String? = null                // Additional notes
) {
    /**
     * Check if this item has multimedia content.
     */
    fun hasImage(): Boolean = !imageUrl.isNullOrBlank()
    fun hasAudio(): Boolean = !audioUrl.isNullOrBlank()
    fun hasExample(): Boolean = !exampleSentence.isNullOrBlank()
}

/**
 * Language direction for the deck.
 */
enum class LanguageDirection {
    JP_EN,   // Japanese → English
    JP_VI,   // Japanese → Vietnamese
    EN_JP,   // English → Japanese
    VI_JP    // Vietnamese → Japanese
}

/**
 * Deck topic categories.
 */
enum class DeckTopic {
    GENERAL,
    GRAMMAR,
    KANJI,
    DAILY_LIFE,
    TRAVEL,
    BUSINESS,
    FOOD,
    CULTURE,
    ANIME_MANGA,
    JLPT_N5,
    JLPT_N4,
    JLPT_N3,
    JLPT_N2,
    JLPT_N1,
    OTHER
}

/**
 * Part of speech for vocabulary items.
 */
enum class PartOfSpeech {
    NOUN,
    VERB,
    I_ADJECTIVE,
    NA_ADJECTIVE,
    ADVERB,
    PARTICLE,
    CONJUNCTION,
    EXPRESSION,
    COUNTER,
    PREFIX,
    SUFFIX,
    OTHER
}

/**
 * Deck statistics.
 */
data class DeckStats(
    val viewCount: Long = 0,
    val studyCount: Long = 0,        // Times studied
    val starCount: Int = 0,          // Users who starred
    val forkCount: Int = 0,          // Times forked
    val averageScore: Double = 0.0,  // Average practice score
    val completionRate: Double = 0.0 // Average completion rate
)

/**
 * Deck status.
 */
enum class DeckStatus {
    ACTIVE,
    ARCHIVED,
    DELETED
}
