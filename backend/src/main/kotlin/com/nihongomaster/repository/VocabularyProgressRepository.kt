package com.nihongomaster.repository

import com.nihongomaster.domain.vocabulary.VocabularyProgress
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.Aggregation
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.Optional

/**
 * Repository for VocabularyProgress entity operations.
 */
@Repository
interface VocabularyProgressRepository : MongoRepository<VocabularyProgress, String> {

    /**
     * Find progress by user and deck (unique combination).
     */
    fun findByUserIdAndDeckId(userId: String, deckId: String): Optional<VocabularyProgress>

    /**
     * Find all progress records for a user.
     */
    fun findByUserId(userId: String, pageable: Pageable): Page<VocabularyProgress>

    /**
     * Find progress for a user ordered by last studied.
     */
    fun findByUserIdOrderByLastStudiedAtDesc(userId: String, pageable: Pageable): Page<VocabularyProgress>

    /**
     * Find recently studied decks by user.
     */
    fun findTop10ByUserIdOrderByLastStudiedAtDesc(userId: String): List<VocabularyProgress>

    /**
     * Find progress records that need review.
     */
    fun findByUserIdAndLastStudiedAtBefore(
        userId: String,
        beforeDate: Instant,
        pageable: Pageable
    ): Page<VocabularyProgress>

    /**
     * Check if progress exists for user and deck.
     */
    fun existsByUserIdAndDeckId(userId: String, deckId: String): Boolean

    /**
     * Count decks studied by user.
     */
    fun countByUserId(userId: String): Long

    /**
     * Delete progress for a specific deck.
     */
    fun deleteByDeckId(deckId: String)

    /**
     * Delete user's progress for a deck.
     */
    fun deleteByUserIdAndDeckId(userId: String, deckId: String)

    /**
     * Find users who studied a deck.
     */
    fun findByDeckId(deckId: String, pageable: Pageable): Page<VocabularyProgress>

    /**
     * Count users who studied a deck.
     */
    fun countByDeckId(deckId: String): Long

    /**
     * Calculate average completion for a deck.
     */
    @Aggregation(pipeline = [
        "{ '\$match': { 'deckId': ?0 } }",
        "{ '\$group': { '_id': null, 'avgMastered': { '\$avg': '\$overallStats.itemsMastered' } } }"
    ])
    fun calculateAverageMasteredByDeckId(deckId: String): Double?
}
