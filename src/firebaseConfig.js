import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
    apiKey: "AIzaSyBbkb6YFP3GSIqpEiceENi-P0eExGfviDE",
    authDomain: "signin-autumn.firebaseapp.com",
    databaseURL: "https://signin-autumn-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "signin-autumn",
    storageBucket: "signin-autumn.appspot.com",
    messagingSenderId: "34435020647",
    appId: "1:34435020647:web:3e8bbe6846af664072e1c2"
};

export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);