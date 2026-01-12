package com.nihongomaster.service.vocabulary

import com.nihongomaster.domain.video.JLPTLevel
import com.nihongomaster.domain.vocabulary.*
import com.nihongomaster.dto.*
import com.nihongomaster.exception.ForbiddenException
import com.nihongomaster.exception.ResourceNotFoundException
import com.nihongomaster.mapper.VocabularyMapper
import com.nihongomaster.repository.UserRepository
import com.nihongomaster.repository.VocabularyDeckRepository
import com.nihongomaster.repository.VocabularyProgressRepository
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Service for managing vocabulary decks.
 */
@Service
class DeckService(
    private val deckRepository: VocabularyDeckRepository,
    private val progressRepository: VocabularyProgressRepository,
    private val userRepository: UserRepository,
    private val mapper: VocabularyMapper
) {
    private val logger = LoggerFactory.getLogger(DeckService::class.java)

    // ================================
    // Deck CRUD Operations
    // ================================

    /**
     * Create a new vocabulary deck.
     */
    @Transactional
    fun createDeck(request: CreateDeckRequest, userId: String): DeckResponse {
        logger.info("Creating deck '${request.title}' for user $userId")

        val deck = mapper.toEntity(request, userId)
        val savedDeck = deckRepository.save(deck)

        val creatorName = getCreatorName(userId)
        return mapper.toResponse(savedDeck, creatorName)
    }

    /**
     * Get a deck by ID.
     */
    fun getDeck(deckId: String, userId: String?): DeckResponse {
        val deck = findDeckById(deckId)

        // Check access permissions
        if (!deck.isPublic && deck.createdBy != userId) {
            throw ForbiddenException("You don't have access to this deck")
        }

        // Increment view count
        incrementViewCount(deck)

        val creatorName = getCreatorName(deck.createdBy)
        return mapper.toResponse(deck, creatorName)
    }

    /**
     * Get deck summary (without full content).
     */
    fun getDeckSummary(deckId: String, userId: String?): DeckSummaryResponse {
        val deck = findDeckById(deckId)

        if (!deck.isPublic && deck.createdBy != userId) {
            throw ForbiddenException("You don't have access to this deck")
        }

        val creatorName = getCreatorName(deck.createdBy)
        return mapper.toSummaryResponse(deck, creatorName)
    }

    /**
     * Update a deck.
     */
    @Transactional
    fun updateDeck(deckId: String, request: UpdateDeckRequest, userId: String): DeckResponse {
        val deck = findDeckById(deckId)

        if (deck.createdBy != userId) {
            throw ForbiddenException("You can only update your own decks")
        }

        val updatedDeck = deck.copy(
            title = request.title ?: deck.title,
            description = request.description ?: deck.description,
            coverImageUrl = request.coverImageUrl ?: deck.coverImageUrl,
            languageDirection = request.languageDirection ?: deck.languageDirection,
            level = request.level ?: deck.level,
            topic = request.topic ?: deck.topic,
            tags = request.tags ?: deck.tags,
            isPublic = request.isPublic ?: deck.isPublic
        )

        val savedDeck = deckRepository.save(updatedDeck)
        val creatorName = getCreatorName(userId)
        return mapper.toResponse(savedDeck, creatorName)
    }

    /**
     * Delete a deck (soft delete).
     */
    @Transactional
    fun deleteDeck(deckId: String, userId: String) {
        val deck = findDeckById(deckId)

        if (deck.createdBy != userId) {
            throw ForbiddenException("You can only delete your own decks")
        }

        val deletedDeck = deck.copy(status = DeckStatus.DELETED)
        deckRepository.save(deletedDeck)

        logger.info("Deck $deckId marked as deleted by user $userId")
    }

    /**
     * Archive a deck.
     */
    @Transactional
    fun archiveDeck(deckId: String, userId: String): DeckResponse {
        val deck = findDeckById(deckId)

        if (deck.createdBy != userId) {
            throw ForbiddenException("You can only archive your own decks")
        }

        val archivedDeck = deck.copy(status = DeckStatus.ARCHIVED)
        val savedDeck = deckRepository.save(archivedDeck)
        val creatorName = getCreatorName(userId)
        return mapper.toResponse(savedDeck, creatorName)
    }

    // ================================
    // Section Management
    // ================================

    /**
     * Add a section to a deck.
     */
    @Transactional
    fun addSection(deckId: String, request: AddSectionRequest, userId: String): DeckResponse {
        val deck = findDeckById(deckId)

        if (deck.createdBy != userId) {
            throw ForbiddenException("You can only modify your own decks")
        }

        val newSectionIndex = deck.sections.size
        val newSection = mapper.toSectionEntity(request, newSectionIndex)
        val updatedSections = deck.sections + newSection

        val updatedDeck = deck.copy(sections = updatedSections)
        val savedDeck = deckRepository.save(updatedDeck)

        val creatorName = getCreatorName(userId)
        return mapper.toResponse(savedDeck, creatorName)
    }

    /**
     * Update a section in a deck.
     */
    @Transactional
    fun updateSection(
        deckId: String,
        sectionIndex: Int,
        request: UpdateSectionRequest,
        userId: String
    ): DeckResponse {
        val deck = findDeckById(deckId)

        if (deck.createdBy != userId) {
            throw ForbiddenException("You can only modify your own decks")
        }

        val section = deck.getSection(sectionIndex)
            ?: throw ResourceNotFoundException("Section not found at index $sectionIndex")

        val updatedSection = section.copy(
            title = request.title ?: section.title,
            description = request.description ?: section.description
        )

        val updatedSections = deck.sections.toMutableList()
        updatedSections[sectionIndex] = updatedSection

        val updatedDeck = deck.copy(sections = updatedSections)
        val savedDeck = deckRepository.save(updatedDeck)

        val creatorName = getCreatorName(userId)
        return mapper.toResponse(savedDeck, creatorName)
    }

    /**
     * Delete a section from a deck.
     */
    @Transactional
    fun deleteSection(deckId: String, sectionIndex: Int, userId: String): DeckResponse {
        val deck = findDeckById(deckId)

        if (deck.createdBy != userId) {
            throw ForbiddenException("You can only modify your own decks")
        }

        if (sectionIndex < 0 || sectionIndex >= deck.sections.size) {
            throw ResourceNotFoundException("Section not found at index $sectionIndex")
        }

        // Remove section and reindex remaining sections
        val updatedSections = deck.sections
            .filterIndexed { index, _ -> index != sectionIndex }
            .mapIndexed { index, section -> section.copy(index = index) }

        val updatedDeck = deck.copy(sections = updatedSections)
        val savedDeck = deckRepository.save(updatedDeck)

        val creatorName = getCreatorName(userId)
        return mapper.toResponse(savedDeck, creatorName)
    }

    // ================================
    // Vocabulary Item Management
    // ================================

    /**
     * Add vocabulary items to a section.
     */
    @Transactional
    fun addVocabularyItems(
        deckId: String,
        sectionIndex: Int,
        items: List<CreateVocabularyItemRequest>,
        userId: String
    ): DeckResponse {
        val deck = findDeckById(deckId)

        if (deck.createdBy != userId) {
            throw ForbiddenException("You can only modify your own decks")
        }

        val section = deck.getSection(sectionIndex)
            ?: throw ResourceNotFoundException("Section not found at index $sectionIndex")

        val startIndex = section.items.size
        val newItems = items.mapIndexed { index, request ->
            mapper.toItemEntity(request, startIndex + index)
        }

        val updatedSection = section.copy(items = section.items + newItems)
        val updatedSections = deck.sections.toMutableList()
        updatedSections[sectionIndex] = updatedSection

        val updatedDeck = deck.copy(sections = updatedSections)
        val savedDeck = deckRepository.save(updatedDeck)

        val creatorName = getCreatorName(userId)
        return mapper.toResponse(savedDeck, creatorName)
    }

    /**
     * Update a vocabulary item.
     */
    @Transactional
    fun updateVocabularyItem(
        deckId: String,
        sectionIndex: Int,
        itemIndex: Int,
        request: UpdateVocabularyItemRequest,
        userId: String
    ): DeckResponse {
        val deck = findDeckById(deckId)

        if (deck.createdBy != userId) {
            throw ForbiddenException("You can only modify your own decks")
        }

        val section = deck.getSection(sectionIndex)
            ?: throw ResourceNotFoundException("Section not found at index $sectionIndex")

        val item = section.items.getOrNull(itemIndex)
            ?: throw ResourceNotFoundException("Item not found at index $itemIndex")

        val updatedItem = item.copy(
            japaneseWord = request.japaneseWord ?: item.japaneseWord,
            reading = request.reading ?: item.reading,
            meaning = request.meaning ?: item.meaning,
            partOfSpeech = request.partOfSpeech ?: item.partOfSpeech,
            exampleSentence = request.exampleSentence ?: item.exampleSentence,
            exampleMeaning = request.exampleMeaning ?: item.exampleMeaning,
            imageUrl = request.imageUrl ?: item.imageUrl,
            audioUrl = request.audioUrl ?: item.audioUrl,
            notes = request.notes ?: item.notes
        )

        val updatedItems = section.items.toMutableList()
        updatedItems[itemIndex] = updatedItem

        val updatedSection = section.copy(items = updatedItems)
        val updatedSections = deck.sections.toMutableList()
        updatedSections[sectionIndex] = updatedSection

        val updatedDeck = deck.copy(sections = updatedSections)
        val savedDeck = deckRepository.save(updatedDeck)

        val creatorName = getCreatorName(userId)
        return mapper.toResponse(savedDeck, creatorName)
    }

    /**
     * Delete a vocabulary item.
     */
    @Transactional
    fun deleteVocabularyItem(
        deckId: String,
        sectionIndex: Int,
        itemIndex: Int,
        userId: String
    ): DeckResponse {
        val deck = findDeckById(deckId)

        if (deck.createdBy != userId) {
            throw ForbiddenException("You can only modify your own decks")
        }

        val section = deck.getSection(sectionIndex)
            ?: throw ResourceNotFoundException("Section not found at index $sectionIndex")

        if (itemIndex < 0 || itemIndex >= section.items.size) {
            throw ResourceNotFoundException("Item not found at index $itemIndex")
        }

        // Remove item and reindex
        val updatedItems = section.items
            .filterIndexed { index, _ -> index != itemIndex }
            .mapIndexed { index, item -> item.copy(index = index) }

        val updatedSection = section.copy(items = updatedItems)
        val updatedSections = deck.sections.toMutableList()
        updatedSections[sectionIndex] = updatedSection

        val updatedDeck = deck.copy(sections = updatedSections)
        val savedDeck = deckRepository.save(updatedDeck)

        val creatorName = getCreatorName(userId)
        return mapper.toResponse(savedDeck, creatorName)
    }

    // ================================
    // Query Operations
    // ================================

    /**
     * Get public decks with filtering.
     */
    fun getPublicDecks(
        level: JLPTLevel?,
        topic: DeckTopic?,
        pageable: Pageable
    ): Page<DeckSummaryResponse> {
        val decks = when {
            level != null && topic != null -> deckRepository.findByIsPublicAndStatusAndLevelAndTopic(
                true, DeckStatus.ACTIVE, level, topic, pageable
            )
            level != null -> deckRepository.findByIsPublicAndStatusAndLevel(
                true, DeckStatus.ACTIVE, level, pageable
            )
            topic != null -> deckRepository.findByIsPublicAndStatusAndTopic(
                true, DeckStatus.ACTIVE, topic, pageable
            )
            else -> deckRepository.findByIsPublicAndStatus(true, DeckStatus.ACTIVE, pageable)
        }

        return decks.map { deck ->
            val creatorName = getCreatorName(deck.createdBy)
            mapper.toSummaryResponse(deck, creatorName)
        }
    }

    /**
     * Get user's own decks.
     */
    fun getUserDecks(userId: String, pageable: Pageable): Page<DeckSummaryResponse> {
        val decks = deckRepository.findByCreatedByAndStatus(userId, DeckStatus.ACTIVE, pageable)
        return decks.map { deck ->
            val creatorName = getCreatorName(deck.createdBy)
            mapper.toSummaryResponse(deck, creatorName)
        }
    }

    /**
     * Get official decks.
     */
    fun getOfficialDecks(pageable: Pageable): Page<DeckSummaryResponse> {
        val decks = deckRepository.findByIsOfficialAndStatus(true, DeckStatus.ACTIVE, pageable)
        return decks.map { deck ->
            val creatorName = getCreatorName(deck.createdBy)
            mapper.toSummaryResponse(deck, creatorName)
        }
    }

    /**
     * Search decks by text.
     */
    fun searchDecks(query: String, pageable: Pageable): Page<DeckSummaryResponse> {
        val decks = deckRepository.searchPublicDecks(query, DeckStatus.ACTIVE, pageable)
        return decks.map { deck ->
            val creatorName = getCreatorName(deck.createdBy)
            mapper.toSummaryResponse(deck, creatorName)
        }
    }

    /**
     * Get popular decks.
     */
    fun getPopularDecks(pageable: Pageable): Page<DeckSummaryResponse> {
        val sortedPageable = PageRequest.of(
            pageable.pageNumber,
            pageable.pageSize,
            Sort.by(Sort.Direction.DESC, "stats.studyCount")
        )
        val decks = deckRepository.findPopularDecks(DeckStatus.ACTIVE, sortedPageable)
        return decks.map { deck ->
            val creatorName = getCreatorName(deck.createdBy)
            mapper.toSummaryResponse(deck, creatorName)
        }
    }

    /**
     * Get decks accessible by user (public + owned).
     */
    fun getAccessibleDecks(userId: String, pageable: Pageable): Page<DeckSummaryResponse> {
        val decks = deckRepository.findAccessibleByUser(userId, DeckStatus.ACTIVE, pageable)
        return decks.map { deck ->
            val creatorName = getCreatorName(deck.createdBy)
            mapper.toSummaryResponse(deck, creatorName)
        }
    }

    /**
     * Get a specific vocabulary item from a deck.
     */
    fun getVocabularyItem(
        deckId: String,
        sectionIndex: Int,
        itemIndex: Int,
        userId: String?
    ): VocabularyItemResponse {
        val deck = findDeckById(deckId)

        if (!deck.isPublic && deck.createdBy != userId) {
            throw ForbiddenException("You don't have access to this deck")
        }

        val item = deck.getVocabularyItem(sectionIndex, itemIndex)
            ?: throw ResourceNotFoundException("Vocabulary item not found")

        return mapper.toItemResponse(item)
    }

    /**
     * Get a section from a deck.
     */
    fun getSection(
        deckId: String,
        sectionIndex: Int,
        userId: String?
    ): SectionResponse {
        val deck = findDeckById(deckId)

        if (!deck.isPublic && deck.createdBy != userId) {
            throw ForbiddenException("You don't have access to this deck")
        }

        val section = deck.getSection(sectionIndex)
            ?: throw ResourceNotFoundException("Section not found at index $sectionIndex")

        return mapper.toSectionResponse(section)
    }

    // ================================
    // Statistics
    // ================================

    /**
     * Get deck count by user.
     */
    fun getUserDeckCount(userId: String): Long {
        return deckRepository.countByCreatedByAndStatus(userId, DeckStatus.ACTIVE)
    }

    /**
     * Get public deck count by level.
     */
    fun getPublicDeckCountByLevel(level: JLPTLevel): Long {
        return deckRepository.countByIsPublicAndStatusAndLevel(true, DeckStatus.ACTIVE, level)
    }

    /**
     * Get public deck count by topic.
     */
    fun getPublicDeckCountByTopic(topic: DeckTopic): Long {
        return deckRepository.countByIsPublicAndStatusAndTopic(true, DeckStatus.ACTIVE, topic)
    }

    // ================================
    // Helper Methods
    // ================================

    /**
     * Find deck by ID or throw exception.
     */
    internal fun findDeckById(deckId: String): VocabularyDeck {
        return deckRepository.findById(deckId)
            .orElseThrow { ResourceNotFoundException("Deck not found with ID: $deckId") }
    }

    /**
     * Get creator's display name.
     */
    private fun getCreatorName(userId: String): String? {
        return userRepository.findById(userId)
            .map { it.displayName ?: it.username }
            .orElse(null)
    }

    /**
     * Increment deck view count.
     */
    private fun incrementViewCount(deck: VocabularyDeck) {
        val updatedStats = deck.stats.copy(viewCount = deck.stats.viewCount + 1)
        val updatedDeck = deck.copy(stats = updatedStats)
        deckRepository.save(updatedDeck)
    }

    /**
     * Increment deck study count.
     */
    internal fun incrementStudyCount(deckId: String) {
        val deck = findDeckById(deckId)
        val updatedStats = deck.stats.copy(studyCount = deck.stats.studyCount + 1)
        val updatedDeck = deck.copy(stats = updatedStats)
        deckRepository.save(updatedDeck)
    }
}
