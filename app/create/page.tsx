'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Calendar as CalendarIcon, X } from 'lucide-react';
import Link from 'next/link';

export default function CreateEvent() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && selectedDates.length < 5) {
      const dateString = date.toISOString().split('T')[0];
      const existingDate = selectedDates.find(d => d.toISOString().split('T')[0] === dateString);
      
      if (!existingDate) {
        setSelectedDates([...selectedDates, date]);
      }
    }
  };

  const removeDateAt = (index: number) => {
    setSelectedDates(selectedDates.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title.trim() || selectedDates.length === 0) {
      alert('イベント名と候補日を入力してください');
      return;
    }

    const eventId = Date.now().toString();
    const newEvent = {
      id: eventId,
      title: title.trim(),
      description: description.trim(),
      proposedDates: selectedDates.map(date => date.toISOString().split('T')[0]),
      participants: {},
      createdAt: new Date().toISOString()
    };

    const existingEvents = JSON.parse(localStorage.getItem('events') || '[]');
    existingEvents.push(newEvent);
    localStorage.setItem('events', JSON.stringify(existingEvents));

    router.push(`/event/${eventId}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">新しいイベントを作成</h1>
        </div>

        <div className="space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>イベント情報</CardTitle>
              <CardDescription>
                イベントの基本情報を入力してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  イベント名 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：忘年会、プロジェクト会議"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  説明（任意）
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="イベントの詳細や場所などを入力してください"
                  rows={3}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>候補日の選択</CardTitle>
              <CardDescription>
                参加者に提案する日程を選択してください（最大5日まで）
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Selected Dates */}
              {selectedDates.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">選択された候補日</h4>
                  <div className="space-y-2">
                    {selectedDates.map((date, index) => (
                      <div key={index} className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
                        <span className="text-primary-foreground">{formatDate(date)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDateAt(index)}
                          className="text-primary hover:text-primary/80 p-1"
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
                disabled={selectedDates.length >= 5}
                className="w-full"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {showCalendar ? 'カレンダーを閉じる' : 'カレンダーから日付を選択'}
                {selectedDates.length >= 5 && ' （最大5日）'}
              </Button>

              {/* Calendar */}
              {showCalendar && (
                <div className="mt-4 flex justify-center">
                  <Calendar
                    mode="single"
                    selected={undefined}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date() || selectedDates.length >= 5}
                    className="rounded-md border"
                  />
                </div>
              )}

              <p className="text-sm text-muted-foreground mt-2">
                選択済み: {selectedDates.length}/5日
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              onClick={handleSubmit}
              disabled={!title.trim() || selectedDates.length === 0}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              イベントを作成する
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}