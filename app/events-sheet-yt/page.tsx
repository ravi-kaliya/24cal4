"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BellDot, Clock10 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Event {
  start: string;
  end: string;
  title: string;
  youtubeHindi: string;
  youtubeEnglish: string;
  timeZone: string;
}

const initialEventTitles: string[] = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Svelte",
  "Tailwind CSS",
  "Bootstrap",
  "Node.js",
  "Express.js",
  "Django",
  "Flask",
  "Spring Boot",
  "GraphQL",
  "REST API",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Firebase",
  "AWS",
  "Docker",
];

export default function EventsSheetYt() {
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string>("Select a sheet");
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchSheetNames = async () => {
      try {
        const res = await fetch("/api/events-sheet-yt?action=getSheetNames");
        const data = await res.json();
        if (res.ok) setSheetNames(data.sheetNames);
        else toast.error("Failed to fetch sheet names");
      } catch (error) {
        toast.error("Error fetching sheet names");
        console.error(error);
      }
    };
    fetchSheetNames();

    const today = new Date().toISOString().split("T")[0];
    const initialEvents = Array.from({ length: 24 }).map((_, index) => {
      const startHour = String(index).padStart(2, "0");
      const endHour = String((index + 1) % 24).padStart(2, "0");
      const title = initialEventTitles[index] || "Empty Slot";
      return {
        start: `${today}T${startHour}:00:00`,
        end: `${today}T${endHour}:00:00`,
        title,
        youtubeHindi: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " in Hindi")}`,
        youtubeEnglish: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " in English")}`,
        timeZone: "Asia/Kolkata",
      };
    });
    setEvents(initialEvents);
  }, []);

  useEffect(() => {
    if (selectedName !== "Select a sheet") {
      const fetchEvents = async () => {
        try {
          const res = await fetch(
            `/api/events-sheet-yt?action=getEvents&sheetName=${encodeURIComponent(selectedName)}`
          );
          const data = await res.json();
          if (res.ok) {
            const fetchedEvents = data.events;
            const today = new Date().toISOString().split("T")[0];
            const adjustedEvents = Array.from({ length: 24 }).map((_, index) => {
              const startHour = String(index).padStart(2, "0");
              const endHour = String((index + 1) % 24).padStart(2, "0");
              const event = fetchedEvents[index] || {
                title: initialEventTitles[index] || "Empty Slot",
                youtubeHindi: "",
                youtubeEnglish: "",
                timeZone: "Asia/Kolkata",
              };
              const title = event.title || initialEventTitles[index] || "Empty Slot";
              return {
                ...event,
                start: `${today}T${startHour}:00:00`,
                end: `${today}T${endHour}:00:00`,
                title,
                youtubeHindi: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " in Hindi")}`,
                youtubeEnglish: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " in English")}`,
                timeZone: event.timeZone || "Asia/Kolkata",
              };
            });
            setEvents(adjustedEvents);
          } else {
            toast.error("Failed to fetch events");
          }
        } catch (error) {
          toast.error("Error fetching events");
          console.error(error);
        }
      };
      fetchEvents();
    }
  }, [selectedName]);

  const handleEventAction = async (
    endpoint: string,
    data: any,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      const url = `${endpoint}?name=${encodeURIComponent(selectedName)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(errorMessage);
      toast.success(successMessage);
    } catch (error) {
      toast.error(errorMessage);
      console.error("Error in handleEventAction:", error);
    }
  };

  const addEvents = async () => {
    if (selectedName === "Select a sheet") {
      toast.error("Please select a sheet first!");
      return;
    }

    const eventsToAdd = events.filter((e) => e.title !== "Empty Slot");
    setSelectedEvents(eventsToAdd);
    await handleEventAction(
      "/api/events-sheet-yt",
      { action: "addAll", events: eventsToAdd },
      "All events added to calendar and sheet updated successfully!",
      "Failed to add events or update sheet!"
    );
  };

  const removeEvents = async () => {
    if (selectedName === "Select a sheet") {
      toast.error("Please select a sheet first!");
      return;
    }

    setSelectedEvents([]);
    await handleEventAction(
      "/api/events-sheet-yt",
      { action: "removeAll" },
      "All events removed from calendar and sheet cleared successfully!",
      "Failed to remove events or clear sheet!"
    );
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    const updatedEvents = [...events];
    updatedEvents[index] = {
      ...updatedEvents[index],
      title: newTitle,
      youtubeHindi: `https://www.youtube.com/results?search_query=${encodeURIComponent(newTitle + " in Hindi")}`,
      youtubeEnglish: `https://www.youtube.com/results?search_query=${encodeURIComponent(newTitle + " in English")}`
    };
    setEvents(updatedEvents);
  };

  return (
    <div className="p-4 h-dvh">
      <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
        {Array.from({ length: 24 }).map((_, index) => {
          const event = events[index] || {
            start: new Date().toISOString().replace(/:[0-9]+(\.[0-9]+)?$/, `:${String(index).padStart(2, "0")}:00`),
            end: new Date().toISOString().replace(/:[0-9]+(\.[0-9]+)?$/, `:${String((index + 1) % 24).padStart(2, "0")}:00`),
            title: initialEventTitles[index] || "Empty Slot",
            youtubeHindi: `https://www.youtube.com/results?search_query=${encodeURIComponent((initialEventTitles[index] || "Empty Slot") + " in Hindi")}`,
            youtubeEnglish: `https://www.youtube.com/results?search_query=${encodeURIComponent((initialEventTitles[index] || "Empty Slot") + " in English")}`,
            timeZone: "Asia/Kolkata",
          };
          const isSelected = selectedEvents.some((e) => e.title === event.title && event.title !== "Empty Slot");
          const startHour = String(index).padStart(2, "0");
          const endHour = String((index + 1) % 24).padStart(2, "0");
          const timeRange = `${startHour}:00 - ${endHour}:00`;

          return (
            <Card
              key={index}
              className={`cursor-pointer transition-all p-2 gap-1 ${isSelected ? "border border-green-500 bg-green-100" : ""}`}
            >
              <CardHeader className="p-0">
                <div className="flex justify-between">
                  <Badge>
                    <Clock10 className="w-4 h-4 mr-1" />
                    {timeRange}
                  </Badge>
                  <Badge variant="outline">
                    <BellDot className="w-4 h-4 mr-1" />
                    {`10`} min
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative p-0 space-y-2">
                <Input
                  value={event.title}
                  onChange={(e) => handleTitleChange(index, e.target.value)}
                  placeholder="Enter event title"
                />
                <div className="flex gap-2">
                  <a href={event.youtubeHindi} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm">
                    <Badge variant="outline"> H </Badge>
                  </a>
                  <a href={event.youtubeEnglish} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm">
                    <Badge variant="outline"> E </Badge>
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex gap-4 justify-end mt-4 items-center">
        <div className="mr-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{selectedName}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select Sheet</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sheetNames.map((name) => (
                <DropdownMenuItem key={name} onClick={() => setSelectedName(name)}>
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button variant="default" onClick={addEvents}>
          Add All Events
        </Button>
        <Button variant="destructive" onClick={removeEvents}>
          Remove All Events
        </Button>
      </div>
    </div>
  );
}