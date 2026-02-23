import { db } from './firebase';
import { collection, addDoc, getDocs, query, doc, getDoc, orderBy, setDoc, deleteDoc } from 'firebase/firestore';

export const saveInterviewReport = async (userId, reportData) => {
    try {
        if (!userId) throw new Error("User must be logged in to save report");

        const reportsRef = collection(db, "users", userId, "interviews");
        const docRef = await addDoc(reportsRef, {
            ...reportData,
            createdAt: new Date().toISOString()
        });

        return docRef.id;
    } catch (error) {
        console.error("Error saving report to Firestore:", error);
        throw error;
    }
};

export const saveUserProfile = async (userId, profileData) => {
    try {
        if (!userId) return;
        const userRef = doc(db, "users", userId);
        // Using setDoc with merge: true will create the document if it doesn't exist,
        // and only update the specified fields if it does.
        await setDoc(userRef, {
            ...profileData,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (error) {
        console.error("Error saving user profile:", error);
        throw error;
    }
};

export const getUserInterviews = async (userId) => {
    try {
        if (!userId) return [];

        const reportsRef = collection(db, "users", userId, "interviews");
        // We'll skip server orderBy because firebase requires an index. We sort client side below.
        const q = query(reportsRef);

        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Remove duplicates if client accidentally saved multiple times
        // A unique interview is identified by matching stringified history length/content and approximate time
        const uniqueMapping = new Map();

        results.forEach(record => {
            // Let's use history string as a unique signature for this specific interview interaction
            const sig = record.history ? JSON.stringify(record.history.map(h => h.question)) : record.id;
            if (!uniqueMapping.has(sig)) {
                uniqueMapping.set(sig, record);
            } else {
                // if we already have it, keep the newer one
                const existing = uniqueMapping.get(sig);
                if (new Date(record.createdAt) > new Date(existing.createdAt)) {
                    uniqueMapping.set(sig, record);
                }
            }
        });

        const uniqueResults = Array.from(uniqueMapping.values());
        return uniqueResults.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } catch (error) {
        console.error("Error fetching interviews:", error);
        return [];
    }
};

export const deleteInterview = async (userId, interviewId) => {
    try {
        if (!userId || !interviewId) return false;
        const docRef = doc(db, "users", userId, "interviews", interviewId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error deleting interview:", error);
        return false;
    }
};

export const getInterviewById = async (userId, interviewId) => {
    try {
        if (!userId || !interviewId) return null;

        const docRef = doc(db, "users", userId, "interviews", interviewId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() };
        }
        return null;
    } catch (error) {
        console.error("Error fetching interview details:", error);
        return null;
    }
};
