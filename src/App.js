/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

// Firebase
import {
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  serverTimestamp,
  Timestamp as FirestoreTimestamp,
} from "firebase/firestore";
import {
  auth,
  db,
  currentAppId,
  googleProvider,
  signInWithPopup,
  signOut,
} from "./config/firebaseConfig";

import { Plus } from "lucide-react";

import Confetti from "./components/Confetti";
import { AddTaskForm, Column, TaskDetailModal } from "./components/Kanban";
import { Header } from "./components/Layout";
import ConfirmationModal from "./components/common/ConfirmationModal";

import {
  isDeadlineUrgent,
  parseDateStringToTimestamp,
} from "./utils/dateUtils";
import { KANBAN_COLUMNS } from "./utils/constants";

// --- Main App Component ---
function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Tracks if onAuthStateChanged has run once
  const [authError, setAuthError] = useState(null);
  const [dbError, setDbError] = useState(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [taskToConfirmDeleteId, setTaskToConfirmDeleteId] = useState(null);
  // For TaskDetailModal (View/Edit)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState(null);
  const [detailModalEditMode, setDetailModalEditMode] = useState(false);

  // Firebase auth listener
  useEffect(() => {
    if (!auth) {
      setAuthError("Firebase Auth not initialized.");
      setIsAuthReady(true);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        setCurrentUser(user);
        console.log("User is signed in:", user.uid);
        setAuthError(null); // Clear auth error on successful sign-in
      } else {
        setCurrentUserId(null);
        setCurrentUser(null);
        console.log("User is signed out.");
        setTasks([]); // Clear tasks when user signs out
      }
      if (!isAuthReady) setIsAuthReady(true); // Mark auth as ready after first check
      setIsLoading(false); // Also set loading to false here after auth state is known
    });

    return () => unsubscribeAuth();
  }, [isAuthReady]); // isAuthReady dependency ensures this runs once auth is ready.

  // Firestore listener for tasks (runs when currentUserId changes)
  useEffect(() => {
    if (!currentUserId || !db) {
      if (currentUserId) setDbError("Firestore DB not available."); // Only set DB error if user is logged in but DB fails
      setTasks([]); // Clear tasks if no user or no DB
      return;
    }

    console.log(
      `Setting up Firestore listener for user: ${currentUserId} and app: ${currentAppId}`
    );
    setIsLoading(true); // Set loading true when starting to fetch tasks for a new user
    const tasksCollectionPath = `artifacts/${currentAppId}/users/${currentUserId}/tasks`;
    const q = query(collection(db, tasksCollectionPath));

    const unsubscribeFirestore = onSnapshot(
      q,
      (querySnapshot) => {
        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        tasksData.sort((a, b) => {
          const timeA = a.createdAt?.seconds
            ? a.createdAt.seconds
            : a.createdAt || 0;
          const timeB = b.createdAt?.seconds
            ? b.createdAt.seconds
            : b.createdAt || 0;
          return timeA - timeB;
        });
        setTasks(tasksData);
        setIsLoading(false);
        setDbError(null);
      },
      (firestoreError) => {
        console.error(
          `Error fetching tasks for user ${currentUserId}:`,
          firestoreError
        );
        setDbError("Could not load tasks. " + firestoreError.message);
        setIsLoading(false);
      }
    );

    return () => {
      console.log(`Cleaning up Firestore listener for user: ${currentUserId}`);
      unsubscribeFirestore();
    };
  }, [currentUserId]); // Re-run when currentUserId changes

  const handleSignInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      setAuthError(
        "Firebase Auth or Google Provider not available for sign-in."
      );
      return;
    }
    setAuthError(null); // Clear previous errors
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setting the user
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      // @ts-ignore
      setAuthError(`Google Sign-In Failed: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    if (!auth) {
      setAuthError("Firebase Auth not available for sign-out.");
      return;
    }
    try {
      await signOut(auth);
      // onAuthStateChanged will set currentUserId to null and clear tasks
    } catch (error) {
      console.error("Error signing out: ", error);
      // @ts-ignore
      setAuthError(`Sign-Out Failed: ${error.message}`);
    }
  };

  // Firestore listener for tasks
  useEffect(() => {
    if (!isAuthReady || !currentUserId || !db) {
      if (isAuthReady && !currentUserId) setIsLoading(false); // Not logged in, no tasks to load
      return;
    }

    setIsLoading(true);
    const tasksCollectionPath = `artifacts/${currentAppId}/users/${currentUserId}/tasks`;
    const q = query(collection(db, tasksCollectionPath));

    const unsubscribeFirestore = onSnapshot(
      q,
      (querySnapshot) => {
        const tasksData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Sort tasks by creation date (oldest first) or a specific order if needed
        tasksData.sort(
          (a, b) => (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0)
        );
        setTasks(tasksData);
        setIsLoading(false);
        setDbError(null);
      },
      (firestoreError) => {
        console.error("Error fetching tasks:", firestoreError);
        setDbError(
          "Could not load tasks. There might be a connection issue or permission problem."
        );
        setIsLoading(false);
      }
    );

    return () => unsubscribeFirestore();
  }, [isAuthReady, currentUserId]);

  const handleAddTask = async (taskData) => {
    if (!currentUser || !db) {
      setDbError("Cannot add task...");
      return false;
    }
    const {
      title,
      description,
      deadline: deadlineString,
      isImportant,
      isUrgent,
      checklist,
    } = taskData;
    let deadlineTimestamp = null;
    let calculatedIsUrgentBasedOnDeadline = false;
    if (deadlineString) {
      try {
        deadlineTimestamp = parseDateStringToTimestamp(deadlineString);
        if (deadlineTimestamp)
          calculatedIsUrgentBasedOnDeadline =
            isDeadlineUrgent(deadlineTimestamp);
        else if (deadlineString) throw new Error("Parsed deadline is null");
      } catch (e) {
        console.error("Invalid date format for deadline:", deadlineString, e);
        setDbError("Invalid deadline date provided.");
        return false;
      }
    }
    const finalIsUrgent = isUrgent;
    const finalHasManuallySetUrgency =
      (deadlineTimestamp &&
        finalIsUrgent !== calculatedIsUrgentBasedOnDeadline) ||
      (!deadlineTimestamp && finalIsUrgent);
    const tasksCollectionPath = `artifacts/${currentAppId}/users/${currentUser.uid}/tasks`;
    setDbError(null);
    try {
      await addDoc(collection(db, tasksCollectionPath), {
        title,
        description: description || "",
        status: KANBAN_COLUMNS[0],
        createdAt: serverTimestamp(),
        authorId: currentUser.uid,
        deadline: deadlineTimestamp,
        isImportant: isImportant || false,
        isUrgent: finalIsUrgent,
        hasManuallySetUrgency: finalHasManuallySetUrgency,
        assigneeIds: [currentUser.uid],
        checklist: Array.isArray(checklist) ? checklist : [],
      });
      setIsAddTaskModalOpen(false);
      return true;
    } catch (e) {
      console.error("Error adding task: ", e);
      setDbError("Failed to add task.");
      return false;
    }
  };

  const handleUpdateTask = async (taskId, clientUpdatedData) => {
    if (!currentUser || !db) {
      setDbError("Cannot update task...");
      return false;
    }
    const firestoreUpdateData = { ...clientUpdatedData };
    let newDeadlineForStateAndFirestore =
      selectedTaskForDetail?.deadline || null;
    if ("deadline" in clientUpdatedData) {
      if (
        clientUpdatedData.deadline &&
        typeof clientUpdatedData.deadline === "string"
      ) {
        try {
          const parsedTs = parseDateStringToTimestamp(
            clientUpdatedData.deadline
          );
          if (parsedTs === null && clientUpdatedData.deadline !== "")
            throw new Error("Parsed deadline is null");
          newDeadlineForStateAndFirestore = parsedTs;
          firestoreUpdateData.deadline = newDeadlineForStateAndFirestore;
        } catch (e) {
          console.error(
            "Invalid date for deadline update:",
            clientUpdatedData.deadline,
            e
          );
          setDbError("Invalid deadline date.");
          return false;
        }
      } else if (
        clientUpdatedData.deadline === "" ||
        clientUpdatedData.deadline === null
      ) {
        firestoreUpdateData.deadline = null;
        newDeadlineForStateAndFirestore = null;
      }
    }
    const taskDocRef = doc(
      db,
      `artifacts/${currentAppId}/users/${currentUser.uid}/tasks`,
      taskId
    );
    setDbError(null);
    try {
      await setDoc(taskDocRef, firestoreUpdateData, { merge: true });
      if (selectedTaskForDetail && selectedTaskForDetail.id === taskId) {
        setSelectedTaskForDetail((prevTask) => ({
          ...prevTask,
          ...clientUpdatedData,
          deadline: newDeadlineForStateAndFirestore,
        }));
      }
      return true;
    } catch (e) {
      console.error("Error updating task: ", e);
      setDbError("Failed to update task.");
      return false;
    }
  };

  const executeDeleteTask = async () => {
    if (!currentUser || !db || !taskToConfirmDeleteId) {
      setDbError("Cannot delete task: Missing information.");
      setIsConfirmModalOpen(false);
      setTaskToConfirmDeleteId(null);
      return;
    }
    const taskDocRef = doc(
      db,
      `artifacts/${currentAppId}/users/${currentUser.uid}/tasks`,
      taskToConfirmDeleteId
    );
    setDbError(null);
    try {
      await deleteDoc(taskDocRef);
    } catch (e) {
      console.error("Error deleting task: ", e);
      setDbError("Failed to delete task.");
    } finally {
      setIsConfirmModalOpen(false);
      setTaskToConfirmDeleteId(null);
    }
  };

  const requestDeleteConfirmation = (taskId) => {
    setTaskToConfirmDeleteId(taskId);
    setIsConfirmModalOpen(true);
  };

  const openViewTaskModal = (task) => {
    setSelectedTaskForDetail(task);
    setDetailModalEditMode(false);
    setIsDetailModalOpen(true);
  };
  const openEditTaskModal = (task) => {
    setSelectedTaskForDetail(task);
    setDetailModalEditMode(true);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTaskForDetail(null);
    setDetailModalEditMode(false);
  };

  const handleConfettiEnd = () => {
    setShowConfetti(false);
  };

  if (!isAuthReady) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-lg font-semibold text-gray-700">
          Initializing Application...
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="p-4 m-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <h3 className="font-bold">Application Error</h3>
        <p>{dbError}</p>
        <p>
          Please ensure you have a stable internet connection and try refreshing
          the page. If the problem persists, contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spearmint-100 to-misty-blue-100 p-4 md:p-6 relative font-sans">
      {showConfetti && <Confetti onAnimationEnd={handleConfettiEnd} />}

      <Header user={currentUser} handleSignOut={handleSignOut} />

      {authError && (
        <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
          <p>{authError}</p>
        </div>
      )}
      {dbError && (
        <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
          <p>{dbError}</p>
        </div>
      )}

      {!currentUserId ? (
        <div className="flex flex-col items-center justify-center p-10">
          <p className="text-lg text-gray-600 mb-6">
            Please sign in to manage your tasks.
          </p>
          <button
            onClick={handleSignInWithGoogle}
            className="bg-misty-blue-500 hover:bg-misty-blue-600 text-olive-green-900 font-bold py-3 px-6 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out"
          >
            {/* You can add a Google icon here */}
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
            >
              <path d="M22.56,12.25C22.56,11.47 22.49,10.72 22.36,10H12V14.26H17.94C17.66,15.89 16.75,17.29 15.31,18.25V21.09H19.16C21.33,19.13 22.56,15.97 22.56,12.25Z" />
              <path d="M12,23C14.97,23 17.45,22.04 19.16,20.45L15.31,17.61C14.36,18.25 13.25,18.67 12,18.67C9.53,18.67 7.4,17.09 6.56,14.84H2.58V17.69C4.3,20.92 7.86,23 12,23Z" />
              <path d="M6.56,13.71C6.38,13.18 6.27,12.59 6.27,12C6.27,11.41 6.38,10.82 6.56,10.29V7.44H2.58C1.74,8.96 1.25,10.43 1.25,12C1.25,13.57 1.74,15.04 2.58,16.56L6.56,13.71Z" />
              <path d="M12,5.33C13.57,5.33 15.04,5.89 16.16,6.97L19.25,3.88C17.45,2.22 14.97,1.25 12,1.25C7.86,1.25 4.3,3.58 2.58,6.75L6.56,9.5C7.4,7.16 9.53,5.33 12,5.33Z" />
            </svg>
            Sign in with Google
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-center md:justify-start">
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="bg-misty-blue-500 hover:bg-misty-blue-600 text-olive-green-950 py-2.5 px-5 rounded-lg shadow-md transition duration-150 flex items-center font-medium"
            >
              <Plus size={20} className="mr-2" /> Add New Task
            </button>
          </div>

          <AddTaskForm
            onAddTask={handleAddTask}
            isModalOpen={isAddTaskModalOpen}
            setIsModalOpen={setIsAddTaskModalOpen}
          />

          <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => {
              setIsConfirmModalOpen(false);
              setTaskToConfirmDeleteId(null);
            }}
            onConfirm={executeDeleteTask}
            title="Confirm Delete Task"
            message={`Are you sure you want to delete this task? This action cannot be undone.`}
            confirmText="Delete"
            confirmButtonColor="bg-red-600 hover:bg-red-700"
          />

          {isDetailModalOpen && selectedTaskForDetail && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-xl">
                {isDetailModalOpen && selectedTaskForDetail && (
                  <TaskDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={closeDetailModal}
                    task={selectedTaskForDetail}
                    onSave={handleUpdateTask} // Your existing function, ensure it handles new fields
                    onDeleteRequest={requestDeleteConfirmation} // Your existing function
                    initialEditMode={detailModalEditMode}
                  />
                )}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-misty-blue-500"></div>
              <p className="ml-3 text-olive-green-600">Loading tasks...</p>
            </div>
          )}
          {!isLoading && !tasks.length && (
            <div className="text-center text-olive-green-600 py-10">
              <p className="text-xl">No tasks yet!</p>
              <p>Click &#34;Add New Task&#34; to get started.</p>
            </div>
          )}
          {!isLoading && tasks.length > 0 && (
            <div className="flex flex-col md:grid md:grid-cols-4 md:gap-6 pb-4">
              {KANBAN_COLUMNS.map((columnName) => (
                <Column
                  key={columnName}
                  title={columnName}
                  tasks={tasks.filter((task) => task.status === columnName)}
                  onViewTask={openViewTaskModal}
                  onEditRequest={openEditTaskModal}
                  onDeleteRequest={requestDeleteConfirmation}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
