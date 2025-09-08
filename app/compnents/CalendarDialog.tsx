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
import { log } from "console";

type CalendarDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDates: Date[];
  onDateSelect: (date: Date[] | undefined) => void;
  onRemoveDate: (index: number) => void;
  onConfirm: () => void;
  formatDate: (date: Date) => string;
  maxSelectable?: number;
  getAllProposedDates: () => string[]; // 追加: 既存の候補日一覧を返す関数
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>候補日を選択</DialogTitle>
        </DialogHeader>

        {/* 高さを固定してカレンダーが動かないようにする */}
        <div className="flex justify-center py-4 min-h-[360px]">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={onDateSelect}
            disabled={(date) => {
              const dateString = date.toISOString().split("T")[0];
              return (
                date < new Date() ||
                selectedDates.length >= maxSelectable ||
                getAllProposedDates().includes(dateString) // ← ここで除外
              );
            }}
            className="rounded-md border"
          />
        </div>

        {/* 選択された候補日のリスト */}
        {selectedDates.length > 0 && (
          <div className="mt-4 max-h-20 overflow-y-auto">
            <h4 className="text-sm font-medium text-foreground mb-2">
              選択された候補日
            </h4>
            <div className="space-y-2">
              {selectedDates.map((date, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-3 py-2"
                >
                  <span className="text-primary-foreground">
                    {formatDate(date)}
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

        {/* 確定ボタン */}
        <div className="mt-4 flex justify-end ">
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
