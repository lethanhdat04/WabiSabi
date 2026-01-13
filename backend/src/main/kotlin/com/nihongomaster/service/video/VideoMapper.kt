package com.nihongomaster.service.video

import com.nihongomaster.domain.video.SubtitleSegment
import com.nihongomaster.domain.video.Video
import com.nihongomaster.domain.video.VideoStats
import com.nihongomaster.domain.video.VocabularyReference
import com.nihongomaster.dto.video.*
import org.springframework.stereotype.Component

/**
 * Mapper for converting Video entities to DTOs.
 */
@Component
class VideoMapper {

    /**
     * Convert Video entity to full VideoResponse DTO.
     */
    fun toResponse(video: Video): VideoResponse {
        return VideoResponse(
            id = video.id!!,
            title = video.title,
            titleJapanese = video.titleJapanese,
            description = video.description,
            youtubeId = video.youtubeId,
            thumbnailUrl = video.thumbnailUrl,
            duration = video.duration,
            category = video.category.name,
            level = video.level.name,
            tags = video.tags,
            subtitles = video.subtitles.map { toSegmentResponse(it) },
            segmentCount = video.getSegmentCount(),
            uploadedBy = video.uploadedBy,
            isOfficial = video.isOfficial,
            status = video.status.name,
            stats = toStatsResponse(video.stats),
            createdAt = video.createdAt,
            updatedAt = video.updatedAt
        )
    }

    /**
     * Convert Video entity to summary DTO.
     */
    fun toSummaryResponse(video: Video): VideoSummaryResponse {
        return VideoSummaryResponse(
            id = video.id!!,
            title = video.title,
            titleJapanese = video.titleJapanese,
            youtubeId = video.youtubeId,
            thumbnailUrl = video.thumbnailUrl,
            duration = video.duration,
            category = video.category.name,
            level = video.level.name,
            segmentCount = video.getSegmentCount(),
            isOfficial = video.isOfficial,
            stats = toStatsResponse(video.stats)
        )
    }

    /**
     * Convert SubtitleSegment to response DTO.
     */
    fun toSegmentResponse(segment: SubtitleSegment): SubtitleSegmentResponse {
        return SubtitleSegmentResponse(
            index = segment.index,
            japaneseText = segment.japaneseText,
            romaji = segment.romaji,
            meaning = segment.meaning,
            startTime = segment.startTime,
            endTime = segment.endTime,
            duration = segment.getDuration(),
            vocabulary = segment.vocabulary.map { toVocabularyResponse(it) }
        )
    }

    /**
     * Convert VocabularyReference to response DTO.
     */
    fun toVocabularyResponse(vocab: VocabularyReference): VocabularyReferenceResponse {
        return VocabularyReferenceResponse(
            word = vocab.word ?: "",           // Nếu null thì lấy ""
            reading = vocab.reading ?: "",     // Nếu null thì lấy ""
            meaning = vocab.meaning ?: "",     // Nếu null thì lấy ""
            partOfSpeech = vocab.partOfSpeech
        )
    }

    /**
     * Convert VideoStats to response DTO.
     */
    fun toStatsResponse(stats: VideoStats): VideoStatsResponse {
        return VideoStatsResponse(
            viewCount = stats.viewCount,
            practiceCount = stats.practiceCount,
            shadowingCount = stats.shadowingCount,
            dictationCount = stats.dictationCount,
            averageScore = stats.averageScore,
            totalRatings = stats.totalRatings,
            averageRating = stats.averageRating
        )
    }

    /**
     * Convert CreateVideoRequest to Video entity.
     */
    fun toEntity(request: CreateVideoRequest, uploadedBy: String): Video {
        return Video(
            title = request.title.trim(),
            titleJapanese = request.titleJapanese?.trim(),
            description = request.description?.trim(),
            youtubeId = request.youtubeId.trim(),
            thumbnailUrl = request.thumbnailUrl.trim(),
            duration = request.duration,
            category = request.category,
            level = request.level,
            tags = request.tags.map { it.trim().lowercase() },
            subtitles = request.subtitles.map { toSegmentEntity(it) },
            uploadedBy = uploadedBy,
            isOfficial = request.isOfficial
        )
    }

    /**
     * Convert SubtitleSegmentRequest to SubtitleSegment entity.
     */
    fun toSegmentEntity(request: SubtitleSegmentRequest): SubtitleSegment {
        return SubtitleSegment(
            index = request.index,
            japaneseText = request.japaneseText.trim(),
            romaji = request.romaji?.trim(),
            meaning = request.meaning.trim(),
            startTime = request.startTime,
            endTime = request.endTime,
            vocabulary = request.vocabulary.map { toVocabularyEntity(it) }
        )
    }

    /**
     * Convert VocabularyReferenceRequest to VocabularyReference entity.
     */
    fun toVocabularyEntity(request: VocabularyReferenceRequest): VocabularyReference {
        return VocabularyReference(
            word = request.word.trim(),
            reading = request.reading.trim(),
            meaning = request.meaning.trim(),
            partOfSpeech = request.partOfSpeech?.trim()
        )
    }
}
