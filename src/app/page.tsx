"use client";
import { cn } from "@/lib/utils";
import { ChatOllama } from "langchain/chat_models/ollama";
import { AIMessage, HumanMessage } from "langchain/schema";
import { useState } from "react";

export default function Home() {
  const [newPrompt, setNewPrompt] = useState("");
  const [messages, setMessages] = useState<(HumanMessage | AIMessage)[]>([]);

  const ollama = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "zephyr",
  });

  async function triggerPrompt() {
    const size = messages.length;
    const msg = new HumanMessage(newPrompt);
    let streamedText = "";
    messages.push(msg);
    const msgCache = [...messages];
    const stream = await ollama.stream(messages);
    setNewPrompt("");
    for await (const chunk of stream) {
      console.log(chunk);
      streamedText += chunk.content;
      const aiMsg = new AIMessage(streamedText);
      const updatedMessages = [...msgCache, aiMsg]
      setMessages(() => updatedMessages);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-16">
      <div className="flex h-full w-full grow flex-col items-center justify-end gap-y-4 whitespace-break-spaces">
        {messages.map((msg, i) => (
          <p
            key={i}
            className={cn("flex h-fit text-sm text-white rounded-md border border-[#191919] px-2 py-1",
            {"ml-auto": msg._getType() == "human"},
            {"mr-auto": msg._getType() == "ai"}
            )}
          >
            {msg.content}
          </p>
        ))}
        <input
          onChange={(e) => {
            setNewPrompt(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              triggerPrompt();
            }
          }}
          id="search"
          className="block w-full appearance-none rounded-md border border-[#191919] bg-[#0a0a0a]/80 px-6 py-4 text-sm font-normal text-white outline-0 focus:outline-0 focus:ring-white/10 md:flex"
          placeholder="Send a message"
          type="text"
          value={newPrompt}
        ></input>
      </div>
    </main>
  );
}
