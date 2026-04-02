import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock } from "lucide-react";
import type { Page } from "../App";
import type { Category, Course } from "../backend";

const THUMBNAIL_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-teal-500 to-cyan-600",
  "from-blue-600 to-cyan-500",
  "from-indigo-500 to-blue-400",
  "from-violet-500 to-purple-400",
];

const BADGE_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-purple-100 text-purple-800",
  "bg-yellow-100 text-yellow-800",
  "bg-teal-100 text-teal-800",
  "bg-green-100 text-green-800",
];

interface CourseCardProps {
  course: Course;
  category?: Category;
  index?: number;
  navigate: (p: Page) => void;
  ocid?: string;
}

export default function CourseCard({
  course,
  category,
  index = 0,
  navigate,
  ocid,
}: CourseCardProps) {
  const gradientClass = THUMBNAIL_GRADIENTS[index % THUMBNAIL_GRADIENTS.length];
  const badgeClass = BADGE_COLORS[index % BADGE_COLORS.length];

  const formattedDate = new Date(
    Number(course.createdAt / BigInt(1_000_000)),
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="bg-card rounded-xl border border-border shadow-card hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
      data-ocid={ocid}
    >
      {/* Thumbnail */}
      <div
        className={`relative h-40 bg-gradient-to-br ${gradientClass} overflow-hidden`}
      >
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/70" />
          </div>
        )}
        {category && (
          <span
            className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}
          >
            {category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {course.description}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <Clock className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
        <Button
          size="sm"
          className="mt-2 w-full rounded-lg bg-primary/90 hover:bg-primary text-white text-xs"
          onClick={() => navigate({ name: "course", id: course.id })}
          data-ocid="course.button"
        >
          View Course
        </Button>
      </div>
    </div>
  );
}
