"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  X,
  AlertCircle,
} from "lucide-react";
import { CalendarDialog } from "@/app/compnents/CalendarDialog";
import { log } from "console";

interface Event {
  id: string;
  title: string;
  description: string;
  proposedDates: string[];
  participants: {
    [nickname: string]: {
      availableDates: string[];
      additionalDates?: string[];
      notAttending?: boolean;
      reason?: string;
    };
  };
  finalDate?: string;
  createdAt: string;
}

export default function Participate() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [nickname, setNickname] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [additionalDates, setAdditionalDates] = useState<Date[]>([]);
  const [notAttending, setNotAttending] = useState(false);
  const [reason, setReason] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem("events") || "[]");
    const foundEvent = savedEvents.find((e: Event) => e.id === params.id);
    setEvent(foundEvent || null);
  }, [params.id]);

  const handleDateToggle = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter((d) => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  // 追加日程の選択
  const handleAdditionalDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return;

    // 最大3日制限
    const limitedDates = dates.slice(0, 3);

    // 既存候補日や既に選択済みを除外
    const filteredDates = limitedDates.filter((d) => {
      const dateString = d.toISOString().split("T")[0];
      return !getAllProposedDates().includes(dateString);
    });

    setAdditionalDates(filteredDates);
  };

  const removeAdditionalDate = (index: number) => {
    setAdditionalDates(additionalDates.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    setShowCalendar(false);
  };

  const handleSubmit = () => {
    if (!nickname.trim()) {
      alert("ニックネームを入力してください");
      return;
    }

    if (
      !notAttending &&
      selectedDates.length === 0 &&
      additionalDates.length === 0
    ) {
      alert(
        "参加可能な日程を選択するか、追加日程を提案するか、不参加を選択してください"
      );
      return;
    }

    if (!event) return;

    const participantData = {
      availableDates: selectedDates,
      additionalDates: additionalDates.map(
        (date) => date.toISOString().split("T")[0]
      ),
      notAttending,
      ...(notAttending && reason.trim() && { reason: reason.trim() }),
    };

    const updatedEvent = {
      ...event,
      participants: {
        ...event.participants,
        [nickname.trim()]: participantData,
      },
    };

    const savedEvents = JSON.parse(localStorage.getItem("events") || "[]");
    const updatedEvents = savedEvents.map((e: Event) =>
      e.id === event.id ? updatedEvent : e
    );
    localStorage.setItem("events", JSON.stringify(updatedEvents));

    router.push(`/event/${event.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatDateFromDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">イベントが見つかりません</p>
          <Link href="/">
            <Button variant="outline">ホームに戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (event.finalDate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-orange-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              このイベントは既に確定済みです
            </h1>
            <p className="text-gray-600 mb-2">確定した日程:</p>
            <p className="text-xl font-semibold text-orange-600 mb-6">
              {formatDate(event.finalDate)}
            </p>
            <Link href={`/event/${event.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                イベント詳細に戻る
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getAllProposedDates = () => {
    const allDates = new Set(event.proposedDates);
    Object.values(event.participants).forEach((participant) => {
      if (participant.additionalDates) {
        participant.additionalDates.forEach((date) => allDates.add(date));
      }
    });
    return Array.from(allDates).sort();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href={`/event/${event.id}`}>
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">参加登録</h1>
            <p className="text-muted-foreground mt-1">{event.title}</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Nickname Input */}
          <Card>
            <CardHeader>
              <CardTitle>ニックネーム</CardTitle>
              <CardDescription>
                参加者一覧に表示される名前を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="例：田中、yamada、太郎"
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Not Attending Option */}
          <Card>
            <CardHeader>
              <CardTitle>参加について</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Checkbox
                  id="not-attending"
                  checked={notAttending}
                  onCheckedChange={(checked) => {
                    setNotAttending(checked as boolean);
                    if (checked) {
                      setSelectedDates([]);
                      setAdditionalDates([]);
                    }
                  }}
                />
                <label
                  htmlFor="not-attending"
                  className="text-sm font-medium text-destructive"
                >
                  都合が悪く参加できません
                </label>
              </div>

              {notAttending && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    理由（任意）
                  </label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="例：出張予定、他の予定と重複"
                    rows={2}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {!notAttending && (
            <>
              {/* Available Dates Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>参加可能な日程</CardTitle>
                  <CardDescription>
                    参加できる日程をすべて選択してください
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getAllProposedDates().map((date, index) => {
                      const isOriginalProposal =
                        event.proposedDates.includes(date);
                      const proposer = !isOriginalProposal
                        ? Object.entries(event.participants).find(([_, data]) =>
                            data.additionalDates?.includes(date)
                          )?.[0]
                        : null;

                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/10"
                        >
                          <Checkbox
                            id={`date-${index}`}
                            checked={selectedDates.includes(date)}
                            onCheckedChange={() => handleDateToggle(date)}
                          />
                          <label
                            htmlFor={`date-${index}`}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium text-card-foreground">
                              {formatDate(date)}
                            </div>
                            {!isOriginalProposal && proposer && (
                              <div className="text-sm text-secondary-foreground">
                                {proposer}さんの追加提案
                              </div>
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Dates */}
              <Card>
                <CardHeader>
                  <CardTitle>追加の日程提案</CardTitle>
                  <CardDescription>
                    上記の候補日で都合が悪い場合、新しい日程を提案できます（最大3日まで）
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Selected Additional Dates */}
                  {additionalDates.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        提案した追加日程
                      </h4>
                      <div className="space-y-2">
                        {additionalDates.map((date, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-secondary/10 border border-secondary/30 rounded-lg px-3 py-2"
                          >
                            <span className="text-primary-foreground">
                              {formatDateFromDate(date)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAdditionalDate(index)}
                              className="text-secondary hover:text-secondary/80 p-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calendar Toggle */}
                  <Button
                    variant="outline"
                    onClick={() => setShowCalendar(!showCalendar)}
                    disabled={additionalDates.length >= 3}
                    className="w-full"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    追加日程を提案する
                    {additionalDates.length >= 3 && " （最大3日）"}
                  </Button>

                  <p className="text-sm text-muted-foreground mt-2">
                    追加提案: {additionalDates.length}/3日
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!nickname.trim()}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              参加登録を完了する
            </Button>
            <CalendarDialog
              open={showCalendar}
              onOpenChange={setShowCalendar}
              selectedDates={additionalDates}
              onDateSelect={handleAdditionalDateSelect}
              onRemoveDate={removeAdditionalDate}
              onConfirm={handleConfirm}
              formatDate={formatDateFromDate}
              maxSelectable={3} // ← 参加画面は最大3日
              getAllProposedDates={getAllProposedDates}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
