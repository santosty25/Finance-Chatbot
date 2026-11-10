"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

function CreateIncomes({ refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

  const [name, setName] = useState();
  const [amount, setAmount] = useState();

  const { user } = useUser();

  /**
   * Used to Create New Budget
   */
  const onCreateIncomes = async () => {
    try {
        const response = await fetch("/api/incomes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                amount,
                icon: emojiIcon,
            }),
        });

        const responseText = await response.text();

        console.log("Response status:", response.status);
        console.log("Response body:", responseText);

        if (!response.ok) {
            throw new Error(responseText);
        }

        const result = JSON.parse(responseText);

        console.log("Created income:", result);

        refreshData?.();
        toast.success("New Income Source Created!");

    } catch (error) {
        console.error("Error creating income:", error);
        toast.error("Failed to create income.");
    }
  };

  return (
    <div>
        <Dialog>
            <DialogTrigger asChild>
                <div
                    className="bg-slate-100 p-10 rounded-2xl
                    items-center flex flex-col border-2 border-dashed
                    cursor-pointer hover:shadow-md"
                >
                    <h2 className="text-3xl">+</h2>
                    <h2>Create New Income Source</h2>
                </div>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create New Income Source
                    </DialogTitle>

                    <DialogDescription>
                        Add a new income source to track your earnings.
                    </DialogDescription>
                </DialogHeader>

                {/* Emoji Picker and Form Inputs */}
                <div className="mt-5">
                    <Button
                        variant="outline"
                        className="text-lg"
                        onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
                    >
                        {emojiIcon}
                    </Button>

                    <div className="absolute z-20">
                        <EmojiPicker
                            open={openEmojiPicker}
                            onEmojiClick={(e) => {
                                setEmojiIcon(e.emoji);
                                setOpenEmojiPicker(false);
                            }}
                        />
                    </div>

                    <div className="mt-2">
                        <h2 className="text-black font-medium my-1">
                            Source Name
                        </h2>
                        <Input
                            placeholder="e.g. Youtube"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="mt-2">
                        <h2 className="text-black font-medium my-1">
                            Monthly Amount
                        </h2>
                        <Input
                            type="number"
                            placeholder="e.g. 5000"
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button
                            disabled={!(name && amount)}
                            onClick={() => onCreateIncomes()}
                            className="mt-5 w-full rounded-full"
                        >
                            Create Income Source
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

export default CreateIncomes;