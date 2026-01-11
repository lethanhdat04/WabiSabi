"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  Calendar,
  Target,
  Clock,
  Flame,
  Award,
  BookOpen,
  TrendingUp,
  Edit,
  ChevronRight,
  Globe,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

const mockUser = {
  name: "Alex Johnson",
  username: "alexj",
  email: "alex.johnson@email.com",
  avatar: "",
  level: "N4",
  joinedAt: "2023-06-15",
  timezone: "UTC-5",
  bio: "Japanese language enthusiast. Currently preparing for JLPT N3. Love anime and J-drama!",
  stats: {
    streak: 42,
    totalDays: 180,
    totalHours: 156,
    wordsLearned: 1250,
    videosWatched: 45,
    postsWritten: 12,
  },
  achievements: [
    {
      id: "a1",
      name: "First Steps",
      description: "Complete your first practice session",
      icon: "award",
      earnedAt: "2023-06-15",
    },
    {
      id: "a2",
      name: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: "flame",
      earnedAt: "2023-06-22",
    },
    {
      id: "a3",
      name: "Vocabulary Master",
      description: "Learn 1000 words",
      icon: "book",
      earnedAt: "2024-01-10",
    },
    {
      id: "a4",
      name: "Month Milestone",
      description: "Maintain a 30-day streak",
      icon: "flame",
      earnedAt: "2023-07-15",
    },
  ],
  skillLevels: {
    reading: 68,
    listening: 55,
    speaking: 42,
    vocabulary: 72,
    grammar: 58,
  },
  recentActivity: [
    {
      type: "practice",
      title: "Shadowing Practice",
      description: "Daily Conversation - Episode 5",
      date: "Today",
      score: 85,
    },
    {
      type: "vocabulary",
      title: "Flashcard Review",
      description: "JLPT N4 Vocabulary",
      date: "Today",
      score: 92,
    },
    {
      type: "post",
      title: "New Post",
      description: "Tips for learning kanji",
      date: "Yesterday",
    },
    {
      type: "video",
      title: "Video Completed",
      description: "Business Japanese Basics",
      date: "2 days ago",
    },
  ],
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-neutral-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-heading font-semibold text-neutral-200">
                {mockUser.name}
              </h1>
              <Badge variant="yellow">{mockUser.level}</Badge>
            </div>
            <p className="text-neutral-400">@{mockUser.username}</p>
            <p className="text-sm text-neutral-400 mt-1">{mockUser.bio}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm">
          <Edit className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {mockUser.stats.streak}
              </p>
              <p className="text-sm text-neutral-400">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {mockUser.stats.totalHours}h
              </p>
              <p className="text-sm text-neutral-400">Study Time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {mockUser.stats.wordsLearned}
              </p>
              <p className="text-sm text-neutral-400">Words Learned</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {mockUser.achievements.length}
              </p>
              <p className="text-sm text-neutral-400">Achievements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Skill Levels */}
          <Card>
            <CardContent>
              <h3 className="font-heading font-semibold text-neutral-200 mb-4">
                Skill Levels
              </h3>
              <div className="space-y-4">
                {Object.entries(mockUser.skillLevels).map(([skill, level]) => (
                  <div key={skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-400 capitalize">{skill}</span>
                      <span className="text-neutral-200">{level}%</span>
                    </div>
                    <Progress value={level} size="sm" />
                  </div>
                ))}
              </div>
              <Link href="/progress">
                <Button variant="secondary" size="sm" className="w-full mt-4">
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <h3 className="font-heading font-semibold text-neutral-200 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {mockUser.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-200">
                        {activity.title}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right">
                      {activity.score && (
                        <Badge variant="green">{activity.score}%</Badge>
                      )}
                      <p className="text-xs text-neutral-400 mt-1">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/history">
                <Button variant="secondary" size="sm" className="w-full mt-4">
                  View All History
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "achievements" && (
        <Card>
          <CardContent>
            <h3 className="font-heading font-semibold text-neutral-200 mb-4">
              Achievements ({mockUser.achievements.length})
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {mockUser.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-700 rounded-lg"
                >
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-200">
                      {achievement.name}
                    </p>
                    <p className="text-sm text-neutral-400">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Earned {achievement.earnedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "settings" && (
        <div className="space-y-4">
          <Card>
            <CardContent>
              <h3 className="font-heading font-semibold text-neutral-200 mb-4">
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-400">Email</p>
                      <p className="text-neutral-200">{mockUser.email}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-400">Timezone</p>
                      <p className="text-neutral-200">{mockUser.timezone}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-400">Member Since</p>
                      <p className="text-neutral-200">{mockUser.joinedAt}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="font-heading font-semibold text-neutral-200 mb-4">
                Learning Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div>
                    <p className="text-neutral-200">Daily Goal</p>
                    <p className="text-sm text-neutral-400">
                      Set your daily practice target
                    </p>
                  </div>
                  <Badge variant="yellow">3 sessions</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div>
                    <p className="text-neutral-200">Current Level</p>
                    <p className="text-sm text-neutral-400">
                      Your JLPT target level
                    </p>
                  </div>
                  <Badge variant="yellow">{mockUser.level}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
