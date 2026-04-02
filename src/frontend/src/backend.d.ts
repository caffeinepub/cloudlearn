import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Material {
    id: bigint;
    url?: string;
    title: string;
    blob?: ExternalBlob;
    createdAt: bigint;
    courseId: bigint;
    materialType: string;
}
export interface CreateMaterialRequest {
    url?: string;
    title: string;
    blob?: ExternalBlob;
    courseId: bigint;
    materialType: string;
}
export type Instructor = Principal;
export interface CreateCourseRequest {
    categoryId: bigint;
    title: string;
    thumbnail: string;
    description: string;
}
export interface Course {
    id: bigint;
    categoryId: bigint;
    title: string;
    thumbnail: string;
    createdAt: bigint;
    description: string;
    instructorId: Instructor;
}
export interface Category {
    id: bigint;
    name: string;
    description: string;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMaterial(materialReq: CreateMaterialRequest): Promise<Material>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string, description: string): Promise<Category>;
    createCourse(courseReq: CreateCourseRequest): Promise<Course>;
    deleteCategory(id: bigint): Promise<void>;
    deleteCourse(id: bigint): Promise<void>;
    deleteMaterial(id: bigint): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllCourses(): Promise<Array<Course>>;
    getAllMaterials(): Promise<Array<Material>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoursesByCategory(categoryId: bigint): Promise<Array<Course>>;
    getCoursesByInstructor(instructorId: Principal): Promise<Array<Course>>;
    getMaterialsForCourse(courseId: bigint): Promise<Array<Material>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchCoursesByTitle(keyword: string): Promise<Array<Course>>;
    seedSampleData(): Promise<void>;
    updateCategory(id: bigint, name: string, description: string): Promise<void>;
    updateCourse(id: bigint, courseReq: CreateCourseRequest): Promise<void>;
    updateMaterial(id: bigint, materialReq: CreateMaterialRequest): Promise<void>;
}
