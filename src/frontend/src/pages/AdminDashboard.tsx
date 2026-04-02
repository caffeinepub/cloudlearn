import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  LayoutDashboard,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import type {
  Category,
  Course,
  CreateCourseRequest,
  CreateMaterialRequest,
  Material,
} from "../backend";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddMaterial,
  useAllCategories,
  useAllCourses,
  useAllMaterials,
  useCreateCategory,
  useCreateCourse,
  useDeleteCategory,
  useDeleteCourse,
  useDeleteMaterial,
  useUpdateCategory,
  useUpdateCourse,
  useUpdateMaterial,
} from "../hooks/useQueries";

type AdminTab = "courses" | "materials" | "categories";

interface AdminDashboardProps {
  navigate: (p: Page) => void;
}

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>("courses");
  const { identity } = useInternetIdentity();

  if (!identity || identity.getPrincipal().isAnonymous()) {
    return (
      <div
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="admin.error_state"
      >
        <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">
          Please log in to access the admin dashboard.
        </p>
        <Button
          onClick={() => navigate({ name: "home" })}
          className="rounded-full"
          data-ocid="admin.button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </div>
    );
  }

  const TABS: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "materials", label: "Materials", icon: FileText },
    { id: "categories", label: "Categories", icon: Tag },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-56 flex-shrink-0 bg-navy text-white flex flex-col">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-300" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setTab(id)}
              className={[
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                tab === id
                  ? "bg-primary text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white",
              ].join(" ")}
              data-ocid="admin.tab"
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate({ name: "home" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            data-ocid="admin.link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Site
          </button>
        </div>
      </aside>

      <div className="flex-1 p-6 overflow-auto">
        {tab === "courses" && <CoursesTab />}
        {tab === "materials" && <MaterialsTab />}
        {tab === "categories" && <CategoriesTab />}
      </div>
    </div>
  );
}

const SKELETON_KEYS_5 = ["s1", "s2", "s3", "s4", "s5"];
const SKELETON_KEYS_4 = ["s1", "s2", "s3", "s4"];

function CoursesTab() {
  const { data: courses, isLoading } = useAllCourses();
  const { data: categories } = useAllCategories();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    thumbnail: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<Course | null>(null);

  const catMap = new Map(
    (categories || []).map((c) => [c.id.toString(), c.name]),
  );

  const openAdd = () => {
    setEditCourse(null);
    setForm({ title: "", description: "", categoryId: "", thumbnail: "" });
    setDialogOpen(true);
  };
  const openEdit = (c: Course) => {
    setEditCourse(c);
    setForm({
      title: c.title,
      description: c.description,
      categoryId: c.categoryId.toString(),
      thumbnail: c.thumbnail,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }
    const req: CreateCourseRequest = {
      title: form.title,
      description: form.description,
      categoryId: BigInt(form.categoryId),
      thumbnail: form.thumbnail,
    };
    try {
      if (editCourse) {
        await updateCourse.mutateAsync({ id: editCourse.id, req });
        toast.success("Course updated");
      } else {
        await createCourse.mutateAsync(req);
        toast.success("Course created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save course");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCourse.mutateAsync(deleteConfirm.id);
      toast.success("Course deleted");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Courses</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(courses || []).length} total
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-white"
          data-ocid="admin.primary_button"
        >
          <Plus className="w-4 h-4" /> Add Course
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.loading_state">
          {SKELETON_KEYS_5.map((k) => (
            <Skeleton key={k} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">
                  Description
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(courses || []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-10"
                    data-ocid="admin.empty_state"
                  >
                    No courses yet. Add your first course!
                  </TableCell>
                </TableRow>
              ) : (
                (courses || []).map((course, i) => (
                  <TableRow
                    key={course.id.toString()}
                    data-ocid={`admin.item.${i + 1}`}
                  >
                    <TableCell className="font-medium">
                      {course.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {catMap.get(course.categoryId.toString()) || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-xs truncate">
                      {course.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(course)}
                          className="h-8 w-8 p-0"
                          data-ocid="admin.edit_button"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(course)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          data-ocid="admin.delete_button"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editCourse ? "Edit Course" : "Add Course"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="course-title">Title *</Label>
              <Input
                id="course-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Introduction to Cloud Computing"
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-desc">Description *</Label>
              <Textarea
                id="course-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Course overview…"
                rows={3}
                data-ocid="admin.textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger data-ocid="admin.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories || []).map((cat) => (
                    <SelectItem
                      key={cat.id.toString()}
                      value={cat.id.toString()}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-thumbnail">Thumbnail URL</Label>
              <Input
                id="course-thumbnail"
                value={form.thumbnail}
                onChange={(e) =>
                  setForm((f) => ({ ...f, thumbnail: e.target.value }))
                }
                placeholder="https://…"
                data-ocid="admin.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-full"
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCourse.isPending || updateCourse.isPending}
              className="rounded-full bg-primary hover:bg-primary/90 text-white"
              data-ocid="admin.submit_button"
            >
              {(createCourse.isPending || updateCourse.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editCourse ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete{" "}
            <strong>{deleteConfirm?.title}</strong>? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="rounded-full"
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCourse.isPending}
              className="rounded-full"
              data-ocid="admin.confirm_button"
            >
              {deleteCourse.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MaterialsTab() {
  const { data: materials, isLoading } = useAllMaterials();
  const { data: courses } = useAllCourses();
  const addMaterial = useAddMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState({
    title: "",
    courseId: "",
    materialType: "document",
    url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<Material | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const courseMap = new Map(
    (courses || []).map((c) => [c.id.toString(), c.title]),
  );
  const isLinkType = form.materialType === "link";

  const openAdd = () => {
    setEditMaterial(null);
    setForm({ title: "", courseId: "", materialType: "document", url: "" });
    setFile(null);
    setUploadProgress(0);
    setDialogOpen(true);
  };
  const openEdit = (m: Material) => {
    setEditMaterial(m);
    setForm({
      title: m.title,
      courseId: m.courseId.toString(),
      materialType: m.materialType,
      url: m.url || "",
    });
    setFile(null);
    setUploadProgress(0);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.courseId) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (isLinkType && !form.url) {
      toast.error("Please provide a URL");
      return;
    }
    if (!isLinkType && !file && !editMaterial) {
      toast.error("Please select a file");
      return;
    }

    try {
      let req: CreateMaterialRequest = {
        title: form.title,
        courseId: BigInt(form.courseId),
        materialType: form.materialType,
      };
      if (isLinkType) {
        req.url = form.url;
      } else if (file) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        let blob = ExternalBlob.fromBytes(bytes);
        blob = blob.withUploadProgress((pct) =>
          setUploadProgress(Math.round(pct)),
        );
        req.blob = blob;
      } else if (editMaterial?.blob) {
        req.blob = editMaterial.blob;
      } else if (editMaterial?.url) {
        req.url = editMaterial.url;
      }

      if (editMaterial) {
        await updateMaterial.mutateAsync({ id: editMaterial.id, req });
        toast.success("Material updated");
      } else {
        await addMaterial.mutateAsync(req);
        toast.success("Material added");
      }
      setDialogOpen(false);
      setFile(null);
      setUploadProgress(0);
    } catch {
      toast.error("Failed to save material");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMaterial.mutateAsync(deleteConfirm.id);
      toast.success("Material deleted");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete material");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Materials</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(materials || []).length} total
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-white"
          data-ocid="admin.primary_button"
        >
          <Plus className="w-4 h-4" /> Add Material
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.loading_state">
          {SKELETON_KEYS_5.map((k) => (
            <Skeleton key={k} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden md:table-cell">Course</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(materials || []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-10"
                    data-ocid="admin.empty_state"
                  >
                    No materials yet.
                  </TableCell>
                </TableRow>
              ) : (
                (materials || []).map((m, i) => (
                  <TableRow
                    key={m.id.toString()}
                    data-ocid={`admin.item.${i + 1}`}
                  >
                    <TableCell className="font-medium">{m.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {m.materialType}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {courseMap.get(m.courseId.toString()) || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(m)}
                          className="h-8 w-8 p-0"
                          data-ocid="admin.edit_button"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(m)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          data-ocid="admin.delete_button"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editMaterial ? "Edit Material" : "Add Material"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Course *</Label>
              <Select
                value={form.courseId}
                onValueChange={(v) => setForm((f) => ({ ...f, courseId: v }))}
              >
                <SelectTrigger data-ocid="admin.select">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {(courses || []).map((c) => (
                    <SelectItem key={c.id.toString()} value={c.id.toString()}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mat-title">Title *</Label>
              <Input
                id="mat-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Week 1 Lecture Slides"
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select
                value={form.materialType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, materialType: v }))
                }
              >
                <SelectTrigger data-ocid="admin.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isLinkType ? (
              <div className="space-y-1.5">
                <Label htmlFor="mat-url">URL *</Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="mat-url"
                    value={form.url}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, url: e.target.value }))
                    }
                    placeholder="https://…"
                    className="pl-9"
                    data-ocid="admin.input"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>File {!editMaterial ? "*" : "(optional)"}</Label>
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) =>
                    e.key === "Enter" && fileInputRef.current?.click()
                  }
                  data-ocid="admin.dropzone"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {file
                      ? file.name
                      : editMaterial
                        ? "Click to replace file (optional)"
                        : "Click to upload file"}
                  </p>
                  {file && (
                    <p className="text-xs text-primary mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  data-ocid="admin.upload_button"
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-full"
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addMaterial.isPending || updateMaterial.isPending}
              className="rounded-full bg-primary hover:bg-primary/90 text-white"
              data-ocid="admin.submit_button"
            >
              {(addMaterial.isPending || updateMaterial.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editMaterial ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete{" "}
            <strong>{deleteConfirm?.title}</strong>?
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="rounded-full"
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMaterial.isPending}
              className="rounded-full"
              data-ocid="admin.confirm_button"
            >
              {deleteMaterial.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoriesTab() {
  const { data: categories, isLoading } = useAllCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

  const openAdd = () => {
    setEditCat(null);
    setForm({ name: "", description: "" });
    setDialogOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditCat(c);
    setForm({ name: c.name, description: c.description });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Category name is required");
      return;
    }
    try {
      if (editCat) {
        await updateCategory.mutateAsync({
          id: editCat.id,
          name: form.name,
          description: form.description,
        });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync({
          name: form.name,
          description: form.description,
        });
        toast.success("Category created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCategory.mutateAsync(deleteConfirm.id);
      toast.success("Category deleted");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Categories</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(categories || []).length} total
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-white"
          data-ocid="admin.primary_button"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.loading_state">
          {SKELETON_KEYS_4.map((k) => (
            <Skeleton key={k} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(categories || []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-10"
                    data-ocid="admin.empty_state"
                  >
                    No categories yet.
                  </TableCell>
                </TableRow>
              ) : (
                (categories || []).map((cat, i) => (
                  <TableRow
                    key={cat.id.toString()}
                    data-ocid={`admin.item.${i + 1}`}
                  >
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                      {cat.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(cat)}
                          className="h-8 w-8 p-0"
                          data-ocid="admin.edit_button"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(cat)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          data-ocid="admin.delete_button"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>
              {editCat ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Cloud Architecture"
                data-ocid="admin.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Brief description…"
                rows={3}
                data-ocid="admin.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="rounded-full"
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCategory.isPending || updateCategory.isPending}
              className="rounded-full bg-primary hover:bg-primary/90 text-white"
              data-ocid="admin.submit_button"
            >
              {(createCategory.isPending || updateCategory.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editCat ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Delete <strong>{deleteConfirm?.name}</strong>? Courses in this
            category will be unaffected.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="rounded-full"
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
              className="rounded-full"
              data-ocid="admin.confirm_button"
            >
              {deleteCategory.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
