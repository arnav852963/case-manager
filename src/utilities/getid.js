import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
        apiKey: "AIzaSyCtbmdq4623z7o-_y8DeraCaPbQQNCIiKI",
        authDomain: "casemanagement-510e8.firebaseapp.com",
        projectId: "casemanagement-510e8",
        storageBucket: "casemanagement-510e8.firebasestorage.app",
        messagingSenderId: "149505651579",
        appId: "1:149505651579:web:a831f28dcaa6319eab03de",
        measurementId: "G-VMW97WWHVY"
    }



;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = "arnavticku01@gmail.com";
const password = "Arnav@123";


signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
        const idToken = await userCredential.user.getIdToken();
        console.log("✅ ID Token:", idToken);
    })
    .catch((error) => {
        console.error("Error:", error.message);
    });
