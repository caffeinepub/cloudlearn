import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  Course,
  CreateCourseRequest,
  CreateMaterialRequest,
  Material,
} from "../backend";
import { useActor } from "./useActor";

export function useAllCourses() {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCourses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllMaterials() {
  const { actor, isFetching } = useActor();
  return useQuery<Material[]>({
    queryKey: ["materials"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMaterials();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMaterialsForCourse(courseId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Material[]>({
    queryKey: ["materials", "course", courseId?.toString()],
    queryFn: async () => {
      if (!actor || courseId === null) return [];
      return actor.getMaterialsForCourse(courseId);
    },
    enabled: !!actor && !isFetching && courseId !== null,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateCourseRequest) => actor!.createCourse(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useUpdateCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: bigint; req: CreateCourseRequest }) =>
      actor!.updateCourse(id, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useDeleteCourse() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }),
  });
}

export function useAddMaterial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateMaterialRequest) => actor!.addMaterial(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useUpdateMaterial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: bigint; req: CreateMaterialRequest }) =>
      actor!.updateMaterial(id, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials"] }),
  });
}

export function useDeleteMaterial() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteMaterial(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials"] }),
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      description,
    }: { name: string; description: string }) =>
      actor!.createCategory(name, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      name,
      description,
    }: { id: bigint; name: string; description: string }) =>
      actor!.updateCategory(id, name, description),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => actor!.seedSampleData(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}

export function useSearchCourses(keyword: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Course[]>({
    queryKey: ["courses", "search", keyword],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchCoursesByTitle(keyword);
    },
    enabled: !!actor && !isFetching && keyword.length > 0,
  });
}
