import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight,
  BookOpen,
  FileText,
  LayoutGrid,
  Link2,
  Search,
  Share2,
  Layout as SlideIcon,
  Star,
  Upload,
  Users,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Page } from "../App";
import CourseCard from "../components/CourseCard";
import Footer from "../components/Footer";
import { useActor } from "../hooks/useActor";
import {
  useAllCategories,
  useAllCourses,
  useAllMaterials,
  useSearchCourses,
  useSeedData,
} from "../hooks/useQueries";

interface HomeProps {
  navigate: (p: Page) => void;
}

const MATERIAL_TYPE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  document: FileText,
  slide: SlideIcon,
  video: Video,
  link: Link2,
};

export default function Home({ navigate }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [seeded, setSeeded] = useState(false);

  const { actor } = useActor();
  const { data: courses, isLoading: coursesLoading } = useAllCourses();
  const { data: categories } = useAllCategories();
  const { data: materials } = useAllMaterials();
  const { data: searchResults } = useSearchCourses(debouncedQuery);
  const seedMutation = useSeedData();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (
      actor &&
      courses &&
      courses.length === 0 &&
      !seeded &&
      !seedMutation.isPending
    ) {
      setSeeded(true);
      seedMutation.mutate();
    }
  }, [actor, courses, seeded, seedMutation]);

  const categoryMap = new Map(
    (categories || []).map((c) => [c.id.toString(), c]),
  );

  const baseCoursesRaw = debouncedQuery
    ? searchResults || []
    : selectedCategory !== "all"
      ? (courses || []).filter(
          (c) => c.categoryId.toString() === selectedCategory,
        )
      : courses || [];

  const displayedCourses =
    formatFilter !== "all"
      ? baseCoursesRaw.filter((c) =>
          (materials || []).some(
            (m) =>
              m.courseId.toString() === c.id.toString() &&
              m.materialType.toLowerCase().includes(formatFilter),
          ),
        )
      : baseCoursesRaw;

  const recentMaterials = [...(materials || [])]
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className="relative min-h-[520px] flex items-center bg-navy overflow-hidden"
        style={{
          backgroundImage:
            "url(/assets/generated/hero-banner.dim_1600x600.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-navy/70" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Share, Discover, and
              <br />
              <span className="text-blue-300">Master Knowledge.</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              CloudLearn brings instructors and students together — upload
              course materials, browse by category, and learn at your own pace.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2"
                onClick={() =>
                  document
                    .getElementById("courses-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                data-ocid="home.primary_button"
              >
                <BookOpen className="w-4 h-4" />
                Browse Courses
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full text-white border-white/50 bg-white/10 hover:bg-white/20 hover:text-white gap-2"
                onClick={() => navigate({ name: "admin" })}
                data-ocid="home.secondary_button"
              >
                <Upload className="w-4 h-4" />
                Upload Materials
              </Button>
            </div>
            <div className="flex gap-6 mt-8">
              {[
                { icon: BookOpen, label: "500+ Courses" },
                { icon: Users, label: "10K+ Students" },
                { icon: Star, label: "4.8 Rating" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-white/70 text-sm"
                >
                  <Icon className="w-4 h-4 text-blue-300" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="sticky top-16 z-40 bg-white border-b border-border shadow-xs">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses, materials, subjects…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full border-border"
                data-ocid="home.search_input"
              />
            </div>
            <div className="flex gap-2">
              <Select value={formatFilter} onValueChange={setFormatFilter}>
                <SelectTrigger
                  className="w-36 rounded-full"
                  data-ocid="home.select"
                >
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="slide">Slides</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all ${selectedCategory === "all" ? "bg-primary text-white border-primary" : "bg-muted border-border text-muted-foreground hover:border-primary/40"}`}
              data-ocid="home.tab"
            >
              All Categories
            </button>
            {(categories || []).map((cat) => (
              <button
                type="button"
                key={cat.id.toString()}
                onClick={() => setSelectedCategory(cat.id.toString())}
                className={`flex-shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all ${selectedCategory === cat.id.toString() ? "bg-primary text-white border-primary" : "bg-muted border-border text-muted-foreground hover:border-primary/40"}`}
                data-ocid="home.tab"
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <section id="courses-section" className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Featured Courses
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {displayedCourses.length} course
              {displayedCourses.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary gap-1 text-sm"
            onClick={() =>
              document
                .getElementById("courses-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            data-ocid="home.secondary_button"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {coursesLoading || seedMutation.isPending ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            data-ocid="courses.loading_state"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-8 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedCourses.length === 0 ? (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="courses.empty_state"
          >
            <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No courses found</p>
            <p className="text-sm mt-1">
              Try adjusting your search or category filter
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06 } },
            }}
          >
            {displayedCourses.map((course, i) => (
              <motion.div
                key={course.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                }}
              >
                <CourseCard
                  course={course}
                  category={categoryMap.get(course.categoryId.toString())}
                  index={i}
                  navigate={navigate}
                  ocid={`courses.item.${i + 1}`}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* How CloudLearn Works */}
      <section className="bg-white border-y border-border py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground">
              How CloudLearn Works
            </h2>
            <p className="text-muted-foreground mt-2">
              Three simple steps to start sharing and learning
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "Upload",
                desc: "Instructors upload course materials — documents, slides, videos, and links — organized by category.",
              },
              {
                icon: Search,
                title: "Discover",
                desc: "Students browse and search through a rich library of course materials filtered by subject and level.",
              },
              {
                icon: Share2,
                title: "Share",
                desc: "Share knowledge across your institution or the world. Collaborate, learn, and grow together.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Uploads */}
      <section id="materials-section" className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Recent Uploads
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Latest materials added to the platform
            </p>
          </div>
        </div>
        {recentMaterials.length === 0 ? (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="materials.empty_state"
          >
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No materials uploaded yet</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">
                    Course
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentMaterials.map((material, i) => {
                  const Icon =
                    MATERIAL_TYPE_ICONS[material.materialType.toLowerCase()] ||
                    FileText;
                  const course = (courses || []).find(
                    (c) => c.id === material.courseId,
                  );
                  return (
                    <tr
                      key={material.id.toString()}
                      className="hover:bg-muted/30 transition-colors"
                      data-ocid={`materials.item.${i + 1}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="capitalize text-xs text-muted-foreground">
                            {material.materialType}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground max-w-xs truncate">
                        {material.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {course ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate({ name: "course", id: course.id })
                            }
                            className="hover:text-primary transition-colors truncate max-w-[180px] block"
                            data-ocid="materials.link"
                          >
                            {course.title}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell">
                        {new Date(
                          Number(material.createdAt / BigInt(1_000_000)),
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
