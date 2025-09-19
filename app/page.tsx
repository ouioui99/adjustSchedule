"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Calendar, Users } from "lucide-react";

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

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            イベント調整さん
          </h1>
          <p className="text-lg text-muted-foreground">
            みんなの都合を合わせて、簡単にイベントの日程を決めましょう
          </p>
        </div>

        {/* Create Event Button */}
        <div className="text-center mb-8">
          <Link href="/create">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-secondary-foreground px-4 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" />
              新しいイベントを作成
            </Button>
          </Link>
        </div>

        {/* Events List */}
        {events.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-6 break-words">
              作成されたイベント
            </h2>
            {events.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-md transition-shadow max-w-full overflow-hidden"
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start flex-wrap gap-2 sm:gap-4 w-full">
                    <div className="w-full sm:w-auto break-words">
                      <CardTitle className="text-lg sm:text-2xl font-semibold text-card-foreground break-words">
                        {event.title}
                      </CardTitle>
                      {event.description && (
                        <CardDescription className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground break-words">
                          {event.description}
                        </CardDescription>
                      )}
                    </div>
                    {event.finalDate && (
                      <div className="bg-accent/20 text-destructive px-3 py-1 rounded-full text-xs sm:text-sm font-medium mt-2 sm:mt-0">
                        確定済み
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="w-full max-w-full">
                  {/* 候補日・参加者 */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm sm:text-base text-muted-foreground mb-4">
                    <div className="flex items-center flex-wrap gap-1">
                      <Calendar className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="font-medium">
                        候補日: {event.proposedDates.length}日
                      </span>
                    </div>
                    <div className="flex items-center flex-wrap gap-1">
                      <Users className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="font-medium">
                        参加者: {Object.keys(event.participants).length + 1}人
                      </span>
                    </div>
                  </div>

                  {/* 確定日 or 候補日リスト */}
                  {event.finalDate ? (
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 sm:p-4 mb-4 w-full max-w-full break-words">
                      <p className="text-sm sm:text-base text-foreground font-medium">
                        確定した日程
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-foreground mt-1 break-words">
                        {formatDate(event.finalDate)}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-2 mb-4 w-full max-w-full">
                      {event.proposedDates.slice(0, 4).map((date, index) => (
                        <div
                          key={index}
                          className="text-sm sm:text-base text-muted-foreground bg-muted/20 rounded px-2 py-1 font-medium truncate w-full"
                        >
                          {formatDate(date)}
                        </div>
                      ))}
                      {event.proposedDates.length > 4 && (
                        <div className="text-sm sm:text-base text-muted-foreground font-medium w-full truncate">
                          他 {event.proposedDates.length - 4} 日...
                        </div>
                      )}
                    </div>
                  )}

                  {/* ボタン */}
                  <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 w-full">
                    <Link
                      href={`/event/${event.id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto text-sm sm:text-base"
                      >
                        詳細を見る
                      </Button>
                    </Link>
                    <Link
                      href={`/event/${event.id}/participate`}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        size="sm"
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-secondary-foreground text-sm sm:text-base"
                      >
                        参加登録
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 sm:w-16 h-12 sm:h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-base sm:text-lg text-muted-foreground">
              まだイベントが作成されていません
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              上のボタンから新しいイベントを作成してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
