"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Tokyo");

type CalendarDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: string[]; // YYYY-MM-DD
  onDateSelect: (dates: string[]) => void; // 外部に渡す型
  onRemoveDate: (index: number) => void;
  onConfirm: () => void;
  formatDate: (dateString: string) => string; // stringを受け取る
  maxSelectable?: number;
  getAllProposedDates: () => string[];
};

export function CalendarDialog({
  open,
  onOpenChange,
  selectedDates,
  onDateSelect,
  onRemoveDate,
  onConfirm,
  formatDate,
  maxSelectable = 5,
  getAllProposedDates,
}: CalendarDialogProps) {
  const handleSelect = (dates: Date[] | undefined) => {
    if (!dates) return;

    // 選択された日付をYYYY-MM-DD形式に変換
    const lastSelectedDate = dates[dates.length - 1]; // 新しく追加された日
    const dateStr = dayjs(lastSelectedDate)
      .tz("Asia/Tokyo")
      .format("YYYY-MM-DD");

    if (
      !selectedDates.includes(dateStr) &&
      selectedDates.length < maxSelectable &&
      !getAllProposedDates().includes(dateStr)
    ) {
      const newDates = [...selectedDates, dateStr].sort(
        (a, b) =>
          dayjs(a).tz("Asia/Tokyo").valueOf() -
          dayjs(b).tz("Asia/Tokyo").valueOf()
      );
      onDateSelect(newDates);
    }
  };

  const disabledDate = (date: Date) => {
    const dateStr = dayjs(date).tz("Asia/Tokyo").format("YYYY-MM-DD");
    const todayStr = dayjs().tz("Asia/Tokyo").format("YYYY-MM-DD");
    // maxSelectableが3の場合は既存候補日も選択不可
    if (maxSelectable === 3) {
      return (
        dateStr < todayStr || // 過去日
        selectedDates.length >= maxSelectable || // 選択上限
        getAllProposedDates().includes(dateStr) // 既存候補日
      );
    } else {
      return (
        dateStr < todayStr || // 過去日
        selectedDates.length >= maxSelectable // 選択上限
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>候補日を選択</DialogTitle>
        </DialogHeader>

        <div className="flex justify-center py-4 min-h-[360px]">
          <Calendar
            mode="multiple"
            selected={selectedDates.map((d) =>
              dayjs(d).tz("Asia/Tokyo").toDate()
            )}
            onSelect={(dates: Date[] | undefined) => {
              if (!dates) {
                onDateSelect([]);
                return;
              }

              // Date[] を string[] (YYYY-MM-DD) に変換
              let dateStrings = dates.map((d) =>
                dayjs(d).tz("Asia/Tokyo").format("YYYY-MM-DD")
              );

              // 上限を超えたら古い方を削除
              if (dateStrings.length > maxSelectable) {
                dateStrings = dateStrings.slice(-maxSelectable);
              }

              // カレンダー順にソート
              const sortedDates = dateStrings.sort((a, b) =>
                dayjs(a).isBefore(dayjs(b)) ? -1 : 1
              );

              onDateSelect(sortedDates);
            }}
            disabled={disabledDate}
          />
        </div>

        {selectedDates.length > 0 && (
          <div className="mt-4 max-h-20 overflow-y-auto">
            <h4 className="text-sm font-medium text-foreground mb-2">
              選択された候補日
            </h4>
            <div className="space-y-2">
              {selectedDates.map((dateStr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-3 py-2"
                >
                  <span className="text-primary-foreground">
                    {formatDate(dateStr)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDate(index)}
                    className="text-primary hover:text-primary/80 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-2">
          選択済み: {selectedDates.length}/{maxSelectable}日
        </p>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={onConfirm}
            disabled={selectedDates.length === 0}
            className="bg-primary hover:bg-primary/90 text-secondary-foreground"
          >
            確定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
