"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  Calendar,
  Check,
  Crown,
  Copy,
  Share2,
} from "lucide-react";

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

export default function EventDetail() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const savedEvents = JSON.parse(localStorage.getItem("events") || "[]");
    const foundEvent = savedEvents.find((e: Event) => e.id === params.id);
    setEvent(foundEvent || null);
  }, [params.id]);

  const handleFinalizeDate = (date: string) => {
    if (!event) return;

    const updatedEvent = { ...event, finalDate: date };
    const savedEvents = JSON.parse(localStorage.getItem("events") || "[]");
    const updatedEvents = savedEvents.map((e: Event) =>
      e.id === event.id ? updatedEvent : e
    );
    localStorage.setItem("events", JSON.stringify(updatedEvents));
    setEvent(updatedEvent);
  };

  const handleCopyUrl = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };
  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">
            イベントが見つかりません
          </p>
          <Link href="/">
            <Button variant="outline">ホームに戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  // Calculate participants for each date
  const getParticipantsForDate = (dateString: string) => {
    const participants: string[] = [];
    Object.entries(event.participants).forEach(([nickname, data]) => {
      if (data.availableDates.includes(dateString)) {
        participants.push(nickname);
      }
      if (data.additionalDates?.includes(dateString)) {
        participants.push(nickname);
      }
    });
    return participants;
  };

  const getAllDates = () => {
    const allDates = new Set(event.proposedDates);
    Object.values(event.participants).forEach((participant) => {
      if (participant.additionalDates) {
        participant.additionalDates.forEach((date) => allDates.add(date));
      }
    });
    return Array.from(allDates).sort();
  };

  const getMostPopularDate = () => {
    const allDates = getAllDates();
    let maxCount = 0;
    let popularDate = "";

    allDates.forEach((date) => {
      const count = getParticipantsForDate(date).length;
      if (count > maxCount) {
        maxCount = count;
        popularDate = date;
      }
    });

    return { date: popularDate, count: maxCount };
  };

  const mostPopular = getMostPopularDate();
  const notAttendingParticipants = Object.entries(event.participants)
    .filter(([_, data]) => data.notAttending)
    .map(([nickname, _]) => nickname);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
        </div>

        {/* Event Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="w-5 h-5 mr-2" />
              イベントを共有
            </CardTitle>
            <CardDescription>
              このURLをコピーしてLINEやSNSに貼り付けて友達に送ろう
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2 bg-muted/20 rounded border text-sm text-muted-foreground">
                {typeof window !== "undefined" ? window.location.href : ""}
              </div>
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                size="sm"
                className={
                  copySuccess
                    ? "bg-green-50 text-green-700 border-green-200"
                    : ""
                }
              >
                <Copy className="w-4 h-4 mr-1" />
                {copySuccess ? "コピー済み!" : "コピー"}
              </Button>
            </div>
          </CardContent>
        </Card>
        {event.finalDate && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-2">
              <Check className="w-6 h-6 text-accent-foreground mr-2" />
              <h2 className="text-xl font-semibold text-accent-foreground">
                確定した日程
              </h2>
            </div>
            <p className="text-2xl font-bold text-accent-foreground mb-2">
              {formatDate(event.finalDate)}
            </p>
            <p className="text-accent-foreground">
              参加者: {getParticipantsForDate(event.finalDate).join("、")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Description */}
            {event.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">イベント詳細</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-card-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Date Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">候補日と参加状況</CardTitle>
                <CardDescription>各候補日の参加者一覧</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getAllDates().map((date, index) => {
                    const participants = getParticipantsForDate(date);
                    const isOriginal = event.proposedDates.includes(date);
                    const isMostPopular =
                      date === mostPopular.date && participants.length > 0;

                    return (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          event.finalDate === date
                            ? "bg-accent/10 border-accent/30"
                            : isMostPopular
                            ? "bg-primary/10 border-primary/30"
                            : "bg-muted/10 border-border"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-card-foreground">
                              {formatDate(date)}
                            </h3>
                            {!isOriginal && (
                              <span className="bg-secondary/20 text-secondary-foreground text-xs px-2 py-1 rounded-full">
                                追加提案
                              </span>
                            )}
                            {isMostPopular && !event.finalDate && (
                              <span className="bg-primary/20 text-primary-foreground text-xs px-2 py-1 rounded-full">
                                最多参加
                              </span>
                            )}
                          </div>
                          {!event.finalDate && (
                            <Button
                              size="sm"
                              onClick={() => handleFinalizeDate(date)}
                              className="bg-accent hover:bg-accent/90 text-accent-foreground"
                              disabled={participants.length === 0}
                            >
                              この日に決定！
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="w-4 h-4 mr-1" />
                          {participants.length}人:{" "}
                          {participants.join("、") || "まだ参加者がいません"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Participate Button */}
            <Card>
              <CardContent className="pt-6">
                <Link href={`/event/${event.id}/participate`}>
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-secondary-foreground"
                  >
                    参加登録・回答
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">サマリー</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">候補日数</span>
                  <span className="font-semibold">
                    {getAllDates().length}日
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">参加予定者</span>
                  <span className="font-semibold">
                    {Object.keys(event.participants).length -
                      notAttendingParticipants.length}
                    人
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">不参加者</span>
                  <span className="font-semibold">
                    {notAttendingParticipants.length}人
                  </span>
                </div>
                {mostPopular.count > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">
                      最も人気の日程
                    </p>
                    <p className="font-semibold text-primary">
                      {formatDate(mostPopular.date)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {mostPopular.count}人が参加可能
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Not Attending List */}
            {notAttendingParticipants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">
                    不参加者
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {notAttendingParticipants.map((nickname) => (
                      <div key={nickname} className="text-sm">
                        <span className="font-medium">{nickname}</span>
                        {event.participants[nickname].reason && (
                          <p className="text-muted-foreground text-xs mt-1">
                            理由: {event.participants[nickname].reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
