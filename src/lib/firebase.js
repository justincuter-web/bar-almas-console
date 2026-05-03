import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyCeomRiU4mDAn0mAhEwK6I0Nd0Nsa-68-Q',
  authDomain: 'bar-almas.firebaseapp.com',
  databaseURL: 'https://bar-almas-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'bar-almas',
  storageBucket: 'bar-almas.firebasestorage.app',
  messagingSenderId: '995111640196',
  appId: '1:995111640196:web:b53ac00a9443f9cf9ff6d1',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
