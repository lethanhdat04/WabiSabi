package com.nihongomaster.controller

import com.nihongomaster.dto.*
import com.nihongomaster.security.CurrentUser
import com.nihongomaster.security.UserPrincipal
import com.nihongomaster.service.vocabulary.VocabularyPracticeService
import com.nihongomaster.service.vocabulary.VocabularyProgressService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

/**
 * REST controller for vocabulary practice modes.
 */
@RestController
@RequestMapping("/api/vocabulary/practice")
@Tag(name = "Vocabulary Practice", description = "Fill-in-the-Blank and Flashcard practice API")
@PreAuthorize("isAuthenticated()")
class VocabularyPracticeController(
    private val practiceService: VocabularyPracticeService,
    private val progressService: VocabularyProgressService
) {

    // ================================
    // Fill-in-the-Blank Mode
    // ================================

    @PostMapping("/fill-in/questions")
    @Operation(summary = "Generate fill-in-the-blank questions for practice")
    fun generateFillInQuestions(
        @Valid @RequestBody request: StartFillInPracticeRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<List<FillInQuestionResponse>> {
        val questions = practiceService.generateFillInQuestions(request, user.id)
        return ResponseEntity.ok(questions)
    }

    @PostMapping("/fill-in/answer")
    @Operation(summary = "Submit answer for a fill-in-the-blank question")
    fun submitFillInAnswer(
        @Valid @RequestBody request: FillInAnswerRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<FillInAnswerResponse> {
        val result = practiceService.submitFillInAnswer(request, user.id)
        return ResponseEntity.ok(result)
    }

    // ================================
    // Flashcard Mode
    // ================================

    @PostMapping("/flashcard/cards")
    @Operation(summary = "Generate flashcards for practice")
    fun generateFlashcards(
        @Valid @RequestBody request: StartFlashcardPracticeRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<List<FlashcardResponse>> {
        val flashcards = practiceService.generateFlashcards(request, user.id)
        return ResponseEntity.ok(flashcards)
    }

    @PostMapping("/flashcard/result")
    @Operation(summary = "Submit self-assessment result for a flashcard")
    fun submitFlashcardResult(
        @Valid @RequestBody request: FlashcardResultRequest,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<FlashcardResultResponse> {
        val result = practiceService.submitFlashcardResult(request, user.id)
        return ResponseEntity.ok(result)
    }

    // ================================
    // Review Mode (SRS-based)
    // ================================

    @GetMapping("/review/decks/{deckId}")
    @Operation(summary = "Get items needing review for a specific deck")
    fun getDeckReviewItems(
        @PathVariable deckId: String,
        @RequestParam(defaultValue = "20") limit: Int,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<List<FlashcardResponse>> {
        val items = practiceService.getItemsForReview(deckId, user.id, limit)
        return ResponseEntity.ok(items)
    }

    @GetMapping("/review/decks/{deckId}/count")
    @Operation(summary = "Get count of items needing review for a deck")
    fun getDeckReviewCount(
        @PathVariable deckId: String,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<Map<String, Int>> {
        val count = practiceService.getReviewCount(deckId, user.id)
        return ResponseEntity.ok(mapOf("count" to count))
    }

    @GetMapping("/review/all")
    @Operation(summary = "Get all items needing review across all decks")
    fun getAllReviewItems(
        @RequestParam(defaultValue = "50") limit: Int,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<List<ReviewItemResponse>> {
        val items = progressService.getAllItemsNeedingReview(user.id, limit)
        return ResponseEntity.ok(items)
    }

    // ================================
    // Progress & Statistics
    // ================================

    @GetMapping("/progress")
    @Operation(summary = "Get user's progress across all decks")
    fun getUserProgress(
        @CurrentUser user: UserPrincipal,
        @PageableDefault(size = 10, sort = ["lastStudiedAt"], direction = Sort.Direction.DESC)
        pageable: Pageable
    ): ResponseEntity<Page<DeckProgressResponse>> {
        val progress = progressService.getUserProgress(user.id, pageable)
        return ResponseEntity.ok(progress)
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recently studied decks")
    fun getRecentlyStudiedDecks(
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<List<RecentDeckResponse>> {
        val decks = progressService.getRecentlyStudiedDecks(user.id)
        return ResponseEntity.ok(decks)
    }

    @GetMapping("/stats")
    @Operation(summary = "Get user's vocabulary learning statistics")
    fun getUserVocabularyStats(
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<UserVocabularyStatsResponse> {
        val stats = progressService.getUserVocabularyStats(user.id)
        return ResponseEntity.ok(stats)
    }

    @GetMapping("/decks/{deckId}/review-items")
    @Operation(summary = "Get detailed review items for a deck")
    fun getDeckItemsNeedingReview(
        @PathVariable deckId: String,
        @RequestParam(defaultValue = "20") limit: Int,
        @CurrentUser user: UserPrincipal
    ): ResponseEntity<List<ReviewItemResponse>> {
        val items = progressService.getDeckItemsNeedingReview(deckId, user.id, limit)
        return ResponseEntity.ok(items)
    }
}
