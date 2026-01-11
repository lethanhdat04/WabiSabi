"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  Clock,
  Flame,
  Award,
  BookOpen,
  Edit,
  ChevronRight,
  Globe,
  Mail,
  Mic,
  Video,
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
  LoadingPage,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { getLevelColor } from "@/lib/hooks";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading || !user) {
    return <LoadingPage message="Loading profile..." />;
  }

  const skillLevels = {
    Listening: user.progress?.listeningScore || 0,
    Speaking: user.progress?.speakingScore || 0,
    Vocabulary: user.progress?.vocabularyScore || 0,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-neutral-700 rounded-full flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-neutral-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-heading font-semibold text-neutral-200">
                {user.displayName || user.username}
              </h1>
              {user.targetLevel && (
                <Badge variant={getLevelColor(user.targetLevel) as any}>
                  {user.targetLevel}
                </Badge>
              )}
            </div>
            <p className="text-neutral-400">@{user.username}</p>
            {user.bio && (
              <p className="text-sm text-neutral-400 mt-1">{user.bio}</p>
            )}
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
                {user.progress?.streak || 0}
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
                {Math.round((user.progress?.totalPracticeMinutes || 0) / 60)}h
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
                {user.progress?.vocabMastered || 0}
              </p>
              <p className="text-sm text-neutral-400">Words Learned</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-semibold text-neutral-200">
                {user.progress?.videosCompleted || 0}
              </p>
              <p className="text-sm text-neutral-400">Videos Watched</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
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
                {Object.entries(skillLevels).map(([skill, level]) => (
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

          {/* Statistics Summary */}
          <Card>
            <CardContent>
              <h3 className="font-heading font-semibold text-neutral-200 mb-4">
                Progress Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-yellow-500" />
                    <span className="text-neutral-200">Max Streak</span>
                  </div>
                  <span className="text-neutral-200 font-medium">
                    {user.progress?.maxStreak || 0} days
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-green-500" />
                    <span className="text-neutral-200">Total XP</span>
                  </div>
                  <span className="text-neutral-200 font-medium">
                    {user.progress?.totalXP || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-blue-500" />
                    <span className="text-neutral-200">Speaking Score</span>
                  </div>
                  <span className="text-neutral-200 font-medium">
                    {user.progress?.speakingScore || 0}%
                  </span>
                </div>
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

      {activeTab === "stats" && (
        <Card>
          <CardContent>
            <h3 className="font-heading font-semibold text-neutral-200 mb-4">
              Detailed Statistics
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">Total Practice Time</p>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {Math.round((user.progress?.totalPracticeMinutes || 0) / 60)}h{" "}
                  {(user.progress?.totalPracticeMinutes || 0) % 60}m
                </p>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">Vocabulary Mastered</p>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {user.progress?.vocabMastered || 0} words
                </p>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">Videos Completed</p>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {user.progress?.videosCompleted || 0} videos
                </p>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">Total XP Earned</p>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {user.progress?.totalXP || 0} XP
                </p>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">Followers</p>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {user.followersCount || 0}
                </p>
              </div>

              <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg">
                <p className="text-sm text-neutral-400 mb-1">Following</p>
                <p className="text-2xl font-heading font-semibold text-neutral-200">
                  {user.followingCount || 0}
                </p>
              </div>
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
                      <p className="text-neutral-200">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-400">Native Language</p>
                      <p className="text-neutral-200">
                        {user.nativeLanguage || "Not set"}
                      </p>
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
                      <p className="text-neutral-200">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
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
                      Minutes of practice per day
                    </p>
                  </div>
                  <Badge variant="yellow">
                    {user.preferences?.dailyGoalMinutes || 30} min
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div>
                    <p className="text-neutral-200">Target Level</p>
                    <p className="text-sm text-neutral-400">Your JLPT target</p>
                  </div>
                  <Badge variant={getLevelColor(user.targetLevel || "N5") as any}>
                    {user.targetLevel || "N5"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div>
                    <p className="text-neutral-200">Show Furigana</p>
                    <p className="text-sm text-neutral-400">
                      Display reading hints on kanji
                    </p>
                  </div>
                  <Badge variant={user.preferences?.showFurigana ? "green" : "default"}>
                    {user.preferences?.showFurigana ? "On" : "Off"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div>
                    <p className="text-neutral-200">Auto-play Audio</p>
                    <p className="text-sm text-neutral-400">
                      Automatically play pronunciation
                    </p>
                  </div>
                  <Badge variant={user.preferences?.autoPlayAudio ? "green" : "default"}>
                    {user.preferences?.autoPlayAudio ? "On" : "Off"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
