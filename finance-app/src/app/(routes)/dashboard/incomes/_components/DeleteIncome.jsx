"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";

function DeleteIncome({ incomeId, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const onDelete = async (e) => {
    // Stops the click from triggering a parent link or card click
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Delete this income source? This can't be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/incomes/${incomeId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }
      toast.success("Income source deleted");
      onDeleted?.();
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error(error.message || "Failed to delete income.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={deleting}
      onClick={onDelete}
      className="flex gap-1"
    >
      <Trash className="h-4 w-4" />
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}

export default DeleteIncome;