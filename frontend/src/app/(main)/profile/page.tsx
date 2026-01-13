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
  X,
  Save,
  Loader2,
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
  Input,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { userApi } from "@/lib/api-client";
import { getLevelColor } from "@/lib/hooks";

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Edit profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    bio: "",
    nativeLanguage: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Edit preferences modal state
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferencesForm, setPreferencesForm] = useState({
    dailyGoalMinutes: 30,
    showFurigana: true,
    autoPlayAudio: true,
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  if (isLoading || !user) {
    return <LoadingPage message="Loading profile..." />;
  }

  const skillLevels = {
    Listening: user.progress?.listeningScore || 0,
    Speaking: user.progress?.speakingScore || 0,
    Vocabulary: user.progress?.vocabularyScore || 0,
  };

  const openEditModal = () => {
    setEditForm({
      displayName: user.displayName || "",
      bio: user.bio || "",
      nativeLanguage: user.nativeLanguage || "",
    });
    setSaveError(null);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await userApi.updateProfile({
        displayName: editForm.displayName,
        bio: editForm.bio,
        nativeLanguage: editForm.nativeLanguage,
      });
      await refreshUser?.();
      setShowEditModal(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const openPreferencesModal = () => {
    setPreferencesForm({
      dailyGoalMinutes: user.preferences?.dailyGoalMinutes || 30,
      showFurigana: user.preferences?.showFurigana ?? true,
      autoPlayAudio: user.preferences?.autoPlayAudio ?? true,
    });
    setShowPreferencesModal(true);
  };

  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);

    try {
      await userApi.updatePreferences(preferencesForm);
      await refreshUser?.();
      setShowPreferencesModal(false);
    } catch (err) {
      console.error("Failed to save preferences:", err);
    } finally {
      setIsSavingPreferences(false);
    }
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
        <Button variant="secondary" size="sm" onClick={openEditModal}>
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
                  <Button variant="secondary" size="sm" onClick={openEditModal}>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-neutral-200">
                  Learning Preferences
                </h3>
                <Button variant="secondary" size="sm" onClick={openPreferencesModal}>
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </div>
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowEditModal(false)}
        >
          <Card
            className="max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-semibold text-neutral-200">
                  Edit Profile
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Display Name
                  </label>
                  <Input
                    value={editForm.displayName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, displayName: e.target.value })
                    }
                    placeholder="Your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-yellow-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Native Language
                  </label>
                  <select
                    value={editForm.nativeLanguage}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nativeLanguage: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="">Select language</option>
                    <option value="English">English</option>
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Korean">Korean</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {saveError && (
                  <p className="text-sm text-red-400">{saveError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Preferences Modal */}
      {showPreferencesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowPreferencesModal(false)}
        >
          <Card
            className="max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-heading font-semibold text-neutral-200">
                  Learning Preferences
                </h3>
                <button
                  onClick={() => setShowPreferencesModal(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">
                    Daily Goal (minutes)
                  </label>
                  <select
                    value={preferencesForm.dailyGoalMinutes}
                    onChange={(e) =>
                      setPreferencesForm({
                        ...preferencesForm,
                        dailyGoalMinutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-yellow-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div>
                    <p className="text-neutral-200">Show Furigana</p>
                    <p className="text-sm text-neutral-400">
                      Display reading hints on kanji
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setPreferencesForm({
                        ...preferencesForm,
                        showFurigana: !preferencesForm.showFurigana,
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferencesForm.showFurigana
                        ? "bg-yellow-500"
                        : "bg-neutral-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        preferencesForm.showFurigana
                          ? "translate-x-6"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-neutral-900 border border-neutral-700 rounded-lg">
                  <div>
                    <p className="text-neutral-200">Auto-play Audio</p>
                    <p className="text-sm text-neutral-400">
                      Automatically play pronunciation
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setPreferencesForm({
                        ...preferencesForm,
                        autoPlayAudio: !preferencesForm.autoPlayAudio,
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-colors ${
                      preferencesForm.autoPlayAudio
                        ? "bg-yellow-500"
                        : "bg-neutral-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        preferencesForm.autoPlayAudio
                          ? "translate-x-6"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowPreferencesModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    disabled={isSavingPreferences}
                    className="flex-1"
                  >
                    {isSavingPreferences ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
