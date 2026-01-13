package com.nihongomaster.config

import com.nihongomaster.domain.forum.ForumTopic
import com.nihongomaster.domain.forum.Post
import com.nihongomaster.domain.forum.PostStatus
import com.nihongomaster.domain.user.JLPTLevel
import com.nihongomaster.domain.user.User
import com.nihongomaster.domain.user.UserRole
import com.nihongomaster.domain.video.*
import com.nihongomaster.domain.vocabulary.*
import com.nihongomaster.repository.PostRepository
import com.nihongomaster.repository.UserRepository
import com.nihongomaster.repository.VideoRepository
import com.nihongomaster.repository.VocabularyDeckRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.crypto.password.PasswordEncoder

@Configuration
@Profile("!test")
class DataSeeder(
    private val passwordEncoder: PasswordEncoder
) {
    private val logger = LoggerFactory.getLogger(DataSeeder::class.java)

    @Bean
    fun seedData(
        userRepository: UserRepository,
        videoRepository: VideoRepository,
        deckRepository: VocabularyDeckRepository,
        postRepository: PostRepository
    ): CommandLineRunner = CommandLineRunner {

        // Only seed if database is empty
        if (userRepository.count() > 0) {
            logger.info("Database already has data, skipping seed")
            return@CommandLineRunner
        }

        logger.info("Seeding database with initial data...")

        // Create users
        val users = seedUsers(userRepository)
        val adminUser = users.first { it.role == UserRole.ADMIN }
        val regularUser = users.first { it.role == UserRole.USER }

        // Create videos
        // seedVideos(videoRepository, adminUser.id!!)

        // Create vocabulary decks
        seedVocabularyDecks(deckRepository, adminUser.id!!, regularUser.id!!)

        // Create forum posts
        seedForumPosts(postRepository, users)

        logger.info("Database seeding completed successfully!")
    }

    private fun seedUsers(userRepository: UserRepository): List<User> {
        val users = listOf(
            User(
                email = "admin@nihongomaster.com",
                username = "admin",
                passwordHash = passwordEncoder.encode("admin123"),
                displayName = "Admin",
                role = UserRole.ADMIN,
                avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
                bio = "Platform administrator",
                emailVerified = true,
                targetLevel = JLPTLevel.N1
            ),
            User(
                email = "tanaka@example.com",
                username = "tanaka_sensei",
                passwordHash = passwordEncoder.encode("password123"),
                displayName = "Tanaka Sensei",
                role = UserRole.PREMIUM,
                avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=tanaka",
                bio = "Japanese teacher with 10 years experience",
                emailVerified = true,
                targetLevel = JLPTLevel.N1
            ),
            User(
                email = "sakura@example.com",
                username = "sakura_learner",
                passwordHash = passwordEncoder.encode("password123"),
                displayName = "Sakura",
                role = UserRole.USER,
                avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=sakura",
                bio = "Learning Japanese to watch anime without subtitles!",
                emailVerified = true,
                targetLevel = JLPTLevel.N3
            ),
            User(
                email = "ken@example.com",
                username = "ken_student",
                passwordHash = passwordEncoder.encode("password123"),
                displayName = "Ken",
                role = UserRole.USER,
                avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=ken",
                bio = "Preparing for JLPT N2",
                emailVerified = true,
                targetLevel = JLPTLevel.N2
            ),
            User(
                email = "yuki@example.com",
                username = "yuki_chan",
                passwordHash = passwordEncoder.encode("password123"),
                displayName = "Yuki",
                role = UserRole.USER,
                avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=yuki",
                bio = "Just started learning Japanese",
                emailVerified = true,
                targetLevel = JLPTLevel.N5
            )
        )

        return userRepository.saveAll(users)
    }

    private fun seedVideos(videoRepository: VideoRepository, adminId: String) {
        val videos = listOf(
            Video(
                title = "Daily Greetings in Japanese",
                titleJapanese = "日本語の挨拶",
                description = "Learn essential Japanese greetings used in daily life",
                youtubeId = "dQw4w9WgXcQ",
                thumbnailUrl = "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
                duration = 180,
                category = VideoCategory.DAILY_LIFE,
                level = com.nihongomaster.domain.video.JLPTLevel.N5,
                tags = listOf("greetings", "beginner", "daily-life"),
                uploadedBy = adminId,
                isOfficial = true,
                status = VideoStatus.PUBLISHED,
                subtitles = listOf(
                    SubtitleSegment(0, "おはようございます", "Ohayou gozaimasu", "Good morning (polite)", 0.0, 3.0, listOf(
                        VocabularyReference("おはよう", "おはよう", "Good morning (casual)", "Expression")
                    )),
                    SubtitleSegment(1, "こんにちは", "Konnichiwa", "Hello / Good afternoon", 3.5, 6.0, listOf(
                        VocabularyReference("こんにちは", "こんにちは", "Hello / Good afternoon", "Expression")
                    )),
                    SubtitleSegment(2, "こんばんは", "Konbanwa", "Good evening", 6.5, 9.0, listOf(
                        VocabularyReference("こんばんは", "こんばんは", "Good evening", "Expression")
                    )),
                    SubtitleSegment(3, "さようなら", "Sayounara", "Goodbye", 9.5, 12.0, listOf(
                        VocabularyReference("さようなら", "さようなら", "Goodbye (formal)", "Expression")
                    )),
                    SubtitleSegment(4, "ありがとうございます", "Arigatou gozaimasu", "Thank you (polite)", 12.5, 16.0, listOf(
                        VocabularyReference("ありがとう", "ありがとう", "Thank you (casual)", "Expression")
                    )),
                    SubtitleSegment(5, "すみません", "Sumimasen", "Excuse me / I'm sorry", 16.5, 19.0, listOf(
                        VocabularyReference("すみません", "すみません", "Excuse me / Sorry", "Expression")
                    ))
                )
            ),
            Video(
                title = "Ordering Food at a Restaurant",
                titleJapanese = "レストランで注文する",
                description = "Practice Japanese phrases for ordering at restaurants",
                youtubeId = "jNQXAC9IVRw",
                thumbnailUrl = "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
                duration = 240,
                category = VideoCategory.DAILY_LIFE,
                level = com.nihongomaster.domain.video.JLPTLevel.N4,
                tags = listOf("restaurant", "food", "ordering"),
                uploadedBy = adminId,
                isOfficial = true,
                status = VideoStatus.PUBLISHED,
                subtitles = listOf(
                    SubtitleSegment(0, "いらっしゃいませ", "Irasshaimase", "Welcome (to our store)", 0.0, 3.0, listOf(
                        VocabularyReference("いらっしゃる", "いらっしゃる", "To come (honorific)", "Verb")
                    )),
                    SubtitleSegment(1, "メニューをお願いします", "Menyuu o onegai shimasu", "Menu please", 3.5, 7.0, listOf(
                        VocabularyReference("メニュー", "めにゅー", "Menu", "Noun"),
                        VocabularyReference("お願い", "おねがい", "Request / Please", "Noun")
                    )),
                    SubtitleSegment(2, "これをください", "Kore o kudasai", "I'll have this, please", 7.5, 10.0, listOf(
                        VocabularyReference("これ", "これ", "This", "Pronoun"),
                        VocabularyReference("ください", "ください", "Please give me", "Expression")
                    )),
                    SubtitleSegment(3, "お会計をお願いします", "Okaikei o onegai shimasu", "Check please", 10.5, 14.0, listOf(
                        VocabularyReference("会計", "かいけい", "Bill / Check", "Noun")
                    )),
                    SubtitleSegment(4, "ごちそうさまでした", "Gochisousama deshita", "Thank you for the meal", 14.5, 18.0, listOf(
                        VocabularyReference("ごちそうさま", "ごちそうさま", "Thank you for the meal", "Expression")
                    ))
                )
            ),
            Video(
                title = "Business Japanese - Meeting Phrases",
                titleJapanese = "ビジネス日本語 - 会議のフレーズ",
                description = "Essential phrases for business meetings in Japanese",
                youtubeId = "9bZkp7q19f0",
                thumbnailUrl = "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
                duration = 300,
                category = VideoCategory.BUSINESS,
                level = com.nihongomaster.domain.video.JLPTLevel.N3,
                tags = listOf("business", "meeting", "formal"),
                uploadedBy = adminId,
                isOfficial = true,
                status = VideoStatus.PUBLISHED,
                subtitles = listOf(
                    SubtitleSegment(0, "本日はお忙しい中、ありがとうございます", "Honjitsu wa oisogashii naka, arigatou gozaimasu", "Thank you for taking time out of your busy schedule today", 0.0, 5.0, listOf(
                        VocabularyReference("本日", "ほんじつ", "Today (formal)", "Noun"),
                        VocabularyReference("忙しい", "いそがしい", "Busy", "i-Adjective")
                    )),
                    SubtitleSegment(1, "それでは、会議を始めましょう", "Soredewa, kaigi o hajimemashou", "Now then, let's begin the meeting", 5.5, 9.0, listOf(
                        VocabularyReference("会議", "かいぎ", "Meeting", "Noun"),
                        VocabularyReference("始める", "はじめる", "To begin", "Verb")
                    )),
                    SubtitleSegment(2, "ご質問はありますか", "Go-shitsumon wa arimasu ka", "Do you have any questions?", 9.5, 12.0, listOf(
                        VocabularyReference("質問", "しつもん", "Question", "Noun")
                    )),
                    SubtitleSegment(3, "確認させてください", "Kakunin sasete kudasai", "Let me confirm", 12.5, 15.0, listOf(
                        VocabularyReference("確認", "かくにん", "Confirmation", "Noun")
                    ))
                )
            ),
            Video(
                title = "Anime Japanese - Common Expressions",
                titleJapanese = "アニメの日本語 - よく使う表現",
                description = "Learn Japanese expressions commonly heard in anime",
                youtubeId = "kJQP7kiw5Fk",
                thumbnailUrl = "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
                duration = 200,
                category = VideoCategory.ANIME,
                level = com.nihongomaster.domain.video.JLPTLevel.N4,
                tags = listOf("anime", "casual", "expressions"),
                uploadedBy = adminId,
                isOfficial = true,
                status = VideoStatus.PUBLISHED,
                subtitles = listOf(
                    SubtitleSegment(0, "すごい！", "Sugoi!", "Amazing!", 0.0, 2.0, listOf(
                        VocabularyReference("すごい", "すごい", "Amazing / Incredible", "i-Adjective")
                    )),
                    SubtitleSegment(1, "やばい！", "Yabai!", "Awesome! / Oh no!", 2.5, 4.5, listOf(
                        VocabularyReference("やばい", "やばい", "Awesome / Dangerous (slang)", "i-Adjective")
                    )),
                    SubtitleSegment(2, "まじで？", "Maji de?", "Seriously?", 5.0, 7.0, listOf(
                        VocabularyReference("まじ", "まじ", "Seriously / For real", "Expression")
                    )),
                    SubtitleSegment(3, "なるほど", "Naruhodo", "I see / That makes sense", 7.5, 9.5, listOf(
                        VocabularyReference("なるほど", "なるほど", "I see / That makes sense", "Expression")
                    )),
                    SubtitleSegment(4, "頑張って！", "Ganbatte!", "Good luck! / Do your best!", 10.0, 12.5, listOf(
                        VocabularyReference("頑張る", "がんばる", "To do one's best", "Verb")
                    ))
                )
            ),
            Video(
                title = "Japanese News - Easy Listening",
                titleJapanese = "やさしいニュース",
                description = "News in simplified Japanese for learners",
                youtubeId = "fJ9rUzIMcZQ",
                thumbnailUrl = "https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
                duration = 180,
                category = VideoCategory.NEWS,
                level = com.nihongomaster.domain.video.JLPTLevel.N3,
                tags = listOf("news", "listening", "intermediate"),
                uploadedBy = adminId,
                isOfficial = true,
                status = VideoStatus.PUBLISHED,
                subtitles = listOf(
                    SubtitleSegment(0, "今日のニュースです", "Kyou no nyuusu desu", "Here is today's news", 0.0, 3.0, listOf(
                        VocabularyReference("今日", "きょう", "Today", "Noun"),
                        VocabularyReference("ニュース", "にゅーす", "News", "Noun")
                    )),
                    SubtitleSegment(1, "東京では桜が満開です", "Tokyo dewa sakura ga mankai desu", "In Tokyo, the cherry blossoms are in full bloom", 3.5, 7.0, listOf(
                        VocabularyReference("東京", "とうきょう", "Tokyo", "Proper Noun"),
                        VocabularyReference("桜", "さくら", "Cherry blossom", "Noun"),
                        VocabularyReference("満開", "まんかい", "Full bloom", "Noun")
                    )),
                    SubtitleSegment(2, "多くの人が花見を楽しんでいます", "Ooku no hito ga hanami o tanoshinde imasu", "Many people are enjoying flower viewing", 7.5, 12.0, listOf(
                        VocabularyReference("花見", "はなみ", "Flower viewing", "Noun"),
                        VocabularyReference("楽しむ", "たのしむ", "To enjoy", "Verb")
                    ))
                )
            )
        )

        videoRepository.saveAll(videos)
        logger.info("Seeded ${videos.size} videos")
    }

    private fun seedVocabularyDecks(deckRepository: VocabularyDeckRepository, adminId: String, userId: String) {
        val decks = listOf(
            VocabularyDeck(
                title = "JLPT N5 Essential Vocabulary",
                description = "Master the most important vocabulary for JLPT N5",
                level = com.nihongomaster.domain.video.JLPTLevel.N5,
                topic = DeckTopic.JLPT_N5,
                tags = listOf("jlpt", "n5", "beginner", "essential"),
                isPublic = true,
                isOfficial = true,
                createdBy = adminId,
                sections = listOf(
                    VocabularySection(
                        index = 0,
                        title = "Numbers 1-10",
                        description = "Basic Japanese numbers",
                        items = listOf(
                            VocabularyItem(0, "一", "いち", "one", PartOfSpeech.NOUN, "一つください", "One please"),
                            VocabularyItem(1, "二", "に", "two", PartOfSpeech.NOUN, "二人です", "It's two people"),
                            VocabularyItem(2, "三", "さん", "three", PartOfSpeech.NOUN, "三時に会いましょう", "Let's meet at 3 o'clock"),
                            VocabularyItem(3, "四", "よん/し", "four", PartOfSpeech.NOUN, "四月です", "It's April"),
                            VocabularyItem(4, "五", "ご", "five", PartOfSpeech.NOUN, "五分待ってください", "Please wait 5 minutes"),
                            VocabularyItem(5, "六", "ろく", "six", PartOfSpeech.NOUN),
                            VocabularyItem(6, "七", "なな/しち", "seven", PartOfSpeech.NOUN),
                            VocabularyItem(7, "八", "はち", "eight", PartOfSpeech.NOUN),
                            VocabularyItem(8, "九", "きゅう/く", "nine", PartOfSpeech.NOUN),
                            VocabularyItem(9, "十", "じゅう", "ten", PartOfSpeech.NOUN)
                        )
                    ),
                    VocabularySection(
                        index = 1,
                        title = "Common Verbs",
                        description = "Essential verbs for daily conversation",
                        items = listOf(
                            VocabularyItem(0, "食べる", "たべる", "to eat", PartOfSpeech.VERB, "朝ごはんを食べる", "to eat breakfast"),
                            VocabularyItem(1, "飲む", "のむ", "to drink", PartOfSpeech.VERB, "水を飲む", "to drink water"),
                            VocabularyItem(2, "見る", "みる", "to see/watch", PartOfSpeech.VERB, "テレビを見る", "to watch TV"),
                            VocabularyItem(3, "聞く", "きく", "to listen/ask", PartOfSpeech.VERB, "音楽を聞く", "to listen to music"),
                            VocabularyItem(4, "読む", "よむ", "to read", PartOfSpeech.VERB, "本を読む", "to read a book"),
                            VocabularyItem(5, "書く", "かく", "to write", PartOfSpeech.VERB, "手紙を書く", "to write a letter"),
                            VocabularyItem(6, "行く", "いく", "to go", PartOfSpeech.VERB, "学校に行く", "to go to school"),
                            VocabularyItem(7, "来る", "くる", "to come", PartOfSpeech.VERB, "日本に来る", "to come to Japan"),
                            VocabularyItem(8, "する", "する", "to do", PartOfSpeech.VERB, "勉強する", "to study"),
                            VocabularyItem(9, "ある", "ある", "to exist (inanimate)", PartOfSpeech.VERB, "机がある", "there is a desk")
                        )
                    ),
                    VocabularySection(
                        index = 2,
                        title = "Time Words",
                        description = "Words for expressing time",
                        items = listOf(
                            VocabularyItem(0, "今日", "きょう", "today", PartOfSpeech.NOUN, "今日は暑いです", "It's hot today"),
                            VocabularyItem(1, "明日", "あした", "tomorrow", PartOfSpeech.NOUN),
                            VocabularyItem(2, "昨日", "きのう", "yesterday", PartOfSpeech.NOUN),
                            VocabularyItem(3, "今", "いま", "now", PartOfSpeech.NOUN),
                            VocabularyItem(4, "朝", "あさ", "morning", PartOfSpeech.NOUN),
                            VocabularyItem(5, "昼", "ひる", "noon/daytime", PartOfSpeech.NOUN),
                            VocabularyItem(6, "夜", "よる", "night", PartOfSpeech.NOUN),
                            VocabularyItem(7, "週末", "しゅうまつ", "weekend", PartOfSpeech.NOUN)
                        )
                    )
                )
            ),
            VocabularyDeck(
                title = "Japanese Food Vocabulary",
                description = "Learn vocabulary related to Japanese cuisine",
                level = com.nihongomaster.domain.video.JLPTLevel.N5,
                topic = DeckTopic.FOOD,
                tags = listOf("food", "cuisine", "restaurant"),
                isPublic = true,
                isOfficial = true,
                createdBy = adminId,
                sections = listOf(
                    VocabularySection(
                        index = 0,
                        title = "Common Foods",
                        description = "Everyday Japanese foods",
                        items = listOf(
                            VocabularyItem(0, "ご飯", "ごはん", "rice/meal", PartOfSpeech.NOUN, "ご飯を食べましょう", "Let's eat"),
                            VocabularyItem(1, "寿司", "すし", "sushi", PartOfSpeech.NOUN),
                            VocabularyItem(2, "ラーメン", "らーめん", "ramen", PartOfSpeech.NOUN),
                            VocabularyItem(3, "うどん", "うどん", "udon noodles", PartOfSpeech.NOUN),
                            VocabularyItem(4, "味噌汁", "みそしる", "miso soup", PartOfSpeech.NOUN),
                            VocabularyItem(5, "天ぷら", "てんぷら", "tempura", PartOfSpeech.NOUN),
                            VocabularyItem(6, "刺身", "さしみ", "sashimi", PartOfSpeech.NOUN),
                            VocabularyItem(7, "焼き鳥", "やきとり", "grilled chicken skewers", PartOfSpeech.NOUN)
                        )
                    ),
                    VocabularySection(
                        index = 1,
                        title = "Drinks",
                        description = "Common beverages",
                        items = listOf(
                            VocabularyItem(0, "水", "みず", "water", PartOfSpeech.NOUN),
                            VocabularyItem(1, "お茶", "おちゃ", "tea", PartOfSpeech.NOUN),
                            VocabularyItem(2, "コーヒー", "こーひー", "coffee", PartOfSpeech.NOUN),
                            VocabularyItem(3, "ビール", "びーる", "beer", PartOfSpeech.NOUN),
                            VocabularyItem(4, "牛乳", "ぎゅうにゅう", "milk", PartOfSpeech.NOUN),
                            VocabularyItem(5, "ジュース", "じゅーす", "juice", PartOfSpeech.NOUN)
                        )
                    )
                )
            ),
            VocabularyDeck(
                title = "My Travel Vocabulary",
                description = "Words I'm learning for my Japan trip",
                level = com.nihongomaster.domain.video.JLPTLevel.N4,
                topic = DeckTopic.TRAVEL,
                tags = listOf("travel", "personal"),
                isPublic = true,
                isOfficial = false,
                createdBy = userId,
                sections = listOf(
                    VocabularySection(
                        index = 0,
                        title = "Transportation",
                        description = "Getting around Japan",
                        items = listOf(
                            VocabularyItem(0, "電車", "でんしゃ", "train", PartOfSpeech.NOUN),
                            VocabularyItem(1, "駅", "えき", "station", PartOfSpeech.NOUN),
                            VocabularyItem(2, "切符", "きっぷ", "ticket", PartOfSpeech.NOUN),
                            VocabularyItem(3, "バス", "ばす", "bus", PartOfSpeech.NOUN),
                            VocabularyItem(4, "タクシー", "たくしー", "taxi", PartOfSpeech.NOUN),
                            VocabularyItem(5, "空港", "くうこう", "airport", PartOfSpeech.NOUN)
                        )
                    )
                )
            ),
            VocabularyDeck(
                title = "JLPT N3 Grammar Vocabulary",
                description = "Key vocabulary for N3 grammar patterns",
                level = com.nihongomaster.domain.video.JLPTLevel.N3,
                topic = DeckTopic.JLPT_N3,
                tags = listOf("jlpt", "n3", "grammar"),
                isPublic = true,
                isOfficial = true,
                createdBy = adminId,
                sections = listOf(
                    VocabularySection(
                        index = 0,
                        title = "Conjunctions & Connectors",
                        description = "Words to connect sentences",
                        items = listOf(
                            VocabularyItem(0, "しかし", "しかし", "however", PartOfSpeech.CONJUNCTION),
                            VocabularyItem(1, "それに", "それに", "moreover", PartOfSpeech.CONJUNCTION),
                            VocabularyItem(2, "つまり", "つまり", "in other words", PartOfSpeech.CONJUNCTION),
                            VocabularyItem(3, "ところで", "ところで", "by the way", PartOfSpeech.CONJUNCTION),
                            VocabularyItem(4, "そのため", "そのため", "therefore", PartOfSpeech.CONJUNCTION)
                        )
                    )
                )
            )
        )

        deckRepository.saveAll(decks)
        logger.info("Seeded ${decks.size} vocabulary decks")
    }

    private fun seedForumPosts(postRepository: PostRepository, users: List<User>) {
        val admin = users.first { it.role == UserRole.ADMIN }
        val premiumUser = users.first { it.role == UserRole.PREMIUM }
        val regularUsers = users.filter { it.role == UserRole.USER }

        val posts = listOf(
            Post(
                title = "Welcome to Nihongo Master Community!",
                content = """
                    Welcome to our Japanese learning community! 🎉

                    This is a place where you can:
                    - Ask questions about Japanese grammar, vocabulary, or culture
                    - Share your learning progress and achievements
                    - Find study partners
                    - Get tips for JLPT preparation

                    Please be respectful to all members and enjoy your learning journey!

                    よろしくお願いします！
                """.trimIndent(),
                topic = ForumTopic.ANNOUNCEMENTS,
                authorId = admin.id!!,
                authorUsername = admin.username,
                authorAvatarUrl = admin.avatarUrl,
                isPinned = true,
                likeCount = 15,
                commentCount = 3,
                viewCount = 250
            ),
            Post(
                title = "Tips for Passing JLPT N3",
                content = """
                    After passing N3 last December, I want to share some tips:

                    1. **Vocabulary**: Use Anki or our vocabulary decks daily. Aim for 10-20 new words per day.

                    2. **Grammar**: Focus on understanding patterns, not just memorizing. Try to make your own example sentences.

                    3. **Reading**: Read NHK Easy News daily. It's free and great practice!

                    4. **Listening**: Watch Japanese content without subtitles. Even if you don't understand everything, it helps your ear adjust.

                    5. **Practice Tests**: Take official practice tests to get used to the format.

                    Good luck to everyone preparing for JLPT! 頑張ってね！
                """.trimIndent(),
                topic = ForumTopic.JLPT_TIPS,
                authorId = premiumUser.id!!,
                authorUsername = premiumUser.username,
                authorAvatarUrl = premiumUser.avatarUrl,
                tags = listOf("jlpt", "n3", "tips", "study-advice"),
                likeCount = 42,
                commentCount = 8,
                viewCount = 520
            ),
            Post(
                title = "Looking for a study partner (N4 level)",
                content = """
                    こんにちは！

                    I'm currently studying for JLPT N4 and looking for a study partner who is at a similar level.

                    My schedule:
                    - Weekday evenings (after 7 PM JST)
                    - Weekends are flexible

                    What I want to practice:
                    - Speaking (we can use Discord or LINE)
                    - Vocabulary review
                    - Grammar exercises

                    A bit about me:
                    - Native English speaker
                    - Been studying Japanese for 1 year
                    - Love anime and Japanese games

                    If you're interested, please comment below! 😊
                """.trimIndent(),
                topic = ForumTopic.PRACTICE_PARTNERS,
                authorId = regularUsers[0].id!!,
                authorUsername = regularUsers[0].username,
                authorAvatarUrl = regularUsers[0].avatarUrl,
                tags = listOf("study-partner", "n4", "speaking"),
                likeCount = 5,
                commentCount = 3,
                viewCount = 89
            ),
            Post(
                title = "Difference between は and が?",
                content = """
                    I'm confused about when to use は (wa) vs が (ga).

                    For example:
                    - 私は学生です (Watashi wa gakusei desu)
                    - 私が学生です (Watashi ga gakusei desu)

                    Both seem to mean "I am a student" but I know there's a difference. Can someone explain when to use which one?

                    Also, why do we say:
                    - 日本語が分かります (nihongo ga wakarimasu)
                    - 日本語は分かります (nihongo wa wakarimasu)

                    Are both correct? What's the nuance?

                    ありがとうございます！
                """.trimIndent(),
                topic = ForumTopic.GRAMMAR_QUESTIONS,
                authorId = regularUsers[1].id!!,
                authorUsername = regularUsers[1].username,
                authorAvatarUrl = regularUsers[1].avatarUrl,
                tags = listOf("grammar", "particles", "beginner"),
                likeCount = 12,
                commentCount = 6,
                viewCount = 178
            ),
            Post(
                title = "I passed JLPT N5! 🎉",
                content = """
                    やった！I just got my results and I passed N5 with a score of 142/180!

                    My journey:
                    - Started from zero 8 months ago
                    - Used this app's shadowing feature almost daily
                    - Completed 3 vocabulary decks
                    - Watched lots of anime (for "research" 😄)

                    Special thanks to this community for all the support and resources!

                    Now on to N4! 次は N4 を目指します！
                """.trimIndent(),
                topic = ForumTopic.SUCCESS_STORIES,
                authorId = regularUsers[2].id!!,
                authorUsername = regularUsers[2].username,
                authorAvatarUrl = regularUsers[2].avatarUrl,
                tags = listOf("jlpt", "n5", "passed", "success"),
                likeCount = 38,
                commentCount = 12,
                viewCount = 245
            ),
            Post(
                title = "Best resources for learning Kanji?",
                content = """
                    I'm struggling with kanji and looking for recommendations.

                    Currently I know about 100 kanji but I need to learn more for N4.

                    What methods have worked for you?
                    - Flashcards?
                    - Writing practice?
                    - Mnemonics?
                    - Apps?

                    Any book or app recommendations would be appreciated!
                """.trimIndent(),
                topic = ForumTopic.LEARNING_RESOURCES,
                authorId = regularUsers[0].id!!,
                authorUsername = regularUsers[0].username,
                authorAvatarUrl = regularUsers[0].avatarUrl,
                tags = listOf("kanji", "resources", "study-methods"),
                likeCount = 8,
                commentCount = 5,
                viewCount = 132
            )
        )

        postRepository.saveAll(posts)
        logger.info("Seeded ${posts.size} forum posts")
    }
}
