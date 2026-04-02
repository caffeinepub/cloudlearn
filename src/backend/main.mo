import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  // Data Types
  type Instructor = Principal;

  type Category = {
    id : Nat;
    name : Text;
    description : Text;
  };
  module Category {
    public func compare(category1 : Category, category2 : Category) : Order.Order {
      Nat.compare(category1.id, category2.id);
    };
  };

  type Course = {
    id : Nat;
    title : Text;
    description : Text;
    categoryId : Nat;
    instructorId : Instructor;
    createdAt : Int;
    thumbnail : Text;
  };
  module Course {
    public func compare(course1 : Course, course2 : Course) : Order.Order {
      Nat.compare(course1.id, course2.id);
    };
    public func compareByCategoryId(course1 : Course, course2 : Course) : Order.Order {
      Nat.compare(course1.categoryId, course2.categoryId);
    };
  };

  type Material = {
    id : Nat;
    courseId : Nat;
    title : Text;
    materialType : Text;
    blob : ?Storage.ExternalBlob;
    url : ?Text;
    createdAt : Int;
  };
  module Material {
    public func compare(material1 : Material, material2 : Material) : Order.Order {
      Nat.compare(material1.id, material2.id);
    };
    public func compareByCourseId(material1 : Material, material2 : Material) : Order.Order {
      Nat.compare(material1.courseId, material2.courseId);
    };
  };

  type CreateCourseRequest = {
    title : Text;
    description : Text;
    categoryId : Nat;
    thumbnail : Text;
  };

  type CreateMaterialRequest = {
    courseId : Nat;
    title : Text;
    materialType : Text;
    blob : ?Storage.ExternalBlob;
    url : ?Text;
  };

  public type UserProfile = {
    name : Text;
    role : Text; // "instructor" or "student"
  };

  // State
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let categories = Map.empty<Nat, Category>();
  let courses = Map.empty<Nat, Course>();
  let materials = Map.empty<Nat, Material>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextCategoryId = 1;
  var nextCourseId = 1;
  var nextMaterialId = 1;

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to check if user is instructor
  private func isInstructor(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.role == "instructor" };
    };
  };

  // Category Functions
  public shared ({ caller }) func createCategory(name : Text, description : Text) : async Category {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    let category : Category = {
      id = nextCategoryId;
      name;
      description;
    };
    categories.add(nextCategoryId, category);
    nextCategoryId += 1;
    category;
  };

  public query ({ caller }) func getAllCategories() : async [Category] {
    categories.values().toArray().sort();
  };

  public shared ({ caller }) func updateCategory(id : Nat, name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    if (not categories.containsKey(id)) { Runtime.trap("Category not found") };
    let updatedCategory : Category = {
      id;
      name;
      description;
    };
    categories.add(id, updatedCategory);
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    if (not categories.containsKey(id)) { Runtime.trap("Category not found") };
    categories.remove(id);
  };

  // Course Functions
  public shared ({ caller }) func createCourse(courseReq : CreateCourseRequest) : async Course {
    // Admin or instructor (user with instructor profile) can create courses
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isInstructorUser = AccessControl.hasPermission(accessControlState, caller, #user) and isInstructor(caller);
    if (not (isAdmin or isInstructorUser)) {
      Runtime.trap("Unauthorized: Only admins or instructors can create courses");
    };

    if (not categories.containsKey(courseReq.categoryId)) { Runtime.trap("Category does not exist") };
    let course : Course = {
      id = nextCourseId;
      title = courseReq.title;
      description = courseReq.description;
      categoryId = courseReq.categoryId;
      instructorId = caller;
      createdAt = Time.now();
      thumbnail = courseReq.thumbnail;
    };
    courses.add(nextCourseId, course);
    nextCourseId += 1;
    course;
  };

  public query ({ caller }) func getAllCourses() : async [Course] {
    courses.values().toArray().sort();
  };

  public query ({ caller }) func getCoursesByCategory(categoryId : Nat) : async [Course] {
    courses.values().toArray().filter(func(course) { course.categoryId == categoryId });
  };

  public query ({ caller }) func searchCoursesByTitle(keyword : Text) : async [Course] {
    courses.values().toArray().filter(
      func(course) {
        course.title.toLower().contains(#text(keyword.toLower()));
      }
    );
  };

  public query ({ caller }) func getCoursesByInstructor(instructorId : Principal) : async [Course] {
    courses.values().toArray().filter(func(course) { course.instructorId == instructorId });
  };

  public shared ({ caller }) func updateCourse(id : Nat, courseReq : CreateCourseRequest) : async () {
    let existingCourse = switch (courses.get(id)) {
      case (null) { Runtime.trap("Course not found") };
      case (?course) { course };
    };

    // Admin can update any course, instructor can only update their own
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isOwnerInstructor = (caller == existingCourse.instructorId) and 
                            AccessControl.hasPermission(accessControlState, caller, #user) and 
                            isInstructor(caller);
    if (not (isAdmin or isOwnerInstructor)) {
      Runtime.trap("Unauthorized: Only admins or course owner instructors can update courses");
    };

    if (not categories.containsKey(courseReq.categoryId)) { Runtime.trap("Category does not exist") };

    let updatedCourse : Course = {
      id;
      title = courseReq.title;
      description = courseReq.description;
      categoryId = courseReq.categoryId;
      instructorId = existingCourse.instructorId;
      createdAt = existingCourse.createdAt;
      thumbnail = courseReq.thumbnail;
    };

    courses.add(id, updatedCourse);
  };

  public shared ({ caller }) func deleteCourse(id : Nat) : async () {
    let existingCourse = switch (courses.get(id)) {
      case (null) { Runtime.trap("Course not found") };
      case (?course) { course };
    };

    // Admin can delete any course, instructor can only delete their own
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isOwnerInstructor = (caller == existingCourse.instructorId) and 
                            AccessControl.hasPermission(accessControlState, caller, #user) and 
                            isInstructor(caller);
    if (not (isAdmin or isOwnerInstructor)) {
      Runtime.trap("Unauthorized: Only admins or course owner instructors can delete courses");
    };

    courses.remove(id);
  };

  // Material Functions
  public shared ({ caller }) func addMaterial(materialReq : CreateMaterialRequest) : async Material {
    let course = switch (courses.get(materialReq.courseId)) {
      case (null) { Runtime.trap("Course does not exist") };
      case (?course) { course };
    };

    // Admin can add material to any course, instructor can only add to their own courses
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isOwnerInstructor = (caller == course.instructorId) and 
                            AccessControl.hasPermission(accessControlState, caller, #user) and 
                            isInstructor(caller);
    if (not (isAdmin or isOwnerInstructor)) {
      Runtime.trap("Unauthorized: Only admins or course owner instructors can add materials");
    };

    let material : Material = {
      id = nextMaterialId;
      courseId = materialReq.courseId;
      title = materialReq.title;
      materialType = materialReq.materialType;
      blob = materialReq.blob;
      url = materialReq.url;
      createdAt = Time.now();
    };
    materials.add(nextMaterialId, material);
    nextMaterialId += 1;
    material;
  };

  public query ({ caller }) func getMaterialsForCourse(courseId : Nat) : async [Material] {
    materials.values().toArray().filter(func(material) { material.courseId == courseId });
  };

  public query ({ caller }) func getAllMaterials() : async [Material] {
    materials.values().toArray().sort();
  };

  public shared ({ caller }) func updateMaterial(id : Nat, materialReq : CreateMaterialRequest) : async () {
    let existingMaterial = switch (materials.get(id)) {
      case (null) { Runtime.trap("Material not found") };
      case (?material) { material };
    };

    let course = switch (courses.get(existingMaterial.courseId)) {
      case (null) { Runtime.trap("Course does not exist") };
      case (?course) { course };
    };

    // Admin can update any material, instructor can only update materials for their own courses
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isOwnerInstructor = (caller == course.instructorId) and 
                            AccessControl.hasPermission(accessControlState, caller, #user) and 
                            isInstructor(caller);
    if (not (isAdmin or isOwnerInstructor)) {
      Runtime.trap("Unauthorized: Only admins or course owner instructors can update materials");
    };

    let updatedMaterial : Material = {
      id;
      courseId = materialReq.courseId;
      title = materialReq.title;
      materialType = materialReq.materialType;
      blob = materialReq.blob;
      url = materialReq.url;
      createdAt = existingMaterial.createdAt;
    };

    materials.add(id, updatedMaterial);
  };

  public shared ({ caller }) func deleteMaterial(id : Nat) : async () {
    let existingMaterial = switch (materials.get(id)) {
      case (null) { Runtime.trap("Material not found") };
      case (?material) { material };
    };

    let course = switch (courses.get(existingMaterial.courseId)) {
      case (null) { Runtime.trap("Course does not exist") };
      case (?course) { course };
    };

    // Admin can delete any material, instructor can only delete materials for their own courses
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isOwnerInstructor = (caller == course.instructorId) and 
                            AccessControl.hasPermission(accessControlState, caller, #user) and 
                            isInstructor(caller);
    if (not (isAdmin or isOwnerInstructor)) {
      Runtime.trap("Unauthorized: Only admins or course owner instructors can delete materials");
    };

    materials.remove(id);
  };

  // Role Assignment (already admin-guarded in access control)
  public shared ({ caller }) func assignRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  // Seeding Sample Data
  public shared ({ caller }) func seedSampleData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };

    // Set caller as instructor for seeding purposes
    userProfiles.add(caller, { name = "Admin Instructor"; role = "instructor" });

    // Seed categories
    let cloud = await createCategory("Cloud Computing", "Courses on cloud infrastructure and services");
    let data = await createCategory("Data Science", "Courses on data analysis and machine learning");
    let web = await createCategory("Web Development", "Courses on building web applications");

    // Seed courses
    let cloudCourse = await createCourse({
      title = "Intro to AWS";
      description = "Beginner course on AWS cloud services";
      categoryId = cloud.id;
      thumbnail = "aws.png";
    });

    let dataCourse = await createCourse({
      title = "Python for Data Science";
      description = "Learn data analysis using Python";
      categoryId = data.id;
      thumbnail = "python.png";
    });

    let webCourse = await createCourse({
      title = "JavaScript Essentials";
      description = "Learn modern JavaScript for web development";
      categoryId = web.id;
      thumbnail = "js.png";
    });

    let advancedCourse = await createCourse({
      title = "Advanced Machine Learning";
      description = "Deep dive into ML algorithms and neural networks";
      categoryId = data.id;
      thumbnail = "ml.png";
    });

    // Seed materials
    let _ = await addMaterial({
      courseId = cloudCourse.id;
      title = "AWS Concepts Slide";
      materialType = "slide";
      blob = null;
      url = ? "https://aws.slides";
    });
    let _ = await addMaterial({
      courseId = dataCourse.id;
      title = "Python Data Analysis Ebook";
      materialType = "document";
      blob = null;
      url = ? "https://python.ebook";
    });
    let _ = await addMaterial({
      courseId = webCourse.id;
      title = "JavaScript Tutorial Video";
      materialType = "video";
      blob = null;
      url = ? "https://js.video";
    });
    let _ = await addMaterial({
      courseId = advancedCourse.id;
      title = "Neural Networks Guide";
      materialType = "document";
      blob = null;
      url = ? "https://nn.guide";
    });
  };
};
