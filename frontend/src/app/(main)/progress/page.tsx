"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Mic,
  Headphones,
  MessageSquare,
  PenLine,
  Calendar,
  ChevronRight,
  Flame,
  Award,
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

const mockSkillData = {
  overall: {
    level: "N4",
    progress: 65,
    nextLevel: "N3",
    estimatedTime: "3 months",
  },
  skills: [
    {
      id: "reading",
      name: "Reading",
      icon: BookOpen,
      level: 68,
      trend: "+5",
      color: "yellow",
      subSkills: [
        { name: "Kanji Recognition", level: 72 },
        { name: "Vocabulary", level: 75 },
        { name: "Grammar Patterns", level: 58 },
        { name: "Comprehension", level: 65 },
      ],
    },
    {
      id: "listening",
      name: "Listening",
      icon: Headphones,
      level: 55,
      trend: "+8",
      color: "blue",
      subSkills: [
        { name: "Word Recognition", level: 60 },
        { name: "Speed Processing", level: 48 },
        { name: "Conversation Flow", level: 55 },
        { name: "Accent Understanding", level: 52 },
      ],
    },
    {
      id: "speaking",
      name: "Speaking",
      icon: Mic,
      level: 42,
      trend: "+3",
      color: "green",
      subSkills: [
        { name: "Pronunciation", level: 48 },
        { name: "Fluency", level: 38 },
        { name: "Intonation", level: 42 },
        { name: "Response Time", level: 40 },
      ],
    },
    {
      id: "writing",
      name: "Writing",
      icon: PenLine,
      level: 58,
      trend: "+4",
      color: "purple",
      subSkills: [
        { name: "Hiragana/Katakana", level: 95 },
        { name: "Kanji Writing", level: 45 },
        { name: "Sentence Structure", level: 52 },
        { name: "Composition", level: 40 },
      ],
    },
  ],
  weeklyActivity: [
    { day: "Mon", minutes: 45, sessions: 3 },
    { day: "Tue", minutes: 30, sessions: 2 },
    { day: "Wed", minutes: 60, sessions: 4 },
    { day: "Thu", minutes: 25, sessions: 2 },
    { day: "Fri", minutes: 50, sessions: 3 },
    { day: "Sat", minutes: 75, sessions: 5 },
    { day: "Sun", minutes: 40, sessions: 3 },
  ],
  milestones: [
    {
      id: "m1",
      title: "Complete 100 Flashcard Sessions",
      progress: 68,
      target: 100,
      current: 68,
    },
    {
      id: "m2",
      title: "Learn 1500 Vocabulary Words",
      progress: 83,
      target: 1500,
      current: 1250,
    },
    {
      id: "m3",
      title: "Practice 50 Hours of Shadowing",
      progress: 45,
      target: 50,
      current: 22.5,
    },
    {
      id: "m4",
      title: "Achieve 80% Average Accuracy",
      progress: 100,
      target: 80,
      current: 82,
      completed: true,
    },
  ],
  recommendations: [
    {
      skill: "Listening",
      suggestion: "Focus on speed processing exercises",
      action: "Try dictation practice with faster audio",
    },
    {
      skill: "Speaking",
      suggestion: "Increase shadowing frequency",
      action: "Add 10 more minutes daily",
    },
    {
      skill: "Kanji",
      suggestion: "Review stroke order for common kanji",
      action: "Practice writing 5 new kanji daily",
    },
  ],
};

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const getColorClasses = (color: string) => {
    switch (color) {
      case "yellow":
        return { bg: "bg-yellow-500/10", text: "text-yellow-500" };
      case "blue":
        return { bg: "bg-blue-500/10", text: "text-blue-500" };
      case "green":
        return { bg: "bg-green-500/10", text: "text-green-500" };
      case "purple":
        return { bg: "bg-purple-500/10", text: "text-purple-500" };
      default:
        return { bg: "bg-neutral-700", text: "text-neutral-400" };
    }
  };

  const maxMinutes = Math.max(...mockSkillData.weeklyActivity.map((d) => d.minutes));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-semibold text-neutral-200">
          Progress Dashboard
        </h1>
        <p className="text-neutral-400 mt-1">
          Track your Japanese learning journey
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-neutral-200">
                Overall Progress
              </h3>
              <p className="text-sm text-neutral-400">
                Working towards {mockSkillData.overall.nextLevel}
              </p>
            </div>
            <Badge variant="yellow" className="text-lg px-4 py-1">
              {mockSkillData.overall.level}
            </Badge>
          </div>
          <Progress value={mockSkillData.overall.progress} size="lg" />
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-neutral-400">
              {mockSkillData.overall.progress}% to {mockSkillData.overall.nextLevel}
            </span>
            <span className="text-neutral-400">
              Est. {mockSkillData.overall.estimatedTime}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Skill Summary */}
          <div className="grid sm:grid-cols-2 gap-4">
            {mockSkillData.skills.map((skill) => {
              const Icon = skill.icon;
              const colors = getColorClasses(skill.color);
              return (
                <Card key={skill.id} variant="interactive">
                  <CardContent>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg}`}
                      >
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-neutral-200">
                            {skill.name}
                          </h4>
                          <span className="text-sm text-green-500">
                            {skill.trend}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Progress value={skill.level} size="sm" />
                    <p className="text-sm text-neutral-400 mt-2">
                      {skill.level}% proficiency
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Weekly Activity Chart */}
          <Card>
            <CardContent>
              <h3 className="font-heading font-semibold text-neutral-200 mb-4">
                Weekly Activity
              </h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {mockSkillData.weeklyActivity.map((day) => (
                  <div
                    key={day.day}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-yellow-500/20 rounded-t-lg transition-all hover:bg-yellow-500/30"
                      style={{
                        height: `${(day.minutes / maxMinutes) * 100}%`,
                        minHeight: "8px",
                      }}
                    >
                      <div
                        className="w-full bg-yellow-500 rounded-t-lg"
                        style={{
                          height: `${(day.sessions / 5) * 100}%`,
                          minHeight: "4px",
                        }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400">{day.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded" />
                  <span className="text-neutral-400">Sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500/20 rounded" />
                  <span className="text-neutral-400">Study Time</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardContent>
              <h3 className="font-heading font-semibold text-neutral-200 mb-4">
                Personalized Recommendations
              </h3>
              <div className="space-y-3">
                {mockSkillData.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="yellow">{rec.skill}</Badge>
                      <span className="text-neutral-200">{rec.suggestion}</span>
                    </div>
                    <p className="text-sm text-neutral-400">{rec.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "skills" && (
        <div className="space-y-4">
          {mockSkillData.skills.map((skill) => {
            const Icon = skill.icon;
            const colors = getColorClasses(skill.color);
            const isExpanded = expandedSkill === skill.id;

            return (
              <Card key={skill.id}>
                <CardContent className="p-0">
                  <button
                    onClick={() =>
                      setExpandedSkill(isExpanded ? null : skill.id)
                    }
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}
                      >
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-heading font-semibold text-neutral-200">
                            {skill.name}
                          </h4>
                          <span className="text-sm text-green-500">
                            {skill.trend}% this month
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <Progress
                            value={skill.level}
                            size="sm"
                            className="w-32"
                          />
                          <span className="text-sm text-neutral-400">
                            {skill.level}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-neutral-400 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-neutral-700 pt-4">
                      <h5 className="text-sm font-medium text-neutral-400 mb-3">
                        Sub-skills Breakdown
                      </h5>
                      <div className="space-y-3">
                        {skill.subSkills.map((sub) => (
                          <div key={sub.name}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-neutral-400">{sub.name}</span>
                              <span className="text-neutral-200">{sub.level}%</span>
                            </div>
                            <Progress value={sub.level} size="sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "milestones" && (
        <div className="space-y-4">
          {mockSkillData.milestones.map((milestone) => (
            <Card key={milestone.id}>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        milestone.completed
                          ? "bg-green-500/10"
                          : "bg-yellow-500/10"
                      }`}
                    >
                      {milestone.completed ? (
                        <Award className="w-5 h-5 text-green-500" />
                      ) : (
                        <Target className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-200">
                        {milestone.title}
                      </h4>
                      <p className="text-sm text-neutral-400">
                        {milestone.current} / {milestone.target}
                        {typeof milestone.current === "number" &&
                        milestone.current < 100
                          ? milestone.target > 100
                            ? ""
                            : " sessions"
                          : milestone.target > 100
                          ? " words"
                          : " hours"}
                      </p>
                    </div>
                  </div>
                  {milestone.completed ? (
                    <Badge variant="green">Completed</Badge>
                  ) : (
                    <span className="text-sm text-neutral-400">
                      {milestone.progress}%
                    </span>
                  )}
                </div>
                <Progress
                  value={Math.min(milestone.progress, 100)}
                  size="md"
                />
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flame className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="font-heading font-semibold text-neutral-200 mb-2">
                Keep Going!
              </h3>
              <p className="text-neutral-400 mb-4">
                You&apos;re making great progress. Complete your milestones to
                unlock achievements.
              </p>
              <Link href="/practice">
                <Button>
                  <Target className="w-5 h-5" />
                  Continue Practice
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
