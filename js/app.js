// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA5GREw_mQkbNEN_E8B_cuK3uXGVJv5A70",
  authDomain: "rasel-2bc19.firebaseapp.com",
  projectId: "rasel-2bc19",
  storageBucket: "rasel-2bc19.firebasestorage.app",
  messagingSenderId: "361825402250",
  appId: "1:361825402250:web:a6f7b83ad0ef97bef09c73",
  measurementId: "G-TT9KJT23DW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// إرسال رسالة
const sendBtn = document.getElementById('sendBtn');
if(sendBtn){
  sendBtn.addEventListener('click', async () => {
    const msgInput = document.getElementById('messageInput');
    const msg = msgInput.value;
    if(msg.trim() !== ""){
      await addDoc(collection(db, 'chats/chat1/messages'), {
        sender_id: 'user1',
        text: msg,
        timestamp: serverTimestamp()
      });
      msgInput.value = '';
    }
  });
}

// جلب الرسائل realtime
const messagesDiv = document.getElementById('messages');
if(messagesDiv){
  const messagesRef = collection(db, 'chats/chat1/messages');
  const q = query(messagesRef, orderBy('timestamp'));
  onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement('div');
      div.textContent = `${data.sender_id}: ${data.text}`;
      messagesDiv.appendChild(div);
    });
  });
}
