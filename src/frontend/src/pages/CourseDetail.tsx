import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Calendar, Folder, User } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";
import Footer from "../components/Footer";
import MaterialItem from "../components/MaterialItem";
import {
  useAllCategories,
  useAllCourses,
  useMaterialsForCourse,
} from "../hooks/useQueries";

const THUMBNAIL_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-teal-500 to-cyan-600",
];

interface CourseDetailProps {
  courseId: bigint;
  navigate: (p: Page) => void;
}

export default function CourseDetail({
  courseId,
  navigate,
}: CourseDetailProps) {
  const { data: courses, isLoading: coursesLoading } = useAllCourses();
  const { data: categories } = useAllCategories();
  const { data: materials, isLoading: materialsLoading } =
    useMaterialsForCourse(courseId);

  const course = (courses || []).find((c) => c.id === courseId);
  const category = course
    ? (categories || []).find((c) => c.id === course.categoryId)
    : undefined;
  const courseIndex = (courses || []).findIndex((c) => c.id === courseId);
  const gradientClass =
    THUMBNAIL_GRADIENTS[courseIndex % THUMBNAIL_GRADIENTS.length];

  if (coursesLoading) {
    return (
      <div
        className="container mx-auto px-4 py-12"
        data-ocid="course.loading_state"
      >
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-6 w-2/3 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    );
  }

  if (!course) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="course.error_state"
      >
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The course you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button
          onClick={() => navigate({ name: "home" })}
          className="rounded-full"
          data-ocid="course.button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
        </Button>
      </div>
    );
  }

  const instructorShort = `${course.instructorId.toString().slice(0, 12)}...`;

  return (
    <div className="flex flex-col">
      <div
        className={`relative bg-gradient-to-br ${gradientClass} overflow-hidden`}
      >
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div className="relative z-10 container mx-auto px-4 py-12">
          <Button
            variant="ghost"
            onClick={() => navigate({ name: "home" })}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full mb-6 -ml-2"
            data-ocid="course.button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {category && (
              <Badge className="bg-white/20 text-white border-white/30 mb-3">
                {category.name}
              </Badge>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-white/80 max-w-2xl leading-relaxed mb-6">
              {course.description}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{instructorShort}</span>
              </div>
              {category && (
                <div className="flex items-center gap-1.5">
                  <Folder className="w-4 h-4" />
                  <span>{category.name}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(
                    Number(course.createdAt / BigInt(1_000_000)),
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <h2 className="text-xl font-bold mb-5">
          Course Materials
          {materials && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({materials.length} item{materials.length !== 1 ? "s" : ""})
            </span>
          )}
        </h2>

        {materialsLoading ? (
          <div className="space-y-3" data-ocid="materials.loading_state">
            {["a", "b", "c", "d"].map((k) => (
              <Skeleton key={k} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : !materials || materials.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border"
            data-ocid="materials.empty_state"
          >
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-25" />
            <p className="font-medium">No materials yet</p>
            <p className="text-sm mt-1">
              Materials will appear here once uploaded by the instructor.
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {materials.map((material, i) => (
              <motion.div
                key={material.id.toString()}
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  visible: { opacity: 1, x: 0 },
                }}
                data-ocid={`materials.item.${i + 1}`}
              >
                <MaterialItem material={material} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
