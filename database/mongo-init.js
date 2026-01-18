// ============================================
// MongoDB Initialization Script
// ============================================

// Switch to the application database
db = db.getSiblingDB('nihongo_master');

// Create application user
db.createUser({
    user: 'nihongo_app',
    pwd: 'nihongo_app_password',
    roles: [
        {
            role: 'readWrite',
            db: 'nihongo_master'
        }
    ]
});

// Create indexes for better performance
print('Creating indexes...');

// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });

// Refresh tokens
db.refreshTokens.createIndex({ "token": 1 }, { unique: true });
db.refreshTokens.createIndex({ "userId": 1 });
db.refreshTokens.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

// Videos collection indexes
db.videos.createIndex({ "youtubeId": 1 }, { unique: true });
db.videos.createIndex({ "title": "text", "description": "text" });
db.videos.createIndex({ "level": 1 });
db.videos.createIndex({ "createdAt": -1 });

// Vocabulary decks
db.vocabularyDecks.createIndex({ "userId": 1 });
db.vocabularyDecks.createIndex({ "createdAt": -1 });
db.vocabularyDecks.createIndex({ "name": "text" });

// Vocabulary progress
db.vocabularyProgress.createIndex({ "userId": 1, "deckId": 1 }, { unique: true });
db.vocabularyProgress.createIndex({ "nextReviewDate": 1 });

// Practice attempts
db.dictationAttempts.createIndex({ "userId": 1 });
db.dictationAttempts.createIndex({ "videoId": 1 });
db.dictationAttempts.createIndex({ "createdAt": -1 });

db.shadowingAttempts.createIndex({ "userId": 1 });
db.shadowingAttempts.createIndex({ "videoId": 1 });
db.shadowingAttempts.createIndex({ "createdAt": -1 });

// Forum posts
db.posts.createIndex({ "userId": 1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "title": "text", "content": "text" });

// Comments
db.comments.createIndex({ "postId": 1 });
db.comments.createIndex({ "userId": 1 });
db.comments.createIndex({ "createdAt": -1 });

// Post likes
db.postLikes.createIndex({ "postId": 1, "userId": 1 }, { unique: true });

print('MongoDB initialization completed!');
