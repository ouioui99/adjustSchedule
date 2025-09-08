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
              className="bg-primary hover:bg-primary/90 text-secondary-foreground px-8 py-3"
            >
              <Plus className="w-5 h-5 mr-2" />
              新しいイベントを作成
            </Button>
          </Link>
        </div>

        {/* Events List */}
        {events.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              作成されたイベント
            </h2>
            {events.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl text-card-foreground">
                        {event.title}
                      </CardTitle>
                      {event.description && (
                        <CardDescription className="mt-2 text-muted-foreground">
                          {event.description}
                        </CardDescription>
                      )}
                    </div>
                    {event.finalDate && (
                      <div className="bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium">
                        確定済み
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      候補日: {event.proposedDates.length}日
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      参加者: {Object.keys(event.participants).length}人
                    </div>
                  </div>

                  {event.finalDate ? (
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-4">
                      <p className="text-sm text-accent-foreground font-medium">
                        確定した日程
                      </p>
                      <p className="text-lg font-semibold text-accent-foreground mt-1">
                        {formatDate(event.finalDate)}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                      {event.proposedDates.slice(0, 3).map((date, index) => (
                        <div
                          key={index}
                          className="text-sm text-muted-foreground bg-muted/20 rounded px-2 py-1"
                        >
                          {formatDate(date)}
                        </div>
                      ))}
                      {event.proposedDates.length > 3 && (
                        <div className="text-sm text-muted-foreground">
                          他 {event.proposedDates.length - 3} 日...
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Link href={`/event/${event.id}`}>
                      <Button variant="outline" size="sm">
                        詳細を見る
                      </Button>
                    </Link>
                    <Link href={`/event/${event.id}/participate`}>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-secondary-foreground"
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
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              まだイベントが作成されていません
            </p>
            <p className="text-muted-foreground mt-2">
              上のボタンから新しいイベントを作成してください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
