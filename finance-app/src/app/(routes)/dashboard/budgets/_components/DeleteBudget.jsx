"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";

function DeleteBudget({ budgetId, onDeleted }) {
  const [deleting, setDeleting] = useState(false);

  const onDelete = async (e) => {
    // Keeps the click from triggering a parent link or card click
    e.preventDefault();
    e.stopPropagation();

    if (
      !window.confirm(
        "Delete this budget and all of its expenses? This can't be undone."
      )
    )
      return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/budgets/${budgetId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

      toast.success("Budget deleted");
      onDeleted?.();
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error(error.message || "Failed to delete budget.");
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

export default DeleteBudget;