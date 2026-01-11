package com.nihongomaster.controller

import com.nihongomaster.domain.video.JLPTLevel
import com.nihongomaster.domain.vocabulary.DeckTopic
import com.nihongomaster.dto.*
import com.nihongomaster.security.CurrentUser
import com.nihongomaster.security.UserPrincipal
import com.nihongomaster.service.vocabulary.DeckService
import com.nihongomaster.service.vocabulary.DeckStudyStatsResponse
import com.nihongomaster.service.vocabulary.VocabularyProgressService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

/**
 * REST controller for vocabulary deck operations.
 */
@RestController
@RequestMapping("/api/vocabulary/decks")
@Tag(name = "Vocabulary Decks", description = "Vocabulary deck management API")
class DeckController(
    private val deckService: DeckService,
    private val progressService: VocabularyProgressService
) {

    // ================================
    // Deck CRUD Operations
    // ================================

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a new vocabulary deck")
    fun createDeck(
        @Valid @RequestBody request: CreateDeckRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckResponse> {
        val deck = deckService.createDeck(request, user.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(deck)
    }

    @GetMapping("/{deckId}")
    @Operation(summary = "Get deck by ID with full content")
    fun getDeck(
        @PathVariable deckId: String,
        @CurrentUser user: UserPrincipal?
    ): ResponseEntity<DeckResponse> {
        val deck = deckService.getDeck(deckId, user?.id)
        return ResponseEntity.ok(deck)
    }

    @GetMapping("/{deckId}/summary")
    @Operation(summary = "Get deck summary without full content")
    fun getDeckSummary(
        @PathVariable deckId: String,
        @CurrentUser user: UserPrincipal?
    ): ResponseEntity<DeckSummaryResponse> {
        val summary = deckService.getDeckSummary(deckId, user?.id)
        return ResponseEntity.ok(summary)
    }

    @PutMapping("/{deckId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update a vocabulary deck")
    fun updateDeck(
        @PathVariable deckId: String,
        @Valid @RequestBody request: UpdateDeckRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckResponse> {
        val deck = deckService.updateDeck(deckId, request, user.id)
        return ResponseEntity.ok(deck)
    }

    @DeleteMapping("/{deckId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete a vocabulary deck (soft delete)")
    fun deleteDeck(
        @PathVariable deckId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<Void> {
        deckService.deleteDeck(deckId, user.id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{deckId}/archive")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Archive a vocabulary deck")
    fun archiveDeck(
        @PathVariable deckId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckResponse> {
        val deck = deckService.archiveDeck(deckId, user.id)
        return ResponseEntity.ok(deck)
    }

    // ================================
    // Section Management
    // ================================

    @PostMapping("/{deckId}/sections")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add a section to a deck")
    fun addSection(
        @PathVariable deckId: String,
        @Valid @RequestBody request: AddSectionRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckResponse> {
        val deck = deckService.addSection(deckId, request, user.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(deck)
    }

    @GetMapping("/{deckId}/sections/{sectionIndex}")
    @Operation(summary = "Get a specific section from a deck")
    fun getSection(
        @PathVariable deckId: String,
        @PathVariable sectionIndex: Int,
        @CurrentUser user: UserPrincipal?
    ): ResponseEntity<SectionResponse> {
        val section = deckService.getSection(deckId, sectionIndex, user?.id)
        return ResponseEntity.ok(section)
    }

    @PutMapping("/{deckId}/sections/{sectionIndex}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update a section in a deck")
    fun updateSection(
        @PathVariable deckId: String,
        @PathVariable sectionIndex: Int,
        @Valid @RequestBody request: UpdateSectionRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckResponse> {
        val deck = deckService.updateSection(deckId, sectionIndex, request, user.id)
        return ResponseEntity.ok(deck)
    }

    @DeleteMapping("/{deckId}/sections/{sectionIndex}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete a section from a deck")
    fun deleteSection(
        @PathVariable deckId: String,
        @PathVariable sectionIndex: Int,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckResponse> {
        val deck = deckService.deleteSection(deckId, sectionIndex, user.id)
        return ResponseEntity.ok(deck)
    }

    // ================================
    // Vocabulary Item Management
    // ================================

    @PostMapping("/{deckId}/sections/{sectionIndex}/items")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add vocabulary items to a section")
    fun addVocabularyItems(
        @PathVariable deckId: String,
        @PathVariable sectionIndex: Int,
        @Valid @RequestBody items: List<CreateVocabularyItemRequest>,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckResponse> {
        val deck = deckService.addVocabularyItems(deckId, sectionIndex, items, user.id)
        return ResponseEntity.status(HttpStatus.CREATED).body(deck)
    }

    @GetMapping("/{deckId}/sections/{sectionIndex}/items/{itemIndex}")
    @Operation(summary = "Get a specific vocabulary item")
    fun getVocabularyItem(
        @PathVariable deckId: String,
        @PathVariable sectionIndex: Int,
        @PathVariable itemIndex: Int,
        @CurrentUser user: UserPrincipal?
    ): ResponseEntity<VocabularyItemResponse> {
        val item = deckService.getVocabularyItem(deckId, sectionIndex, itemIndex, user?.id)
        return ResponseEntity.ok(item)
    }

    @PutMapping("/{deckId}/sections/{sectionIndex}/items/{itemIndex}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update a vocabulary item")
    fun updateVocabularyItem(
        @PathVariable deckId: String,
        @PathVariable sectionIndex: Int,
        @PathVariable itemIndex: Int,
        @Valid @RequestBody request: UpdateVocabularyItemRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckResponse> {
        val deck = deckService.updateVocabularyItem(deckId, sectionIndex, itemIndex, request, user.id)
        return ResponseEntity.ok(deck)
    }

    @DeleteMapping("/{deckId}/sections/{sectionIndex}/items/{itemIndex}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete a vocabulary item")
    fun deleteVocabularyItem(
        @PathVariable deckId: String,
        @PathVariable sectionIndex: Int,
        @PathVariable itemIndex: Int,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckResponse> {
        val deck = deckService.deleteVocabularyItem(deckId, sectionIndex, itemIndex, user.id)
        return ResponseEntity.ok(deck)
    }

    // ================================
    // Deck Discovery
    // ================================

    @GetMapping
    @Operation(summary = "Get public decks with optional filtering")
    fun getPublicDecks(
        @RequestParam(required = false) level: JLPTLevel?,
        @RequestParam(required = false) topic: DeckTopic?,
        @PageableDefault(size = 12, sort = ["createdAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<DeckSummaryResponse>> {
        val decks = deckService.getPublicDecks(level, topic, pageable)
        return ResponseEntity.ok(decks)
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user's decks")
    fun getMyDecks(
        @CurrentUser user: UserPrincipal,
        @PageableDefault(size = 12, sort = ["updatedAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<DeckSummaryResponse>> {
        val decks = deckService.getUserDecks(user.id, pageable)
        return ResponseEntity.ok(decks)
    }

    @GetMapping("/official")
    @Operation(summary = "Get official decks")
    fun getOfficialDecks(
        @PageableDefault(size = 12, sort = ["level"], direction = Sort.Direction.ASC)
        pageable: Pageable
    ): ResponseEntity<Page<DeckSummaryResponse>> {
        val decks = deckService.getOfficialDecks(pageable)
        return ResponseEntity.ok(decks)
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular decks")
    fun getPopularDecks(
        @PageableDefault(size = 12)
        pageable: Pageable
    ): ResponseEntity<Page<DeckSummaryResponse>> {
        val decks = deckService.getPopularDecks(pageable)
        return ResponseEntity.ok(decks)
    }

    @GetMapping("/search")
    @Operation(summary = "Search decks by text")
    fun searchDecks(
        @RequestParam q: String,
        @PageableDefault(size = 12)
        pageable: Pageable
    ): ResponseEntity<Page<DeckSummaryResponse>> {
        val decks = deckService.searchDecks(q, pageable)
        return ResponseEntity.ok(decks)
    }

    @GetMapping("/accessible")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get decks accessible by current user (public + owned)")
    fun getAccessibleDecks(
        @CurrentUser user: UserPrincipal,
        @PageableDefault(size = 12, sort = ["updatedAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<DeckSummaryResponse>> {
        val decks = deckService.getAccessibleDecks(user.id, pageable)
        return ResponseEntity.ok(decks)
    }

    // ================================
    // Progress & Statistics
    // ================================

    @GetMapping("/{deckId}/progress")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get user's progress for a deck")
    fun getDeckProgress(
        @PathVariable deckId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckProgressResponse> {
        val progress = progressService.getDeckProgress(deckId, user.id)
        return ResponseEntity.ok(progress)
    }

    @DeleteMapping("/{deckId}/progress")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Reset progress for a deck")
    fun resetDeckProgress(
        @PathVariable deckId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<Void> {
        progressService.resetDeckProgress(deckId, user.id)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{deckId}/sections/{sectionIndex}/progress")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Reset progress for a section")
    fun resetSectionProgress(
        @PathVariable deckId: String,
        @PathVariable sectionIndex: Int,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<DeckProgressResponse> {
        val progress = progressService.resetSectionProgress(deckId, sectionIndex, user.id)
        return ResponseEntity.ok(progress)
    }

    @GetMapping("/{deckId}/stats")
    @Operation(summary = "Get deck study statistics")
    fun getDeckStats(
        @PathVariable deckId: String
    ): ResponseEntity<DeckStudyStatsResponse> {
        val stats = progressService.getDeckStudyStats(deckId)
        return ResponseEntity.ok(stats)
    }

    @GetMapping("/{deckId}/sections/{sectionIndex}/items/{itemIndex}/progress")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get progress for a specific vocabulary item")
    fun getItemProgress(
        @PathVariable deckId: String,
        @PathVariable sectionIndex: Int,
        @PathVariable itemIndex: Int,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<ItemProgressResponse> {
        val progress = progressService.getItemProgress(deckId, sectionIndex, itemIndex, user.id)
        return if (progress != null) {
            ResponseEntity.ok(progress)
        } else {
            ResponseEntity.notFound().build()
        }
    }
}
