"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Layers,
  ChevronDown,
  ChevronUp,
  GripVertical,
  FileText,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
} from "@/components/ui";
import { deckApi } from "@/lib/api-client";

interface VocabItem {
  id: string;
  japaneseWord: string;
  reading: string;
  meaning: string;
  exampleSentence?: string;
  exampleMeaning?: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  items: VocabItem[];
  isExpanded: boolean;
}

const levels = ["N5", "N4", "N3", "N2", "N1"];
const topics = [
  { value: "GENERAL", label: "General" },
  { value: "GRAMMAR", label: "Grammar" },
  { value: "KANJI", label: "Kanji" },
  { value: "DAILY_LIFE", label: "Daily Life" },
  { value: "TRAVEL", label: "Travel" },
  { value: "BUSINESS", label: "Business" },
  { value: "FOOD", label: "Food" },
  { value: "CULTURE", label: "Culture" },
  { value: "ANIME_MANGA", label: "Anime & Manga" },
  { value: "JLPT_N5", label: "JLPT N5" },
  { value: "JLPT_N4", label: "JLPT N4" },
  { value: "JLPT_N3", label: "JLPT N3" },
  { value: "JLPT_N2", label: "JLPT N2" },
  { value: "JLPT_N1", label: "JLPT N1" },
  { value: "OTHER", label: "Other" },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function CreateDeckPage() {
  const router = useRouter();

  // Deck metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("N5");
  const [topic, setTopic] = useState("GENERAL");
  const [isPublic, setIsPublic] = useState(false);

  // Sections and items
  const [sections, setSections] = useState<Section[]>([
    {
      id: generateId(),
      title: "Section 1",
      description: "",
      items: [
        { id: generateId(), japaneseWord: "", reading: "", meaning: "" },
      ],
      isExpanded: true,
    },
  ]);

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importDelimiter, setImportDelimiter] = useState("tab");
  const [importTargetSection, setImportTargetSection] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section management
  const addSection = () => {
    setSections([
      ...sections,
      {
        id: generateId(),
        title: `Section ${sections.length + 1}`,
        description: "",
        items: [{ id: generateId(), japaneseWord: "", reading: "", meaning: "" }],
        isExpanded: true,
      },
    ]);
  };

  const removeSection = (sectionId: string) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const updateSection = (sectionId: string, field: string, value: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    );
  };

  const toggleSection = (sectionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s
      )
    );
  };

  // Item management
  const addItem = (sectionId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: [
                ...s.items,
                { id: generateId(), japaneseWord: "", reading: "", meaning: "" },
              ],
            }
          : s
      )
    );
  };

  const removeItem = (sectionId: string, itemId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
          : s
      )
    );
  };

  const updateItem = (
    sectionId: string,
    itemId: string,
    field: keyof VocabItem,
    value: string
  ) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((i) =>
                i.id === itemId ? { ...i, [field]: value } : i
              ),
            }
          : s
      )
    );
  };

  // Import functionality (Quizlet-like)
  const parseImportText = (text: string, delimiter: string): VocabItem[] => {
    const lines = text.trim().split("\n");
    const items: VocabItem[] = [];

    const delim = delimiter === "tab" ? "\t" : delimiter === "comma" ? "," : ";";

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(delim).map((p) => p.trim());

      if (parts.length >= 2) {
        // Format: japanese, reading, meaning OR japanese, meaning
        if (parts.length >= 3) {
          items.push({
            id: generateId(),
            japaneseWord: parts[0],
            reading: parts[1],
            meaning: parts[2],
            exampleSentence: parts[3] || undefined,
            exampleMeaning: parts[4] || undefined,
          });
        } else {
          // Assume format: japanese, meaning (reading same as japanese for hiragana)
          items.push({
            id: generateId(),
            japaneseWord: parts[0],
            reading: parts[0], // Default reading to same as japanese
            meaning: parts[1],
          });
        }
      }
    }

    return items;
  };

  const handleImport = () => {
    const items = parseImportText(importText, importDelimiter);

    if (items.length === 0) {
      setError("No valid items found in import text");
      return;
    }

    if (importTargetSection) {
      // Add to existing section
      setSections(
        sections.map((s) =>
          s.id === importTargetSection
            ? { ...s, items: [...s.items.filter((i) => i.japaneseWord), ...items] }
            : s
        )
      );
    } else {
      // Create new section with imported items
      setSections([
        ...sections,
        {
          id: generateId(),
          title: `Imported (${items.length} items)`,
          description: "",
          items,
          isExpanded: true,
        },
      ]);
    }

    setShowImportModal(false);
    setImportText("");
    setImportTargetSection(null);
  };

  // Submit deck
  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    // Filter out empty items and sections
    const validSections = sections
      .map((s) => ({
        title: s.title,
        description: s.description || undefined,
        items: s.items
          .filter((i) => i.japaneseWord.trim() && i.meaning.trim())
          .map((i) => ({
            japaneseWord: i.japaneseWord.trim(),
            reading: i.reading.trim() || i.japaneseWord.trim(),
            meaning: i.meaning.trim(),
            exampleSentence: i.exampleSentence?.trim() || undefined,
            exampleMeaning: i.exampleMeaning?.trim() || undefined,
          })),
      }))
      .filter((s) => s.items.length > 0);

    if (validSections.length === 0) {
      setError("At least one section with vocabulary items is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const deck = await deckApi.create({
        title: title.trim(),
        description: description.trim() || undefined,
        level: level as any,
        topic: topic as any,
        isPublic,
        sections: validSections,
      });

      router.push(`/decks/${deck.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deck");
      setIsSubmitting(false);
    }
  };

  const totalItems = sections.reduce((acc, s) => acc + s.items.filter((i) => i.japaneseWord).length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/decks"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Decks
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="yellow">{totalItems} items</Badge>
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-heading font-semibold text-neutral-200 mb-2">
          Create New Deck
        </h1>
        <p className="text-neutral-400">
          Create a vocabulary deck to study. You can add items manually or import from text.
        </p>
      </div>

      {/* Deck Metadata */}
      <Card>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-2">
              Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., JLPT N5 Vocabulary - Week 1"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-200 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will learners study in this deck?"
              className="w-full h-24 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:border-yellow-500 resize-none"
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-2">
                Level *
              </label>
              <div className="flex flex-wrap gap-2">
                {levels.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      level === l
                        ? "bg-yellow-500 text-neutral-900"
                        : "bg-neutral-900 text-neutral-400 border border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-2">
                Topic *
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-yellow-500"
              >
                {topics.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-yellow-500 focus:ring-yellow-500"
            />
            <label htmlFor="isPublic" className="text-sm text-neutral-300">
              Make this deck public (others can view and study)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Import Button */}
      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => setShowImportModal(true)}>
          <Upload className="w-5 h-5" />
          Import from Text
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardContent className="p-0">
              {/* Section Header */}
              <div className="p-4 border-b border-neutral-700">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="p-1 hover:bg-neutral-800 rounded"
                  >
                    {section.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>

                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, "title", e.target.value)}
                      placeholder="Section title"
                      className="text-sm"
                    />
                    <Input
                      value={section.description}
                      onChange={(e) => updateSection(section.id, "description", e.target.value)}
                      placeholder="Description (optional)"
                      className="text-sm"
                    />
                  </div>

                  <Badge variant="default">
                    {section.items.filter((i) => i.japaneseWord).length} items
                  </Badge>

                  {sections.length > 1 && (
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Section Items */}
              {section.isExpanded && (
                <div className="p-4 space-y-3">
                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-2 text-xs text-neutral-400 px-2">
                    <div className="col-span-3">Japanese *</div>
                    <div className="col-span-3">Reading *</div>
                    <div className="col-span-5">Meaning *</div>
                    <div className="col-span-1"></div>
                  </div>

                  {section.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-3">
                        <Input
                          value={item.japaneseWord}
                          onChange={(e) =>
                            updateItem(section.id, item.id, "japaneseWord", e.target.value)
                          }
                          placeholder="日本語"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          value={item.reading}
                          onChange={(e) =>
                            updateItem(section.id, item.id, "reading", e.target.value)
                          }
                          placeholder="にほんご"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          value={item.meaning}
                          onChange={(e) =>
                            updateItem(section.id, item.id, "meaning", e.target.value)
                          }
                          placeholder="Japanese language"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => removeItem(section.id, item.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addItem(section.id)}
                    className="w-full mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Button variant="secondary" onClick={addSection} className="w-full">
          <Plus className="w-5 h-5" />
          Add Section
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-700">
        <Link href="/decks">
          <Button variant="secondary">Cancel</Button>
        </Link>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Deck"}
        </Button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
                <h3 className="text-lg font-heading font-semibold text-neutral-200">
                  Import from Text
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-neutral-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">
                    Import Format
                  </label>
                  <p className="text-sm text-neutral-400 mb-3">
                    Paste your vocabulary list. Each line should contain: Japanese, Reading, Meaning (separated by your chosen delimiter).
                    If you only have 2 columns, it will be treated as Japanese, Meaning.
                  </p>
                  <div className="flex gap-2">
                    {[
                      { value: "tab", label: "Tab" },
                      { value: "comma", label: "Comma" },
                      { value: "semicolon", label: "Semicolon" },
                    ].map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setImportDelimiter(d.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          importDelimiter === d.value
                            ? "bg-yellow-500 text-neutral-900"
                            : "bg-neutral-900 text-neutral-400 border border-neutral-700"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">
                    Add to Section
                  </label>
                  <select
                    value={importTargetSection || ""}
                    onChange={(e) => setImportTargetSection(e.target.value || null)}
                    className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:border-yellow-500"
                  >
                    <option value="">Create new section</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-2">
                    Paste your vocabulary list
                  </label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={`Example (tab-separated):
食べる	たべる	to eat
飲む	のむ	to drink
大きい	おおきい	big

Or with 2 columns:
食べる	to eat
飲む	to drink`}
                    className="w-full h-64 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-yellow-500 resize-none font-mono text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <FileText className="w-4 h-4" />
                  <span>
                    {importText.trim().split("\n").filter((l) => l.trim()).length} lines detected
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-700 flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowImportModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!importText.trim()}>
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
