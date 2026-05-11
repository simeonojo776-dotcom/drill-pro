import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, where, addDoc, writeBatch, doc, updateDoc, limit, onSnapshot, increment, setDoc, orderBy, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase'; 
import { X, Timer, Zap, BookOpen, RefreshCcw, ArrowLeft, Flag, Calculator, Trash2, Trophy, User, ShieldAlert, Settings, Camera, Share2, Users, PenTool } from 'lucide-react';
import PremiumModal from './PremiumModal'; 
import Image from 'next/image';
import CommunityForge from './CommunityForge';
import CbtSimulator from './CbtSimulator';
import ExamSetup from './ExamSetup';
import CommandCenter from './CommandCenter';
import AdminDashboard from './AdminDashboard';
import SharedArena from './SharedArena';
import RapidFire from './RapidFire';
import UserProfile from './UserProfile';
import Leaderboard from './Leaderboard';
import NotificationCenter from './NotificationCenter';

const ExamMode = ({ closeExamMode, themeColor, savedFlashcards, savedCbtExam, user }) => {
  const [activeModule, setActiveModule] = useState('hub'); 
  const [isPremium, setIsPremium] = useState(true); 
  const [questionCount, setQuestionCount] = useState(20); 
  const [ghostNotification, setGhostNotification] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set()); 
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false); 
  const [calcDisplay, setCalcDisplay] = useState(''); 
  const [dailyUsage, setDailyUsage] = useState({ count: 0, date: '' });

  const [subjectHierarchy, setSubjectHierarchy] = useState({}); 
  const [selectedSubTopics, setSelectedSubTopics] = useState([]); 
  const [expandedFolder, setExpandedFolder] = useState(null); 
  
  const [activeExamQuestions, setActiveExamQuestions] = useState([]);
  const [examDuration, setExamDuration] = useState(600); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false); 

  // 👉 NEW: EXAM BEHAVIOR & FILTER STATES
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [questionSource, setQuestionSource] = useState("all"); 
  const [strictMode, setStrictMode] = useState(true);
  const [instantFeedback, setInstantFeedback] = useState(false);

  // --- LIVE STATS & TIMETABLE STATE ---
  const [liveStats, setLiveStats] = useState({
    totalExams: 0,
    totalQuestions: 0,
    totalPassed: 0,
    totalFailed: 0,
    averageScore: 0,
    bestSubject: { name: 'N/A', accuracy: 0 },
    worstSubject: { name: 'N/A', accuracy: 0 },
    weakestTopics: []
  });
  
  const [examSchedule, setExamSchedule] = useState([]);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamSubject, setNewExamSubject] = useState('GENERAL');

  // --- IDENTITY & PROFILE STATE ---
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [activityHistory, setActivityHistory] = useState([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- RAPID FIRE (FLASHCARD) STATE ---
  const [userFlashcards, setUserFlashcards] = useState([]);
  const [flashcardFilter, setFlashcardFilter] = useState('ALL');
  const [currentCardIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- LEADERBOARD STATE ---
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // --- SHARED ARENA STATE ---
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // --- ADMIN & FORGE STATE ---
  const [adminTab, setAdminTab] = useState('database'); 
  const [allAppUsers, setAllAppUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [isFetchingPending, setIsFetchingPending] = useState(false);

  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [liveQuestions, setLiveQuestions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFetchingExam, setIsFetchingExam] = useState(false);

  // --- USER FORGE SUBMISSION STATE ---
  const [isSubmittingForge, setIsSubmittingForge] = useState(false);
  const [forgeData, setForgeData] = useState({
    q: '', optA: '', optB: '', optC: '', optD: '', answer: '', subject: 'GENERAL'
  });
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const generateAiQuestion = async () => {
    setIsAiGenerating(true);
    try {
      setTimeout(() => {
        setForgeData({
          ...forgeData,
          q: "What is the primary function of mitochondria in eukaryotic cells?",
          optA: "Cellular Respiration (ATP Production)", optB: "Protein Synthesis", optC: "Photosynthesis", optD: "DNA Replication",
          answer: "Cellular Respiration (ATP Production)",
          subject: "BIOLOGY"
        });
        setIsAiGenerating(false);
      }, 1500);
    } catch (e) {
      alert("AI Engine offline.");
      setIsAiGenerating(false);
    }
  };

  const [isAdmin, setIsAdmin] = useState(false);
  // --- GHOST ADMIN LISTENER ---
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system", "ghost_admin"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.lastInjection) {
          const dismissedDate = localStorage.getItem('dismissedGhostAlert');
          if (dismissedDate === data.lastInjection) {
             setGhostNotification(null);
             return; 
          }

          const injectionDate = new Date(data.lastInjection);
          const now = new Date();
          const diffHours = (now - injectionDate) / (1000 * 60 * 60);
          if (diffHours < 24) setGhostNotification(data);
          else setGhostNotification(null);
        }
      }
    });
    return () => unsub();
  }, []);

  // --- REAL-TIME APPROVAL QUEUE LISTENER ---
  useEffect(() => {
    const q = query(collection(db, "pending_questions")); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveQueue = [];
      snapshot.forEach((doc) => { liveQueue.push({ id: doc.id, ...doc.data() }); });
      setPendingQuestions(liveQueue); 
    });
    return () => unsubscribe();
  }, []);

  // --- INTERCEPT SHARED LINKS ON LOAD ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('examCode');
      if (code) {
        setJoinCode(code);
        setActiveModule('arena');
      }
    }
  }, []);

  // --- UNIFIED REAL-TIME LISTENER FOR PROFILE, ANALYTICS & NOTIFICATIONS ---
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.isLocked) {
          setIsLockedOut(true);
        } else {
          setIsLockedOut(false);
        }

        setIsPremium(data.isPremium || data.isAdmin || false); 
        setIsAdmin(data.isAdmin || false);
        
        if (data.displayName) setProfileName(data.displayName);
        if (data.bio) setProfileBio(data.bio);
        if (data.profilePic) setProfilePic(data.profilePic);
        if (data.flashcards) setUserFlashcards(data.flashcards);
        if (data.activityHistory) setActivityHistory(data.activityHistory);
        
        // Notifications
        const userNotifs = data.notifications || [];
        setNotifications(userNotifs);
        setUnreadCount(userNotifs.filter(n => !n.read).length);
        
        if (data.examSchedule) {
          const sorted = data.examSchedule.sort((a, b) => new Date(a.date) - new Date(b.date));
          setExamSchedule(sorted);
        }

        const totalExams = data.totalExamsTaken || 0;
        let totalGlobalCorrect = 0;
        let totalGlobalAnswered = 0;
        let weakTopicsArray = [];
        let bestSubj = { name: 'N/A', accuracy: 0 };
        let worstSubj = { name: 'N/A', accuracy: 100 };
        
        if (data.topicStats) {
          const topics = Object.entries(data.topicStats).map(([name, stats]) => {
            totalGlobalCorrect += stats.correct || 0;
            totalGlobalAnswered += stats.total || 0;
            const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            return { name, accuracy, total: stats.total, correct: stats.correct };
          });
          
          const attemptedTopics = topics.filter(t => t.total > 0);
          if (attemptedTopics.length > 0) {
            bestSubj = attemptedTopics.reduce((prev, current) => (prev.accuracy > current.accuracy) ? prev : current);
            worstSubj = attemptedTopics.reduce((prev, current) => (prev.accuracy < current.accuracy) ? prev : current);
          }
          
          weakTopicsArray = topics
            .filter(t => t.total >= 1 && t.accuracy < 60)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 3);
        }
        
        const globalAccuracy = totalGlobalAnswered > 0 ? Math.round((totalGlobalCorrect / totalGlobalAnswered) * 100) : 0;
        const totalGlobalFailed = totalGlobalAnswered - totalGlobalCorrect;

        setLiveStats({
          totalExams,
          totalQuestions: totalGlobalAnswered,
          totalPassed: totalGlobalCorrect,
          totalFailed: totalGlobalFailed,
          averageScore: globalAccuracy,
          bestSubject: bestSubj,
          worstSubject: worstSubj,
          weakestTopics: weakTopicsArray
        });
      }
    });
    return () => unsubscribe();
  }, [user]);

  // --- REAL-TIME LEADERBOARD LISTENER ---
  useEffect(() => {
    if (activeModule !== 'leaderboard') return;
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("totalQuestionsAnswered", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const leaders = [];
      querySnapshot.forEach((doc) => { leaders.push({ id: doc.id, ...doc.data() }); });
      setLeaderboardData(leaders);
    });
    return () => unsubscribe();
  }, [activeModule]);

  // --- TIMETABLE LOGIC ---
  const calculateDaysLeft = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const examDate = new Date(dateString);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleAddExam = async () => {
    if (!newExamName || !newExamDate || !user) return;
    const newExam = {
        id: Date.now().toString(),
        name: newExamName,
        date: newExamDate,
        subjectFocus: newExamSubject === 'GENERAL' ? 'GENERAL' : normalizeSubject(newExamSubject)
    };
    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { examSchedule: arrayUnion(newExam) }, { merge: true });
        setIsAddingExam(false);
        setNewExamName('');
        setNewExamDate('');
    } catch(e) { alert("❌ Failed to save exam to your timetable."); }
  };

  const handleDeleteExam = async (examId) => {
    if (!user) return;
    try {
      const updatedSchedule = examSchedule.filter(ex => ex.id !== examId);
      await setDoc(doc(db, "users", user.uid), { examSchedule: updatedSchedule }, { merge: true });
    } catch(e) { alert("❌ Failed to delete exam."); }
  };

  const upcomingExams = examSchedule.filter(ex => calculateDaysLeft(ex.date) >= 0);
  const closestExam = upcomingExams.length > 0 ? upcomingExams[0] : null; 
  const daysToClosest = closestExam ? calculateDaysLeft(closestExam.date) : null;

  // --- PROFILE MANAGEMENT ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1048576) { alert("⚠️ Image is too large. Please select an image under 1MB."); return; }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setProfilePic(base64String);
      try { await setDoc(doc(db, "users", user.uid), { profilePic: base64String }, { merge: true }); } 
      catch (err) { console.error("Failed to upload image:", err); }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        displayName: profileName || user.email?.split('@')[0],
        bio: profileBio,
        accountTier: isPremium ? 'Premium' : 'Standard',
        lastActive: new Date().toISOString(),
        deviceOS: 'Android',
        activityHistory: arrayUnion({
          action: "Updated Identity Protocol",
          date: new Date().toISOString()
        })
      }, { merge: true });
      
      alert("✅ Profile Identity Updated.");
    } catch (error) { 
      alert("❌ Failed to update profile."); 
    } finally { 
      setIsSavingProfile(false); 
    }
  };

  const handleWipeData = async () => {
    if (!user) return;
    const confirmWipe = window.confirm("⚠️ WARNING: This will permanently delete all your exam history, analytics, flashcards, timetable, and accuracy data. Do you want to proceed?");
    if (!confirmWipe) return;
    setIsSavingProfile(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        totalExamsTaken: 0,
        totalQuestionsAnswered: 0,
        topicStats: {},
        flashcards: [],
        examSchedule: []
      }, { merge: true });
      const q = query(collection(db, "examResults"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.forEach((document) => { batch.delete(doc(db, "examResults", document.id)); });
      await batch.commit();
      alert("🗑️ Academic record wiped clean.");
      setActiveModule('hub');
    } catch (error) { alert("❌ Failed to wipe data."); } 
    finally { setIsSavingProfile(false); }
  };

  // --- EXAM SHARING ---
  const handleShareExam = async () => {
    if (activeExamQuestions.length === 0) return;
    try {
      const docRef = await addDoc(collection(db, "sharedExams"), {
        questions: activeExamQuestions,
        duration: examDuration,
        createdAt: new Date().toISOString(),
        creatorId: user?.uid || 'Anonymous',
        creatorName: profileName || 'A Scholar'
      });
      
      const shareUrl = `${window.location.origin}${window.location.pathname}?examCode=${docRef.id}`;
      
      const shareText = `You've been invited to a private CBT session by ${profileName || 'a scholar'}. 📝\n\nPassword: ${docRef.id}\n\nTap the link below to start your exam instantly:`;

      if (navigator.share) {
        try { 
          await navigator.share({ 
            title: 'Private CBT Arena', 
            text: shareText, 
            url: shareUrl 
          }); 
          return; 
        } 
        catch (shareErr) { console.log("User cancelled share or OS blocked it."); }
      }

      const copyToClipboard = () => {
        const textArea = document.createElement("textarea");
        textArea.value = `${shareText}\n\n${shareUrl}`; 
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); textArea.remove(); return true; } 
        catch (err) { textArea.remove(); return false; }
      };

      if (copyToClipboard()) { 
        alert(`✅ Exam Link Copied!\n\nPaste this into WhatsApp or any chat.\nPassword: ${docRef.id}`); 
      } 
      else { 
        window.prompt("Your browser blocked the auto-copy. Manually copy this link:", shareUrl); 
      }
    } catch (error) {
      if (error.code === 'permission-denied') { alert("❌ Permission Denied: Update your Firestore Rules for 'sharedExams'."); } 
      else { alert("❌ Failed to generate share link."); }
    }
  };

  const handleJoinSharedExam = async () => {
    if (!joinCode.trim()) { alert("Please enter a valid exam code."); return; }
    setIsJoining(true);
    try {
      const docRef = doc(db, "sharedExams", joinCode.trim());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setActiveExamQuestions(data.questions);
        setExamDuration(data.duration || 600);
        setCbtTimeLeft(data.duration || 600);
        setFlaggedQuestions(new Set());
        setCbtAnswers({});
        setCbtIndex(0);
        setCbtFinished(false);
        setIsReviewing(false);
        setActiveModule('cbt');
        alert(`Joined exam created by ${data.creatorName || 'a friend'}!`);
      } else { alert("❌ Invalid or expired Exam Code."); }
    } catch (error) { alert("❌ Failed to join exam."); } 
    finally { setIsJoining(false); }
  };

  const handleGlobalRefresh = async () => {
    setIsRefreshing(true);
    await buildFolderTree();      
    await fetchLiveQuestions();   
    setTimeout(() => setIsRefreshing(false), 600); 
  };

  // --- DATABASE ADMIN & LOCAL EXPORT ---
  const fetchLiveQuestions = async () => {
    setIsFetchingLive(true);
    setCurrentPage(1); 
    try {
      const q = query(collection(db, "official_cbt_bank")); 
      const querySnapshot = await getDocs(q);
      const fetched = [];
      querySnapshot.forEach((doc) => { fetched.push({ id: doc.id, ...doc.data() }); });
      setLiveQuestions(fetched);
    } catch (error) { console.error("Failed to fetch live questions:", error); } 
    finally { setIsFetchingLive(false); }
  };

 const fetchAllAppUsers = async () => {
  setIsFetchingUsers(true);
  try {
    const querySnapshot = await getDocs(collection(db, "users")); 
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    setAllAppUsers(users);
  } catch (error) {
    console.error("Error fetching users: ", error);
  } finally {
    setIsFetchingUsers(false);
  }
};

  const fetchPendingQuestions = async () => {
    setIsFetchingPending(true);
    try {
      const q = query(collection(db, "pending_questions"), where("status", "==", "pending"));
      const querySnapshot = await getDocs(q);
      const fetched = [];
      querySnapshot.forEach((doc) => { fetched.push({ id: doc.id, ...doc.data() }); });
      setPendingQuestions(fetched);
    } catch (error) { console.error("Failed to fetch pending questions:", error); } 
    finally { setIsFetchingPending(false); }
  };

  const exportDatabaseLocal = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "official_cbt_bank"));
      const allQuestions = [];
      
      querySnapshot.forEach((doc) => {
        allQuestions.push({ id: doc.id, ...doc.data() });
      });

      if (allQuestions.length === 0) {
        alert("The database is currently empty.");
        return;
      }

      const dataStr = JSON.stringify(allQuestions, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `CBT_Master_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`✅ Successfully exported ${allQuestions.length} questions to your device.`);
    } catch (error) {
      console.error("Export failed:", error);
      alert("❌ Failed to export database.");
    }
  };

  const handleLocalEdit = (id, field, value) => {
    setLiveQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q ));
  };

  const saveClassificationUpdate = async (id, newSubject, newSubTopic) => {
    setUpdatingId(id);
    try {
      const questionRef = doc(db, "official_cbt_bank", id);
      await updateDoc(questionRef, { subject: normalizeSubject(newSubject), subTopic: newSubTopic.toUpperCase() });
      alert("✅ Classification updated!");
      buildFolderTree(); 
    } catch (error) { alert("❌ Failed to update database."); } 
    finally { setUpdatingId(null); }
  };

  const normalizeSubject = (inputSubject) => {
    if (!inputSubject) return "GENERAL";
    let upperInput = inputSubject.toUpperCase();
    if (upperInput.includes('-')) upperInput = upperInput.split('-')[0].trim();
    const coreSubjects = ["CHEMISTRY", "PHYSICS", "BIOLOGY", "MATHEMATICS", "ENGLISH", "ECONOMICS", "GOVERNMENT", "GEOGRAPHY", "COMPUTER SCIENCE", "COMPUTING"];
    for (let core of coreSubjects) { if (upperInput.includes(core)) return core; }
    if (upperInput.includes("GENETICS") || upperInput.includes("ENDOCRINOLOGY") || upperInput.includes("IMMUNOLOGY") || upperInput.includes("PHYSIOLOGY") || upperInput.includes("MICROBIOLOGY")) return "BIOLOGY";
    if (upperInput.includes("THERMODYNAMICS") || upperInput.includes("KINEMATICS") || upperInput.includes("MECHANICS")) return "PHYSICS";
    if (upperInput.includes("CALCULUS") || upperInput.includes("ALGEBRA") || upperInput.includes("GEOMETRY")) return "MATHEMATICS";
    return upperInput;
  };

  const buildFolderTree = async () => {
    try {
      const snap = await getDocs(collection(db, "official_cbt_bank"));
      const hierarchy = {};
      snap.forEach(d => {
        const data = d.data();
        if (data.subject) {
          if (!hierarchy[data.subject]) hierarchy[data.subject] = new Set();
          if (data.subTopic) { hierarchy[data.subject].add(data.subTopic); } 
          else { hierarchy[data.subject].add(data.subject); }
        }
      });
      const formattedHierarchy = {};
      for (const key in hierarchy) { formattedHierarchy[key] = Array.from(hierarchy[key]); }
      setSubjectHierarchy(formattedHierarchy);
    } catch (error) { console.error("Scanner failed:", error); }
  };

  useEffect(() => { buildFolderTree(); }, []);

  const toggleSubTopic = (sub) => { setSelectedSubTopics(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]); };
  
  // 👉 REWRITTEN: "Select All" folder logic matching your new UI
  const toggleEntireFolder = (folderName) => {
    const folderSubTopics = subjectHierarchy[folderName] || [];
    const allSelected = folderSubTopics.every(sub => selectedSubTopics.includes(sub));
    if (allSelected) { 
      setSelectedSubTopics(prev => prev.filter(s => !folderSubTopics.includes(s))); 
    } else { 
      setSelectedSubTopics(prev => Array.from(new Set([...prev, ...folderSubTopics]))); 
    }
  };

  const toggleFlag = (idx) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const handleDeleteSubject = async (subjectToDelete) => {
    if (!window.confirm(`⚠️ DANGER: Are you sure you want to permanently delete ALL questions in the ${subjectToDelete} folder?`)) return;
    setIsDeleting(true);
    try {
      const q = query(collection(db, "official_cbt_bank"), where("subject", "==", subjectToDelete));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      let count = 0;
      snap.forEach((document) => {
        batch.delete(doc(db, "official_cbt_bank", document.id));
        count++;
      });
      await batch.commit();
      buildFolderTree();
      alert(`🗑️ Successfully deleted ${count} questions from ${subjectToDelete}.`);
    } catch (error) { alert("❌ Failed to delete subject bank."); } 
    finally { setIsDeleting(false); }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsBulkUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsedData = JSON.parse(ev.target.result);
        let questionsArray = [];
        let defaultSubject = "GENERAL";
        if (Array.isArray(parsedData)) { questionsArray = parsedData; } 
        else {
          const firstKey = Object.keys(parsedData)[0];
          questionsArray = parsedData[firstKey];
          defaultSubject = firstKey.replace('_', ' ').toUpperCase();
        }
        let successCount = 0;
        for (const item of questionsArray) {
          const questionText = item.q || item.question; 
          const subjectText = item.subject || defaultSubject; 
          if (questionText && item.options && item.answer) {
            await addDoc(collection(db, "official_cbt_bank"), {
              subject: normalizeSubject(subjectText),
              subTopic: subjectText.toUpperCase(),
              q: questionText,
              options: item.options,
              answer: item.answer,
              createdAt: new Date().toISOString()
            });
            successCount++;
          }
        }
        alert(`✅ BULK INJECTION COMPLETE: ${successCount} questions added!`);
        buildFolderTree();
      } catch (error) { alert(`❌ Upload failed: ${error.message}`); } 
      finally { setIsBulkUploading(false); e.target.value = null; }
    };
    reader.readAsText(file);
  };
  
  const handleUserForgeSubmit = async () => {
    if (!forgeData.q || !forgeData.optA || !forgeData.optB || !forgeData.answer || !user) {
      alert("⚠️ Please fill in the question, at least options A & B, and the correct answer.");
      return;
    }
    setIsSubmittingForge(true);
    try {
      const optionsArray = [forgeData.optA, forgeData.optB, forgeData.optC, forgeData.optD].filter(o => o.trim() !== '');
      
      await addDoc(collection(db, "pending_questions"), {
        q: forgeData.q,
        options: optionsArray,
        answer: forgeData.answer,
        subject: normalizeSubject(forgeData.subject),
        submittedBy: user.uid,
        userName: profileName || 'A Scholar',
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      alert("🚀 Question sent to the Forge! If approved by admins, you'll receive 1 hour of Premium.");
      setForgeData({ q: '', optA: '', optB: '', optC: '', optD: '', answer: '', subject: 'GENERAL' });
      setActiveModule('hub');
    } catch (e) { alert("❌ Submission failed."); }
    finally { setIsSubmittingForge(false); }
  };

  const approveQuestion = async (pq) => {
    try {
      const newDoc = { subject: pq.subject, subTopic: pq.subTopic || pq.subject, q: pq.q, options: pq.options, answer: pq.answer, author: pq.userName };
      await addDoc(collection(db, "official_cbt_bank"), newDoc);
      await deleteDoc(doc(db, "pending_questions", pq.id));
      
      if (pq.submittedBy) {
        const userRef = doc(db, "users", pq.submittedBy);
        await updateDoc(userRef, {
          isPremium: true,
          notifications: arrayUnion({
            id: Date.now().toString(),
            title: "Question Approved! 🏆",
            message: `Your ${pq.subject} question was added to the official bank. You've been granted Premium status.`,
            date: new Date().toISOString(),
            read: false
          }),
          activityHistory: arrayUnion({
            action: `Got a ${pq.subject} question approved.`,
            date: new Date().toISOString()
          })
        });
      }
      alert("✅ Question Approved and User Notified!");
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  const rejectQuestion = async (pq) => {
    try {
      await deleteDoc(doc(db, "pending_questions", pq.id));
      if (pq.submittedBy) {
        const userRef = doc(db, "users", pq.submittedBy);
        await updateDoc(userRef, {
          notifications: arrayUnion({
            id: Date.now().toString(),
            title: "Question Rejected ❌",
            message: `Your recent ${pq.subject} submission did not meet the academic standards for the official bank. Keep studying and try again!`,
            date: new Date().toISOString(),
            read: false
          })
        });
      }
      alert("🗑️ Question Rejected and User Notified.");
    } catch (error) {
      console.error("Rejection failed:", error);
    }
  };

 // 👉 NEW: The Report Function
  const handleReportQuestion = async (question, reason) => {
    try {
      await addDoc(collection(db, "reported_questions"), {
        questionId: question.id || "unknown", // Now includes the exact DB ID
        questionText: question.q,
        subject: question.subject,
        subTopic: question.subTopic,
        reportedBy: user?.uid || "unknown",
        reason: reason,
        timestamp: new Date().toISOString(),
        status: 'pending' // Admins can review this later
      });
    // 👉 THE UPDATED MESSAGE
      alert("✅ Thank you! This question has been flagged and will be reviewed by our team shortly.");
    } catch (e) {
      console.error("Report System Error:", e);
      alert("❌ Failed to report question. Please check your connection.");
    }
  };

  // 👉 UPDATED: 10x Faster Fetching Engine
  const handleStartOfficialExam = async () => {
    if (selectedSubTopics.length === 0) { alert("⚠️ Please select at least one Official Subject Bank first!"); return; }

    const currentCount = dailyUsage?.count || 0;
    let finalQuestionCount = questionCount === 'all' ? 50 : parseInt(questionCount); 

    if (!isPremium) {
      if (currentCount >= 40) {
        alert("🔒 You have reached your daily limit of 40 free questions.");
        setShowPremiumModal(true);
        return; 
      }
      const left = 40 - currentCount;
      if (finalQuestionCount > left) {
        alert(`🔒 You only have ${left} free questions left today, but you requested ${finalQuestionCount}. Upgrade to Brilliance Pro to unlock unlimited questions!`);
        setShowPremiumModal(true);
        return; 
      }
    }

    setIsFetchingExam(true);
    try {
      let allQuestions = [];
      
      // 🚀 THE SPEED UPGRADE: Chunking queries into parallel batches of 10
      const chunks = [];
      for (let i = 0; i < selectedSubTopics.length; i += 10) {
          chunks.push(selectedSubTopics.slice(i, i + 10));
      }

      const queryPromises = chunks.map(chunk => {
          const q = query(collection(db, "official_cbt_bank"), where("subTopic", "in", chunk));
          return getDocs(q);
      });

      const snapshots = await Promise.all(queryPromises);
      snapshots.forEach(snap => {
          snap.forEach(doc => {
              allQuestions.push({ id: doc.id, ...doc.data() }); // Grabbing the document ID is crucial for reporting!
          });
      });
      
     

      if (allQuestions.length === 0) { 
        alert(`No questions found for the selected subjects and data source!`); 
        setIsFetchingExam(false); 
        return; 
      }
      
      let processedQuestions = allQuestions;
      if (shuffleQuestions) {
         processedQuestions = processedQuestions.sort(() => 0.5 - Math.random());
      }
      
      const finalExamPayload = processedQuestions.slice(0, finalQuestionCount);
      
      setActiveExamQuestions(finalExamPayload);
      
      // 👉 NEW: Support for 'untimed' exams
      setCbtTimeLeft(examDuration === 0 ? 'untimed' : examDuration); 
      setFlaggedQuestions(new Set());
      setCbtAnswers({});
      setCbtIndex(0);
      setActiveModule('cbt');
      setCbtFinished(false);
      setIsReviewing(false); 
    } catch (error) { 
      console.error(error);
      alert("❌ Failed to fetch the Question Bank. Check your internet connection."); 
    } 
    finally { 
      setIsFetchingExam(false); 
    }
  };

  const triggerTargetDrill = (topicName) => {
    setSelectedSubTopics([topicName]);
    setActiveModule('examSetup');
  };

  // --- CBT SIMULATOR ENGINE ---
  const [cbtIndex, setCbtIndex] = useState(0);
  const [cbtAnswers, setCbtAnswers] = useState({}); 
  const [cbtTimeLeft, setCbtTimeLeft] = useState(600); 
  const [cbtFinished, setCbtFinished] = useState(false);
  const [cbtScore, setCbtScore] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    let timer;
    if (activeModule === 'cbt' && !cbtFinished && cbtTimeLeft > 0) {
      timer = setInterval(() => { setCbtTimeLeft((prev) => prev - 1); }, 1000);
    } else if (cbtTimeLeft === 0 && !cbtFinished && activeExamQuestions.length > 0) {
      handleSubmitCBT(); 
    }
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModule, cbtTimeLeft, cbtFinished, activeExamQuestions]);

  const handleSelectOption = (option) => {
    if (cbtFinished) return;
    setCbtAnswers(prev => ({ ...prev, [cbtIndex]: option }));
  };

  const handleSubmitCBT = () => {
    if (!cbtFinished) {
      let correct = 0;
      const newlyFailedCards = [];
      activeExamQuestions.forEach((q, idx) => { 
        if (cbtAnswers[idx] === q.answer) { correct++; } 
        else { newlyFailedCards.push({ front: q.q, back: q.answer, subject: q.subTopic || q.subject || "General" }); }
      });
      setCbtScore(correct);
      setCbtFinished(true);
      setIsCalculatorOpen(false); 
      saveExamResultsToCloud(correct, newlyFailedCards);
    }
  };

 const markAsRead = async (notifId) => {
    if (notifId === 'ghost_alert') {
      if (ghostNotification?.lastInjection) {
        localStorage.setItem('dismissedGhostAlert', ghostNotification.lastInjection);
      }
      setGhostNotification(null);
      return;
    }
    
    const updatedNotifs = notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    await updateDoc(doc(db, "users", user.uid), { notifications: updatedNotifs });
  };

 const saveExamResultsToCloud = async (finalScore, newlyFailedCards) => {
    if (!user) return; 
    try {
      const topicStats = {};
      activeExamQuestions.forEach((q, idx) => {
        const topic = q.subTopic || q.subject || "General";
        if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0 };
        topicStats[topic].total += 1;
        if (cbtAnswers[idx] === q.answer) topicStats[topic].correct += 1;
      });
      const percentage = Math.round((finalScore / activeExamQuestions.length) * 100);
      const examRecord = { userId: user.uid, score: finalScore, totalQuestions: activeExamQuestions.length, percentage: percentage, topicMastery: topicStats, completedAt: new Date().toISOString() };
      await addDoc(collection(db, "examResults"), examRecord);
      
      const userRef = doc(db, "users", user.uid);
      const todayStr = new Date().toISOString().split('T')[0];
      
      const updates = {
        totalExamsTaken: increment(1),
        totalQuestionsAnswered: increment(activeExamQuestions.length),
        lastActiveDate: todayStr,
        dailyQuestionsAnswered: dailyUsage.date === todayStr ? increment(activeExamQuestions.length) : activeExamQuestions.length
      };
      
      if (newlyFailedCards.length > 0) { updates.flashcards = arrayUnion(...newlyFailedCards); }
      
      Object.entries(topicStats).forEach(([topic, stats]) => {
        updates[`topicStats.${topic}.correct`] = increment(stats.correct);
        updates[`topicStats.${topic}.total`] = increment(stats.total);
      });
      
      await updateDoc(userRef, updates);
    } catch (error) { console.error("🚨 Failed to save exam:", error); }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCalcClick = (val) => {
    if (val === 'C') { setCalcDisplay(''); } 
    else if (val === '=') {
      try {
        // eslint-disable-next-line
        setCalcDisplay(eval(calcDisplay).toString());
      } catch (e) { setCalcDisplay('Err'); }
    } else { setCalcDisplay(prev => (prev === 'Err' ? val : prev + val)); }
  };
  
  // --- FLASHCARD FILTERING LOGIC ---
  const availableSubjects = ["ALL", ...Array.from(new Set(userFlashcards.map(c => c.subject)))];
  
  const filteredCards = flashcardFilter === 'ALL' 
    ? userFlashcards 
    : userFlashcards.filter(c => c.subject === flashcardFilter);

  const cardsToTest = filteredCards.length > 0 
    ? filteredCards 
    : [{ front: "No cards available for this filter.", back: "Complete more CBTs.", subject: "SYSTEM" }];
    
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcardFilter]);

  const handleNextCard = () => { setIsFlipped(false); setTimeout(() => setCurrentIndex(p => p < cardsToTest.length - 1 ? p + 1 : p), 150); };
  const handlePrevCard = () => { setIsFlipped(false); setTimeout(() => setCurrentIndex(p => p > 0 ? p - 1 : 0), 150); };

  const animationStyles = `
    .flashcard-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; }
    .flashcard-flipped .flashcard-inner { transform: rotateY(180deg); }
    .flashcard-front, .flashcard-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; padding: 30px; border-radius: 16px; border: 1px solid #1e293b; }
    .flashcard-front { background-color: #0f172a; color: #f8fafc; }
    .flashcard-back { background-color: #1e293b; color: #38bdf8; transform: rotateY(180deg); }
    .spin-anim { animation: spin 1s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `;

  if (isLockedOut) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#ef4444', fontSize: '3rem', margin: 0 }}>ACCOUNT LOCKED</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginTop: '15px' }}>Your access to this system has been suspended by the Administrator.</p>
        <button onClick={closeExamMode} style={{ marginTop: '30px', background: '#1e293b', border: '1px solid #334155', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Exit App</button>
      </div>
    );
  }

  return (
    <div 
      className="ai-overlay" 
      style={{ 
        zIndex: 2147483647, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: '#020617', display: 'block', overflowY: 'auto',
        WebkitTapHighlightColor: 'transparent', WebkitTouchCallout: 'none', userSelect: 'none', touchAction: 'manipulation' 
      }}
    >
      <style>{animationStyles}</style>

      {/* GLOBAL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid rgba(245, 158, 11, 0.2)', background: '#020617', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Image src="/Drill (1).png" alt="Logo" width={32} height={32} style={{ borderRadius: '8px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveModule('notifications')}>
              {(() => {
                const totalUnread = unreadCount + (isAdmin && ghostNotification ? 1 : 0);
                return (
                  <>
                    <Zap size={20} color={totalUnread > 0 ? "#f59e0b" : "#94a3b8"} />
                    {totalUnread > 0 && (
                      <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid #020617' }}>
                        {totalUnread}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <h2 style={{ margin: 0, color: '#f59e0b', letterSpacing: '2px', fontSize: '1.2rem', textTransform: 'uppercase' }}>
              {activeModule === 'hub' ? 'Protocol' : activeModule.toUpperCase()}
            </h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            {activeModule === 'hub' && (
              <button onClick={() => setActiveModule('profile')} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', borderRadius: '8px', transition: 'all 0.2s' }}>
                <Settings size={18} />
              </button>
            )}

            {activeModule !== 'hub' && (
              <button onClick={() => setActiveModule('hub')} style={{ background: 'transparent', border: '1px solid #64748b', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', padding: '8px 15px', borderRadius: '8px' }}>
                <ArrowLeft size={18} /> HUB
              </button>
            )}
            <button onClick={closeExamMode} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', padding: '8px 15px', borderRadius: '8px' }}>
              <X size={18} /> EXIT
            </button>
        </div>
      </div>

      {/* THE MAIN HUB */}
      {activeModule === 'hub' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '1000px', margin: '40px auto 100px auto', width: '100%', padding: '0 20px' }}>
          
          {closestExam && daysToClosest <= 7 && (
            <div style={{ width: '100%', maxWidth: '1000px', background: daysToClosest <= 3 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', border: `1px solid ${daysToClosest <= 3 ? '#ef4444' : '#f59e0b'}`, padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h3 style={{ margin: 0, color: daysToClosest <= 3 ? '#ef4444' : '#f59e0b', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldAlert size={20} /> 
                        {daysToClosest === 0 ? "URGENT: EXAM IS TODAY" : `URGENT: ${daysToClosest} DAYS TO ${closestExam.name.toUpperCase()}`}
                    </h3>
                    <p style={{ margin: '5px 0 0 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                        Protocol dictates prioritizing <strong style={{ color: '#fff' }}>{closestExam.subjectFocus}</strong> drills immediately.
                    </p>
                </div>
                <button 
                    onClick={() => triggerTargetDrill(closestExam.subjectFocus)}
                    style={{ padding: '10px 20px', background: daysToClosest <= 3 ? '#ef4444' : '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    INITIATE DRILL
                </button>
            </div>
          )}

          <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '10px', textAlign: 'center' }}>Select Training Module</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '40px', textAlign: 'center' }}>Choose your preparation protocol.</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%', marginBottom: '40px', justifyContent: 'center' }}>
            <div onClick={() => setActiveModule('examSetup')} style={{ minWidth: '250px', flex: '1', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '16px', padding: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.1)' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '20px', borderRadius: '50%' }}><Timer size={30} color="#f59e0b" /></div>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.3rem' }}>CBT Simulator</h3>
            </div>
            
            <div onClick={() => setActiveModule('analytics')} style={{ minWidth: '250px', flex: '1', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #8b5cf6', borderRadius: '16px', padding: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '20px', borderRadius: '50%' }}><Zap size={30} color="#8b5cf6" /></div>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.3rem' }}>Command Center</h3>
            </div>
            
            <div onClick={() => setActiveModule('arena')} style={{ minWidth: '250px', flex: '1', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(236, 72, 153, 0.5)', borderRadius: '16px', padding: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '20px', borderRadius: '50%' }}><Users size={30} color="#ec4899" /></div>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.3rem' }}>Shared Arena</h3>
            </div>

            <div onClick={() => setActiveModule('rapid')} style={{ minWidth: '250px', flex: '1', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #3b82f6', borderRadius: '16px', padding: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px', position: 'relative', overflow: 'hidden' }}>
              {userFlashcards.length > 0 && (
                <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {userFlashcards.length} Vaulted
                </div>
              )}
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '50%' }}><Zap size={30} color="#3b82f6" /></div>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.3rem' }}>Rapid Fire</h3>
            </div>
            
            <div onClick={() => setActiveModule('leaderboard')} style={{ minWidth: '250px', flex: '1', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', padding: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '50%' }}><Trophy size={30} color="#10b981" /></div>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '1.3rem' }}>Leaderboard</h3>
            </div>

            <div onClick={() => setActiveModule('forge')} style={{ minWidth: '250px', flex: '1', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(234, 88, 12, 0.1))', border: '1px solid #f59e0b', borderRadius: '16px', padding: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '20px', borderRadius: '50%' }}><PenTool size={30} color="#f59e0b" /></div>
              <h3 style={{ color: '#f59e0b', margin: 0, fontSize: '1.3rem' }}>Community Forge</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Submit questions for Premium.</p>
            </div>
          </div>

        {/* ONLY SHOW ADMIN DASHBOARD TO DATABASE-VERIFIED ADMINS */}
          {isAdmin && (
            <button onClick={() => setActiveModule('admin')} style={{ width: '100%', padding: '15px', background: 'rgba(56, 189, 248, 0.1)', border: '1px dashed #38bdf8', color: '#38bdf8', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Zap size={18} /> ADMIN DASHBOARD
            </button>
          )}
        </div>
      )}

      {/* USER FORGE MODULE (SUBMIT QUESTIONS) */}
      {activeModule === 'forge' && (
        <CommunityForge 
          forgeData={forgeData} 
          setForgeData={setForgeData} 
          subjectHierarchy={subjectHierarchy} 
          handleUserForgeSubmit={handleUserForgeSubmit} 
          isSubmittingForge={isSubmittingForge} 
          generateAiQuestion={generateAiQuestion} 
          isAiGenerating={isAiGenerating} 
        />
      )}

      {/* LIVE ANALYTICS MODULE & STRATEGIC TIMETABLE */}
      {activeModule === 'analytics' && (
        <CommandCenter 
          liveStats={liveStats}
          examSchedule={examSchedule}
          isAddingExam={isAddingExam}
          setIsAddingExam={setIsAddingExam}
          newExamName={newExamName}
          setNewExamName={setNewExamName}
          newExamDate={newExamDate}
          setNewExamDate={setNewExamDate}
          newExamSubject={newExamSubject}
          setNewExamSubject={setNewExamSubject}
          subjectHierarchy={subjectHierarchy}
          handleAddExam={handleAddExam}
          calculateDaysLeft={calculateDaysLeft}
          triggerTargetDrill={triggerTargetDrill}
          handleDeleteExam={handleDeleteExam}
          setActiveModule={setActiveModule}
        />
      )}

      {activeModule === 'arena' && (
        <SharedArena 
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          handleJoinSharedExam={handleJoinSharedExam}
          isJoining={isJoining}
        />
      )}

      {activeModule === 'rapid' && (
        <RapidFire 
          flashcardFilter={flashcardFilter}
          setFlashcardFilter={setFlashcardFilter}
          availableSubjects={availableSubjects}
          cardsToTest={cardsToTest}
          currentCardIndex={currentCardIndex}
          isFlipped={isFlipped}
          setIsFlipped={setIsFlipped}
          handlePrevCard={handlePrevCard}
          handleNextCard={handleNextCard}
        />
      )}

     {activeModule === 'profile' && (
        <UserProfile 
          fileInputRef={fileInputRef}
          handleImageUpload={handleImageUpload}
          profilePic={profilePic}
          profileName={profileName}
          setProfileName={setProfileName}
          profileBio={profileBio}
          setProfileBio={setProfileBio}
          handleSaveProfile={handleSaveProfile}
          isSavingProfile={isSavingProfile}
          handleWipeData={handleWipeData}
        />
      )}

      {activeModule === 'leaderboard' && (
        <Leaderboard 
          leaderboardData={leaderboardData}
          user={user}
        />
      )}

     {activeModule === 'notifications' && (() => {
        const displayNotifications = [...notifications];
        if (isAdmin && ghostNotification) {
          displayNotifications.unshift({
            id: 'ghost_alert',
            title: 'Ghost Admin: Database Sync ⚡',
            message: ghostNotification.message,
            date: ghostNotification.lastInjection,
            read: false
          });
        }
        return <NotificationCenter notifications={displayNotifications} markAsRead={markAsRead} />;
      })()}

      {/* ADMIN DASHBOARD */}
      {activeModule === 'admin' && (
        <AdminDashboard 
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          fetchAllAppUsers={fetchAllAppUsers}
          isFetchingUsers={isFetchingUsers}
          allAppUsers={allAppUsers}
          exportDatabaseLocal={exportDatabaseLocal}
          fetchPendingQuestions={fetchPendingQuestions}
          isFetchingPending={isFetchingPending}
          pendingQuestions={pendingQuestions}
          approveQuestion={approveQuestion}
          rejectQuestion={rejectQuestion}
          subjectHierarchy={subjectHierarchy}
          handleDeleteSubject={handleDeleteSubject}
          isDeleting={isDeleting}
          handleBulkUpload={handleBulkUpload}
          isBulkUploading={isBulkUploading}
          fetchLiveQuestions={fetchLiveQuestions}
          isFetchingLive={isFetchingLive}
          liveQuestions={liveQuestions}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleLocalEdit={handleLocalEdit}
          saveClassificationUpdate={saveClassificationUpdate}
          updatingId={updatingId}
        />
      )}

      {/* EXAM SETUP */}
      {activeModule === 'examSetup' && (
        <ExamSetup 
          handleGlobalRefresh={handleGlobalRefresh}
          isRefreshing={isRefreshing}
          subjectHierarchy={subjectHierarchy}
          expandedFolder={expandedFolder}
          setExpandedFolder={setExpandedFolder}
          selectedSubTopics={selectedSubTopics}
          toggleEntireFolder={toggleEntireFolder}
          toggleSubTopic={toggleSubTopic}
          examDuration={examDuration}
          setExamDuration={setExamDuration}
          questionCount={questionCount}
          setQuestionCount={setQuestionCount}
          handleStartOfficialExam={handleStartOfficialExam}
          isFetchingExam={isFetchingExam}
          // 👉 NEW PROPS PASSED TO EXAM SETUP
          shuffleQuestions={shuffleQuestions}
          setShuffleQuestions={setShuffleQuestions}
          shuffleOptions={shuffleOptions}
          setShuffleOptions={setShuffleOptions}
          questionSource={questionSource}
          setQuestionSource={setQuestionSource}
          strictMode={strictMode}
          setStrictMode={setStrictMode}
          instantFeedback={instantFeedback}
          setInstantFeedback={setInstantFeedback}
          isAdmin={isAdmin}
          userData={user}
        />
      )}

      {/* THE CBT SIMULATOR */}
      {activeModule === 'cbt' && (
        <CbtSimulator 
          cbtFinished={cbtFinished} 
          setCbtFinished={setCbtFinished} 
          activeExamQuestions={activeExamQuestions} 
          cbtIndex={cbtIndex} 
          setCbtIndex={setCbtIndex} 
          cbtAnswers={cbtAnswers} 
          setCbtAnswers={setCbtAnswers} 
          flaggedQuestions={flaggedQuestions} 
          toggleFlag={toggleFlag} 
          isCalculatorOpen={isCalculatorOpen} 
          setIsCalculatorOpen={setIsCalculatorOpen} 
          cbtTimeLeft={cbtTimeLeft} 
          formatTime={formatTime} 
          calcDisplay={calcDisplay} 
          handleCalcClick={handleCalcClick} 
          handleShareExam={handleShareExam} 
          handleSelectOption={handleSelectOption} 
          handleSubmitCBT={handleSubmitCBT} 
          cbtScore={cbtScore} 
          isReviewing={isReviewing} 
          setIsReviewing={setIsReviewing} 
          setActiveModule={setActiveModule} 
          strictMode={strictMode}
          instantFeedback={instantFeedback}
          shuffleOptions={shuffleOptions}
          isAdmin={isAdmin} // 👈 ADD THIS SO YOU CAN SEE THE BADGES
          handleReportQuestion={handleReportQuestion} // 👈 ADD THIS SO THE BUTTON WORKS
        />
      )}

      {showPremiumModal && <PremiumModal user={user} onClose={() => setShowPremiumModal(false)} />}
    </div>
  );
};

export default ExamMode;