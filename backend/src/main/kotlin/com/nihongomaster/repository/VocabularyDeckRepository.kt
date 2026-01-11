package com.nihongomaster.repository

import com.nihongomaster.domain.video.JLPTLevel
import com.nihongomaster.domain.vocabulary.DeckStatus
import com.nihongomaster.domain.vocabulary.DeckTopic
import com.nihongomaster.domain.vocabulary.VocabularyDeck
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query
import org.springframework.stereotype.Repository

/**
 * Repository for VocabularyDeck entity operations.
 */
@Repository
interface VocabularyDeckRepository : MongoRepository<VocabularyDeck, String> {

    /**
     * Find all public decks with pagination.
     */
    fun findByIsPublicAndStatus(
        isPublic: Boolean,
        status: DeckStatus,
        pageable: Pageable
    ): Page<VocabularyDeck>

    /**
     * Find public decks by level.
     */
    fun findByIsPublicAndStatusAndLevel(
        isPublic: Boolean,
        status: DeckStatus,
        level: JLPTLevel,
        pageable: Pageable
    ): Page<VocabularyDeck>

    /**
     * Find public decks by topic.
     */
    fun findByIsPublicAndStatusAndTopic(
        isPublic: Boolean,
        status: DeckStatus,
        topic: DeckTopic,
        pageable: Pageable
    ): Page<VocabularyDeck>

    /**
     * Find public decks by level and topic.
     */
    fun findByIsPublicAndStatusAndLevelAndTopic(
        isPublic: Boolean,
        status: DeckStatus,
        level: JLPTLevel,
        topic: DeckTopic,
        pageable: Pageable
    ): Page<VocabularyDeck>

    /**
     * Find decks created by a specific user.
     */
    fun findByCreatedByAndStatus(
        createdBy: String,
        status: DeckStatus,
        pageable: Pageable
    ): Page<VocabularyDeck>

    /**
     * Find official decks.
     */
    fun findByIsOfficialAndStatus(
        isOfficial: Boolean,
        status: DeckStatus,
        pageable: Pageable
    ): Page<VocabularyDeck>

    /**
     * Find decks accessible by a user (public or owned).
     */
    @Query("{ '\$or': [ { 'isPublic': true }, { 'createdBy': ?0 } ], 'status': ?1 }")
    fun findAccessibleByUser(
        userId: String,
        status: DeckStatus,
        pageable: Pageable
    ): Page<VocabularyDeck>

    /**
     * Text search on title and description.
     */
    @Query("{ '\$text': { '\$search': ?0 }, 'isPublic': true, 'status': ?1 }")
    fun searchPublicDecks(
        searchText: String,
        status: DeckStatus,
        pageable: Pageable
    ): Page<VocabularyDeck>

    /**
     * Find popular public decks by study count.
     */
    @Query("{ 'isPublic': true, 'status': ?0 }")
    fun findPopularDecks(
        status: DeckStatus,
        pageable: Pageable
    ): Page<VocabularyDeck>

    /**
     * Count decks by user.
     */
    fun countByCreatedByAndStatus(createdBy: String, status: DeckStatus): Long

    /**
     * Count public decks by level.
     */
    fun countByIsPublicAndStatusAndLevel(
        isPublic: Boolean,
        status: DeckStatus,
        level: JLPTLevel
    ): Long

    /**
     * Count public decks by topic.
     */
    fun countByIsPublicAndStatusAndTopic(
        isPublic: Boolean,
        status: DeckStatus,
        topic: DeckTopic
    ): Long

    /**
     * Check if user owns a deck.
     */
    fun existsByIdAndCreatedBy(id: String, createdBy: String): Boolean
}
